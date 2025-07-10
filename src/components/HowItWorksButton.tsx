
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameRulesModal } from '@/components/GameRulesModal';

export const HowItWorksButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2 text-plpe-purple border-plpe-purple hover:bg-plpe-purple hover:text-white transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        <span>How It Works</span>
      </Button>
      
      <GameRulesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
