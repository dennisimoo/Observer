import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the shared CSS
import '@/index.css'; 

// Import the application entry point
import App from './web/App';

// Tauri React component
const TauriApp = () => (
  <div className="h-screen overflow-hidden">
    <App />
  </div>
);

// Web React component (your existing app)
const WebApp = () => <App />;

// Detect environment and render appropriate component
const detectEnvironment = () => {
  // Check if we're in a Tauri environment
  if (typeof window !== 'undefined' && (window as any).__TAURI__) {
    return <TauriApp />;
  }
  
  // Default to web environment
  return <WebApp />;
};

// Main render function
const renderApp = () => detectEnvironment();

// Render the chosen component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {renderApp()}
  </React.StrictMode>
);
