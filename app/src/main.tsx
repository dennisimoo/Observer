import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the shared CSS
import '@/index.css'; 

// Import the application entry point
import App from './web/App';

// Helper function to safely check for the Tauri environment
function isTauri() {
  return Boolean(
    typeof window !== 'undefined' &&
    (window as any).__TAURI__
  );
}

// For now, use the same App component for both web and desktop
// TODO: Implement LauncherShell component for desktop when ready
const RootComponent = App;

// Render the chosen component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
);
