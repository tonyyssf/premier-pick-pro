
import React from 'react';
import { X } from 'lucide-react';

interface PickConfirmationModalProps {
  pick: {
    team: { name: string; shortName: string; teamColor?: string };
    opponent: { name: string };
    venue: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export const PickConfirmationModal: React.FC<PickConfirmationModalProps> = ({
  pick,
  onConfirm,
  onCancel,
  submitting
}) => {
  const winProbability = Math.floor(Math.random() * 40 + 30); // Mock probability

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-xl p-6 animate-slide-in-right mb-20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Confirm Your Pick</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: pick.team.teamColor || '#6B7280' }}
            >
              {pick.team.shortName}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{pick.team.name}</div>
              <div className="text-gray-400">vs. {pick.opponent.name} ({pick.venue})</div>
            </div>
          </div>
          <div className="text-gray-300">
            Win probability: <span className="text-white font-medium">{winProbability}%</span>
          </div>
        </div>
        
        <div className="bg-purple-900 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-purple-300 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Remember: Win = 3 pts, Draw = 1 pt, Loss = 0 pts</span>
          </div>
        </div>
        
        <button
          onClick={onConfirm}
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          {submitting ? 'Confirming Pick...' : 'Confirm Pick'}
        </button>
      </div>
    </div>
  );
};
