
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthDebugger: React.FC = () => {
  const { user, session, status } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
      <div><strong>Auth Debug:</strong></div>
      <div>Status: {status}</div>
      <div>User ID: {user?.id || 'none'}</div>
      <div>Session: {session ? 'exists' : 'none'}</div>
      <div>Path: {window.location.pathname}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};
