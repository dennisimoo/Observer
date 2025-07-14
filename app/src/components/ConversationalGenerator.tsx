// src/components/ConversationalGenerator.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Save, Clipboard, ChevronDown, Brain, AlertTriangle, X } from 'lucide-react';
import { sendPrompt } from '@utils/sendApi';
import { CompleteAgent } from '@utils/agent_database';
import { extractAgentConfig, parseAgentResponse } from '@utils/agentParser';
import getConversationalSystemPrompt from '@utils/conversational_system_prompt';
import { getOllamaServerAddress } from '@utils/main_loop';
import { listModels, Model } from '@utils/ollamaServer';
import type { TokenProvider } from '@utils/main_loop';

// Define the shape of a message
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai' | 'system';
}

// Props are now simpler
interface ConversationalGeneratorProps {
  onAgentGenerated: (agent: CompleteAgent, code: string) => void;
  getToken: TokenProvider;
  isAuthenticated: boolean; 
}

const ConversationalGenerator: React.FC<ConversationalGeneratorProps> = ({ 
  onAgentGenerated, 
  getToken, 
  isAuthenticated 
}) => {
  // --- ALL HOOKS ARE AT THE TOP LEVEL ---
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: "Hi there! I'm Observer's agent builder. What would you like to create today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy System Prompt');
  const [availableModel, setAvailableModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [currentServerAddress, setCurrentServerAddress] = useState<string>('');
  const [isCloudServer, setIsCloudServer] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [showExperimentalAlert, setShowExperimentalAlert] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Allow using the builder only if models are available
  const canUseBuilder = availableModel || isLoadingModel;

  // Load saved input on component mount
  useEffect(() => {
    const savedInput = localStorage.getItem('observer-agent-builder-input');
    if (savedInput) {
      setUserInput(savedInput);
    }
  }, []);

  // Save input to localStorage whenever it changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userInput.trim()) {
        localStorage.setItem('observer-agent-builder-input', userInput);
      } else {
        localStorage.removeItem('observer-agent-builder-input');
      }
    }, 500); // Debounce to avoid excessive localStorage writes

    return () => clearTimeout(timeoutId);
  }, [userInput]);

  // Consolidated model fetching function
  const fetchModels = async () => {
    try {
      setIsLoadingModel(true);
      const { host, port } = getOllamaServerAddress();
      const serverAddress = port ? `${host}:${port}` : host;
      
      // Update tracked server address
      setCurrentServerAddress(serverAddress);
      
      // Check if this is a cloud server (more robust detection)
      const isCloud = host.includes('api.observer-ai.com');
      setIsCloudServer(isCloud);
      
      // Debug logging for server detection
      console.log('🌐 Server Detection:', {
        host,
        port,
        serverAddress,
        isCloud,
        detectedAs: isCloud ? 'Cloud Server' : 'Local Server'
      });
      
      const result = await listModels(host, port);
      
      if (result.error) {
        console.error('Failed to fetch models:', result.error);
        setAvailableModels([]);
        setAvailableModel('');
      } else if (result.models.length > 0) {
        let modelsToUse = result.models;
        
        if (isCloud) {
          // For cloud servers, ensure gemini-2.0-flash-lite is in the list even if API doesn't return it
          const hasGemini2 = result.models.find(m => m.name === 'gemini-2.0-flash-lite');
          if (!hasGemini2) {
            modelsToUse = [{ name: 'gemini-2.0-flash-lite' }, ...result.models];
          }
        }
        
        setAvailableModels(modelsToUse);
        
        if (isCloud) {
          // For cloud servers, always use gemini-2.0-flash-lite (it works even if not in models list)
          const savedModel = localStorage.getItem('observer-cloud-model-choice');
          if (savedModel) {
            setAvailableModel(savedModel);
          } else {
            // Always default to gemini-2.0-flash-lite for cloud servers
            setAvailableModel('gemini-2.0-flash-lite');
          }
        } else {
          // For local servers, load saved model choice or use first available
          const savedModel = localStorage.getItem('observer-local-model-choice');
          const savedModelExists = savedModel && result.models.find(m => m.name === savedModel);
          setAvailableModel(savedModelExists ? savedModel : result.models[0].name);
        }
      } else {
        setAvailableModels([]);
        setAvailableModel('');
      }
    } catch (err) {
      console.error('Error fetching models:', err);
      setAvailableModels([]);
      setAvailableModel('');
    } finally {
      setIsLoadingModel(false);
    }
  };

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Monitor server address changes more efficiently
  useEffect(() => {
    const checkServerAddress = () => {
      const { host, port } = getOllamaServerAddress();
      const serverAddress = port ? `${host}:${port}` : host;
      
      if (currentServerAddress && serverAddress !== currentServerAddress) {
        // Server address changed, refetch models
        fetchModels();
      }
    };

    // Check immediately and then set up interval with longer delay
    checkServerAddress();
    const interval = setInterval(checkServerAddress, 5000); // Check every 5 seconds instead of 1
    
    return () => clearInterval(interval);
  }, [currentServerAddress]);

  // Listen for external refresh requests
  useEffect(() => {
    const handleRefresh = () => {
      fetchModels();
    };

    window.addEventListener('refreshConversationalModels', handleRefresh);
    return () => window.removeEventListener('refreshConversationalModels', handleRefresh);
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (isInitialLoad) {
      // On initial load, mark as loaded but don't auto-scroll
      setIsInitialLoad(false);
      return;
    }

    // Always auto-scroll to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Function to dismiss experimental alert
  const dismissExperimentalAlert = () => {
    setShowExperimentalAlert(false);
    localStorage.setItem('observer-local-ai-builder-alert-seen', 'true');
  };

  // Show experimental alert for local AI agent builder (one time only)
  useEffect(() => {
    if (!isCloudServer && availableModel && !isLoadingModel) {
      const hasSeenAlert = localStorage.getItem('observer-local-ai-builder-alert-seen');
      if (!hasSeenAlert) {
        console.log('🚨 Showing experimental alert for local AI Agent Builder');
        setShowExperimentalAlert(true);
        
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => {
          console.log('⏰ Auto-dismissing experimental alert after 10 seconds');
          dismissExperimentalAlert();
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    } else if (isCloudServer) {
      // Ensure alert is hidden for cloud servers
      setShowExperimentalAlert(false);
    }
  }, [isCloudServer, availableModel, isLoadingModel]);



  // This function is now used for the unauthenticated state
  const handleCopyPrompt = async () => {
    const promptText = getConversationalSystemPrompt(availableModels.map(m => m.name));
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy System Prompt'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Copy Failed!');
      setTimeout(() => setCopyButtonText('Copy System Prompt'), 2000);
    }
  };

  // Handle model selection for all servers
  const handleModelSelect = (modelName: string) => {
    setAvailableModel(modelName);
    setIsModelDropdownOpen(false);
    
    // Save choice to localStorage with different keys for cloud vs local
    const storageKey = isCloudServer ? 'observer-cloud-model-choice' : 'observer-local-model-choice';
    localStorage.setItem(storageKey, modelName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModelDropdownOpen && event.target && !(event.target as Element).closest('.model-dropdown')) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isModelDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard against submission if busy, empty input, or still loading model
    if (!userInput.trim() || isLoading || isLoadingModel || !availableModel) return;

    const newUserMessage: Message = { id: Date.now(), sender: 'user', text: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    localStorage.removeItem('observer-agent-builder-input'); // Clear saved input after sending
    setIsLoading(true);

    const conversationHistory = updatedMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const fullPrompt = `${getConversationalSystemPrompt(availableModels.map(m => m.name))}\n${conversationHistory}\nai:`;

    try {
      const { host, port } = getOllamaServerAddress();
      
      // Try to get token if user is authenticated, but don't require it
      let token: string | undefined;
      if (isAuthenticated) {
        try {
          token = await getToken();
        } catch (err) {
          console.warn('Failed to get token, continuing without authentication:', err);
        }
      }
      
      // Use the available model from the server
      const modelName = availableModel;
      
      // Debug logging for model selection
      console.log('🤖 AI Agent Builder - Debug Info:');
      console.log('  💭 Conversation Model:', modelName);
      console.log('  📋 Available Models:', availableModels.map(m => m.name));
      console.log('  🌐 Server Type:', isCloudServer ? 'Cloud' : 'Local');

      const responseText = await sendPrompt(
        host,
        port,
        modelName,
        { modifiedPrompt: fullPrompt, images: [] },
        token
      );

      const agentConfig = extractAgentConfig(responseText);
      
      if (agentConfig) {
        console.log('  ✅ Agent Config Extracted:', agentConfig.substring(0, 200) + '...');
      } else {
        console.log('  ❌ No Agent Config Found in Response');
      }
      
      if (agentConfig) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'system',
          text: agentConfig
        }]);
      } else {
        // Clean the response text by removing "ai:" prefix and any leading whitespace
        const cleanedResponse = responseText
          .replace(/^ai:\s*/i, '')  // Remove "ai:" prefix
          .replace(/^\s+/, '')      // Remove leading whitespace
          .trim();
        
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: cleanedResponse || "I'm not sure how to respond to that. Could you try rephrasing your request?"
        }]);
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'An unknown error occurred.';
      let userFriendlyError = errorText;
      
      // Provide more helpful error messages
      if (errorText.includes('network') || errorText.includes('fetch')) {
        userFriendlyError = 'Network connection error. Please check your server connection.';
      } else if (errorText.includes('timeout')) {
        userFriendlyError = 'Request timed out. The server might be busy. Please try again.';
      } else if (errorText.includes('401') || errorText.includes('unauthorized')) {
        userFriendlyError = 'Authentication required. Please log in and try again.';
      } else if (errorText.includes('quota') || errorText.includes('limit')) {
        userFriendlyError = 'Usage limit reached. Please upgrade your plan or try again later.';
      }
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: `Sorry, I ran into an error: ${userFriendlyError}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigureAndSave = (configText: string) => {
    console.log('  🔧 Parsing agent config for saving...');
    const parsed = parseAgentResponse(configText);
    if (parsed) {
      console.log('  💾 Agent successfully created and ready to save!');
      console.log('  🏷️  Final Agent Summary:');
      console.log('    - ID:', parsed.agent.id);
      console.log('    - Name:', parsed.agent.name);
      console.log('    - Model:', parsed.agent.model_name);
      console.log('    - Loop Interval:', parsed.agent.loop_interval_seconds + 's');
      console.log('    - Code Length:', parsed.code.length + ' characters');
      onAgentGenerated(parsed.agent, parsed.code);
    } else {
      console.log('  ❌ Failed to parse agent config for saving');
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: "I'm sorry, there was an error parsing the final configuration. Could you try describing your agent again?" }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Experimental Alert for Local AI Agent Builder */}
      {showExperimentalAlert && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                Experimental Feature
              </h4>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                You're using the local AI Agent Builder. This feature is experimental and may not work as reliably as the cloud version. Results may vary depending on your local model capabilities.
              </p>
            </div>
            <button
              onClick={dismissExperimentalAlert}
              className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Model Status Bar - Only show for local servers */}
      {!isLoadingModel && !isCloudServer && (
        <div className="px-5 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Brain className="h-3 w-3" />
              {availableModel ? (
                <span>Using: {availableModel}</span>
              ) : (
                <span className="text-red-500 dark:text-red-400">No models available</span>
              )}
            </div>
            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
              Local Server
            </span>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 p-5 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'system' ? (
              <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 text-center shadow-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Save className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 font-semibold text-lg">Agent Ready!</p>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-5">Your agent configuration has been generated and is ready to be saved.</p>
                <button
                  onClick={() => handleConfigureAndSave(msg.text)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-200 flex items-center mx-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Configure & Save Agent
                </button>
              </div>
            ) : (
              <div className={`max-w-md p-4 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 p-4 rounded-lg border border-gray-200 dark:border-gray-700 inline-flex items-center shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                <span className="text-sm">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* --- CONDITIONALLY RENDERED INPUT AREA --- */}
      <div className="p-5 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-b-lg">
        {canUseBuilder ? (
          // Can Use Builder View (authenticated for cloud OR using local server)
          <div className="space-y-3">
            {/* Model Selection - Only show for local servers */}
            {!isLoadingModel && availableModels.length > 0 && !isCloudServer && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Brain className="h-4 w-4 mr-1" />
                  Model:
                </div>
                <div className="relative model-dropdown">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-gray-700 dark:text-gray-200">{availableModel}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {availableModels.map((model) => (
                        <button
                          key={model.name}
                          onClick={() => handleModelSelect(model.name)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            availableModel === model.name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{model.name}</span>
                            {model.multimodal && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                Vision
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Input Form */}
            {!availableModel && !isLoadingModel ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-center">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  No models available on this server. Please check your server connection or add models to continue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isLoadingModel ? "Loading model..." : !availableModel ? "No models available..." : "Describe what you want your agent to do..."}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  disabled={isLoading || isLoadingModel || !availableModel}
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  disabled={isLoading || isLoadingModel || !userInput.trim() || !availableModel}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            )}
          </div>
        ) : (
          // Not authenticated for cloud server
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Please authenticate to use the AI Agent Builder with cloud servers.
            </p>
            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center mx-auto text-sm"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              {copyButtonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalGenerator;
