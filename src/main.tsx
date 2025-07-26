// src/main.tsx
console.log("Starting app initialization...");

// Initialize Sentry with error handling
try {
  import('./sentry');
  console.log("Sentry module imported successfully");
} catch (error) {
  console.warn("Failed to import Sentry:", error);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

console.log("Looking for root element...");

const container = document.getElementById('root');
if (!container) {
  console.error("Root element not found!");
  throw new Error('Root element not found');
}

console.log("Root element found, creating React root...");

try {
  const root = createRoot(container);
  console.log("React root created, rendering app...");
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  
  console.log("App rendered successfully!");
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to load the application. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left; margin: 20px auto; max-width: 600px;">${error}</pre>
    </div>
  `;
}
