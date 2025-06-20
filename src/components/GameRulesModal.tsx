
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Trophy, Target, Users, AlertCircle, Calendar, Award } from 'lucide-react';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-plpe-purple flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            How Premier League Pick'em Works
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Learn the rules and scoring system for our Premier League prediction game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-plpe-purple" />
              Basic Rules
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-plpe-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-gray-700">Each gameweek, pick ONE team to win their match.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-plpe-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-gray-700">You can only pick each team a maximum of TWO times during the entire season.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-plpe-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-gray-700">Once you submit your pick, you cannot change it.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-plpe-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-gray-700">Picks must be submitted before the gameweek deadline.</p>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-plpe-purple" />
              Scoring System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">3 Points</div>
                <p className="text-green-800 font-medium">Win</p>
                <p className="text-sm text-green-600">Your team wins</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">1 Point</div>
                <p className="text-yellow-800 font-medium">Draw</p>
                <p className="text-sm text-yellow-600">Your team draws</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">0 Points</div>
                <p className="text-red-800 font-medium">Loss</p>
                <p className="text-sm text-red-600">Your team loses</p>
              </div>
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-plpe-purple" />
              Strategy Tips
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-blue-800 text-sm">
                <strong>Save your picks wisely:</strong> Since you can only pick each team twice, consider saving strong teams for difficult gameweeks.
              </p>
              <p className="text-blue-800 text-sm">
                <strong>Check fixtures carefully:</strong> Look at home/away advantage and opponent strength before making your pick.
              </p>
              <p className="text-blue-800 text-sm">
                <strong>Monitor form:</strong> A team's recent performance can be more important than their overall league position.
              </p>
            </div>
          </div>

          {/* Leagues */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-plpe-purple" />
              Leagues & Competition
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <p className="text-purple-800 text-sm">
                <strong>Global Leaderboard:</strong> Compete against all players worldwide.
              </p>
              <p className="text-purple-800 text-sm">
                <strong>Private Leagues:</strong> Create or join leagues with friends and colleagues.
              </p>
              <p className="text-purple-800 text-sm">
                <strong>Season-long competition:</strong> Points accumulate throughout the Premier League season.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-plpe-purple" />
              Important Deadlines
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                Each gameweek has a deadline (usually before the first match kicks off). Make sure to submit your pick before this time, or you'll miss that gameweek!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
