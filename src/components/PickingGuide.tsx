
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, Users, Trophy, Clock, Shield } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export const PickingGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const guides = [
    {
      icon: Users,
      title: "How to Pick",
      content: "Choose one team from any fixture that you think will win. Click on the team to make your selection."
    },
    {
      icon: Trophy,
      title: "Team Usage Limits",
      content: "You can only pick each team a maximum of 2 times during the entire season. Choose wisely!"
    },
    {
      icon: Clock,
      title: "Deadline Rules",
      content: "You can change your pick until the first match of the gameweek starts. After that, all picks are locked."
    },
    {
      icon: Shield,
      title: "Scoring System",
      content: "Get 3 points for a correct pick (your team wins). Get 0 points if your team loses or draws."
    }
  ];

  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="w-full flex items-center justify-between p-0 h-auto"
        >
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-900">How to Play Guide</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-purple-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-purple-600" />
          )}
        </Button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {guides.map((guide, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                <guide.icon className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 mb-1">{guide.title}</h4>
                  <p className="text-sm text-purple-800">{guide.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
