import { useState, useEffect, useMemo } from 'react';
import { getAllRecordings, deleteRecording } from '@utils/recordingsDB'; // Assuming deleteRecording exists
import ClipPlayer from '@components/ClipPlayer';
import { Play, ChevronUp, Download, Trash2, Clock } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

// --- TYPE DEFINITIONS ---
interface ClipMarker {
  label: string;
  timestamp: number;
}
interface RecordingData {
  id: string;
  blob: Blob;
  createdAt: Date; // Important: ensure this is a Date object
  metadata: ClipMarker[];
}


// --- HELPER FUNCTION ---
const groupRecordingsByDate = (recordings: RecordingData[]) => {
    const groups: { [key: string]: RecordingData[] } = {};
    const sortedRecordings = [...recordings].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    sortedRecordings.forEach(rec => {
        const date = rec.createdAt;
        let groupKey: string;

        if (isToday(date)) {
            groupKey = 'Today';
        } else if (isYesterday(date)) {
            groupKey = 'Yesterday';
        } else if (isThisWeek(date, { weekStartsOn: 1 })) {
            groupKey = 'This Week';
        } else {
            groupKey = format(date, 'MMMM d, yyyy');
        }
        
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(rec);
    });
    return groups;
};


// --- MAIN COMPONENT ---
export default function RecordingsViewer() {
    const [recordings, setRecordings] = useState<RecordingData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedRecordingId, setExpandedRecordingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const allRecs = await getAllRecordings();
                // Ensure createdAt is a Date object for reliable sorting and formatting
                const formattedRecs = allRecs.map(rec => ({
                  ...rec,
                  createdAt: rec.createdAt instanceof Date ? rec.createdAt : new Date(rec.createdAt),
                }));
                setRecordings(formattedRecs);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(`Failed to load recordings: ${msg}`);
            }
        };
        fetchRecordings();
    }, []);

    const groupedRecordings = useMemo(() => groupRecordingsByDate(recordings), [recordings]);

    const handleToggleExpand = (id: string) => {
        setExpandedRecordingId(prevId => (prevId === id ? null : id));
    };

    const handleDownload = (e: React.MouseEvent, recording: RecordingData) => {
        e.stopPropagation(); // Prevent card from toggling
        const url = URL.createObjectURL(recording.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Observer-Recording-${recording.createdAt.toISOString()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent card from toggling
        if (window.confirm('Are you sure you want to permanently delete this recording?')) {
            try {
                await deleteRecording(id);
                setRecordings(prev => prev.filter(rec => rec.id !== id));
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(`Failed to delete recording: ${msg}`);
            }
        }
    };

    if (error) {
        return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
    }

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Recordings</h1>
            
            {recordings.length > 0 ? (
                Object.entries(groupedRecordings).map(([groupTitle, groupRecordings]) => (
                    <div key={groupTitle} className="mb-6">
                        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">{groupTitle}</h2>
                        {groupRecordings.map(recording => {
                            const isExpanded = expandedRecordingId === recording.id;
                            return (
                                <div key={recording.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-3 overflow-hidden transition-shadow hover:shadow-md">
                                    <header 
                                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => handleToggleExpand(recording.id)}
                                    >
                                        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                            <Clock size={16} />
                                            <span>Recording at {format(recording.createdAt, 'p')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                                                title={isExpanded ? 'Collapse' : 'Play'}
                                            >
                                                {isExpanded ? <ChevronUp size={20} /> : <Play size={20} />}
                                            </button>
                                            <button 
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                                                title="Download"
                                                onClick={(e) => handleDownload(e, recording)}
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button 
                                                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                                title="Delete"
                                                onClick={(e) => handleDelete(e, recording.id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </header>
                                    <div className={`border-t border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        {/* The player is now always rendered, just hidden by the parent div's style */}
                                        <ClipPlayer recording={recording} />
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                    No recordings found. Start an agent and use the recording tools to create one!
                </p>
            )}
        </div>
    );
}
