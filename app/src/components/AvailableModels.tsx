import React, { useState, useEffect } from 'react';
import { listModels, Model } from '@utils/ollamaServer'; // Import updated Model interface
import { Cpu, RefreshCw, Eye } from 'lucide-react'; // <-- Import Eye icon
import { Logger } from '@utils/logging';
import { getOllamaServerAddress } from '@utils/main_loop';
import TerminalModal from '@components/TerminalModal';

// No need to redefine Model interface here if imported correctly

const AvailableModels: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);

    try {
      Logger.info('MODELS', 'Fetching available models from server');
      const { host, port } = getOllamaServerAddress();
      Logger.info('MODELS', `Using server address: ${host}:${port}`);

      const response = await listModels(host, port); // Uses updated listModels

      if (response.error) {
        throw new Error(response.error);
      }

      setModels(response.models);
      Logger.info('MODELS', `Successfully loaded ${response.models.length} models`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      Logger.error('MODELS', `Failed to fetch models: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchModels();
  };

  if (loading && !refreshing) {
    // ... (loading state remains the same)
    return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin mb-4">
            <Cpu className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading available models...</p>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Available Models</h2>
        <div className="flex items-center gap-2">
          {getOllamaServerAddress().host !== 'api.observer-ai.com' && (
            <button
              onClick={() => setShowTerminal(true)}
              className="px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
            >
              Add Model
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
              refreshing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error ? (
        // ... (error display remains the same)
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
           <p className="text-red-700 dark:text-red-400">Error: {error}</p>
           <p className="text-sm text-red-600 dark:text-red-400 mt-1">
             Check that your server is running properly and try again.
           </p>
         </div>
      ) : models.length === 0 ? (
        // ... (no models display remains the same)
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-yellow-700 dark:text-yellow-400">No models found on the server.</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Ensure that your server is properly configured and has models available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start mb-2">
                <Cpu className="h-5 w-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white break-words">{model.name}</h3>
                  {/* Container for parameter size and multimodal icon */}
                  <div className="flex items-center flex-wrap mt-1">
                    {model.parameterSize && model.parameterSize !== "N/A" && (
                      <span className="inline-block mr-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {model.parameterSize}
                      </span>
                    )}
                    {/* Conditionally render the Eye icon if multimodal is true */}
                    {model.multimodal && (
                      <span title="Supports Multimodal Input" className="inline-block text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                        <Eye className="h-3.5 w-3.5 inline-block mr-1 -mt-px" />
                        Vision
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ... (footer text remains the same) ... */}
       <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
         <p>
           These models are available on your configured model server.
           You can use them in your agents by specifying their name.
         </p>
      </div>
      <TerminalModal isOpen={showTerminal} onClose={() => setShowTerminal(false)} />
    </div>
  );
};

export default AvailableModels;
