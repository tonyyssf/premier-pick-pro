
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  isLast?: boolean;
}

export const OnboardingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: "Pick'Em",
      subtitle: "One pick. All the drama.",
      content: (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg mb-8">
            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">PL</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Pick ONE team each week",
      subtitle: "Choose one Premier League club each matchweek you think will win.",
      content: (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center shadow-lg mb-8">
            <div className="relative">
              <div className="w-32 h-40 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-16 h-20 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">⚽</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📱</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Score points based on results",
      subtitle: "",
      content: (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-48 h-48 rounded-full bg-gray-400 flex items-center justify-center shadow-lg mb-8">
            <div className="flex space-x-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-800">3</div>
                <div className="text-xs text-gray-600">Win</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-800">1</div>
                <div className="text-xs text-gray-600">Draw</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-2xl font-bold text-gray-800">0</div>
                <div className="text-xs text-gray-600">Lose</div>
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-300">Win = 3 points</p>
            <p className="text-gray-300">Draw = 1 point</p>
            <p className="text-gray-300">Loss = 0 points</p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Use each team only twice",
      subtitle: "You can only pick each club a maximum of twice throughout the entire season.",
      content: (
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="w-48 h-48 rounded-full bg-gray-500 flex items-center justify-center shadow-lg mb-8">
            <div className="relative">
              <div className="w-24 h-28 bg-white rounded-lg border-4 border-white shadow-lg">
                <div className="flex justify-center -mt-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <div className="w-3 h-3 bg-white rounded-full ml-4"></div>
                </div>
              </div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-red-500 rounded-full border-4 border-red-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm">Two selections per team</p>
          </div>
        </div>
      ),
      isLast: true
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/auth');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-600 text-white flex flex-col relative overflow-hidden">
      {/* Skip button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={handleSkip}
          className="text-gray-300 hover:text-white transition-colors text-sm"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-8 py-12">
        {currentStepData.content}
        
        {/* Title and Subtitle */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {currentStepData.title}
          </h1>
          {currentStepData.subtitle && (
            <p className="text-lg text-purple-100 leading-relaxed max-w-sm mx-auto">
              {currentStepData.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-8 pb-12">
        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-white' : 'bg-purple-400'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={currentStepData.isLast ? handleGetStarted : handleNext}
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg min-w-[200px] flex items-center justify-center space-x-2"
          >
            <span>{currentStepData.isLast ? 'Get Started' : 'Next'}</span>
            {!currentStepData.isLast && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
