
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Users } from 'lucide-react';
import { GameRulesModal } from './GameRulesModal';
import { useAuth } from '@/contexts/AuthContext';

export const HeroSection: React.FC = () => {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartPlaying = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  };

  const handleHowItWorks = () => {
    setIsRulesModalOpen(true);
  };

  return (
    <>
      <div className="relative bg-plpe-gradient py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premier League Pick'em
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Pick one team each week to win their match. But choose wisely - you can only pick each team twice per season!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={handleStartPlaying}
                className="bg-white text-plpe-purple px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors shadow-lg"
              >
                {user ? 'Go to My Picks' : 'Sign Up to Play'}
              </button>
              <button 
                onClick={handleHowItWorks}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-plpe-purple transition-colors"
              >
                How It Works
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Target className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Strategic Picks</h3>
                <p className="text-purple-100">Only 2 picks per team all season. Choose your moments wisely!</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Trophy className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Simple Scoring</h3>
                <p className="text-purple-100">3 points for wins, 1 for draws, 0 for losses. Every point counts!</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Compete Together</h3>
                <p className="text-purple-100">Join private leagues with friends or climb the global leaderboard!</p>
              </div>
            </div>

            {!user && (
              <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-purple-100 text-lg mb-4">
                  Ready to test your Premier League knowledge?
                </p>
                <button 
                  onClick={() => navigate('/auth')}
                  className="bg-white text-plpe-purple px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Create Your Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <GameRulesModal 
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </>
  );
};
