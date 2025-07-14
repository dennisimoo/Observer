// src/components/AgentImportHandler.tsx

import { RotateCw, MessageSquare, Code, Sparkles } from 'lucide-react';

interface AgentImportHandlerProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onGenerateUsingAI: () => void;
  onBuildCustom: () => void;
}

const AgentImportHandler = ({
  isRefreshing,
  onRefresh,
  onGenerateUsingAI,
  onBuildCustom
}: AgentImportHandlerProps) => {

  const handleGenerateUsingAI = () => {
    // Refresh models first, then open AI generator
    window.dispatchEvent(new Event('refreshConversationalModels'));
    onGenerateUsingAI();
  };

  const handleBuildCustom = () => {
    // Refresh models first, then open custom builder
    window.dispatchEvent(new Event('refreshConversationalModels'));
    onBuildCustom();
  };

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGenerateUsingAI}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Using AI</span>
            </button>
            
            <button
              onClick={handleBuildCustom}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Code className="h-4 w-4" />
              <span>Build Custom</span>
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Refresh agents"
          >
            <RotateCw className={`h-5 w-5 text-gray-600 dark:text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentImportHandler;
