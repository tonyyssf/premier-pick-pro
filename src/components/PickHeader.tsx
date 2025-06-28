
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PickHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center p-4 bg-purple-900">
      <button 
        onClick={() => navigate('/')}
        className="mr-4 p-1 hover:bg-purple-800 rounded-full transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>
      <h1 className="text-xl font-bold text-white">Make Your Pick</h1>
    </div>
  );
};
