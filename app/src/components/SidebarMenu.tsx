// src/components/SidebarMenu.tsx
import React from 'react';
import { X, Home, Users, Database, Settings, Video, Server } from 'lucide-react';
import { Logger } from '@utils/logging';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange
}) => {
  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    Logger.info('NAVIGATION', `Navigated to ${tab} tab`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Observer</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleTabClick('myAgents')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'myAgents' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>My Agents</span>
              </button>
            </li>
            {/* --- NEW RECORDINGS TAB --- */}
            <li>
              <button
                onClick={() => handleTabClick('recordings')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'recordings' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Video className="h-5 w-5" />
                <span>Recordings</span>
              </button>
            </li>
            {/* ------------------------- */}
            <li>
              <button
                onClick={() => handleTabClick('community')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'community' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Community</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabClick('models')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'models' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Database className="h-5 w-5" />
                <span>Models</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleTabClick('obServer')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'obServer' 
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Server className="h-5 w-5" />
                <span>Ob-Server</span>
              </button>
            </li>

            <li>
              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md ${
                  activeTab === 'settings' 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
            </li>

          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          Observer v0.1.0
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
