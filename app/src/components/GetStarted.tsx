// src/components/GetStarted.tsx
import React from 'react';
import { Plus, Users, Sparkles, MessageSquare, Code } from 'lucide-react';
import ConversationalGenerator from './ConversationalGenerator';
import { CompleteAgent } from '@utils/agent_database';
import { getOllamaServerAddress } from '@utils/main_loop';
import type { TokenProvider } from '@utils/main_loop';

interface GetStartedProps {
  onExploreCommunity: () => void;
  onCreateNewAgent: () => void;
  onAgentGenerated: (agent: CompleteAgent, code: string) => void;
  getToken: TokenProvider;
  isAuthenticated: boolean;
}

const GetStarted: React.FC<GetStartedProps> = ({
  onExploreCommunity,
  onCreateNewAgent,
  onAgentGenerated,
  getToken,
  isAuthenticated
}) => {
  const { host, port } = getOllamaServerAddress();
  const serverUrl = port ? `${host}:${port}` : host;
  
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Create Agent</h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main AI Builder */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Agent Builder</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connected to {serverUrl} • Describe what you want your agent to do
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <ConversationalGenerator 
                  onAgentGenerated={onAgentGenerated} 
                  getToken={getToken}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>

          {/* Side Actions */}
          <div className="space-y-4">
            <div
              onClick={onExploreCommunity}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Community</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse and use pre-built agents from the community
              </p>
            </div>

            <div
              onClick={onCreateNewAgent}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Build Custom</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an agent manually with full control over its behavior
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
