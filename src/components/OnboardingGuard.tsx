
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    
    // If user hasn't completed onboarding and isn't already on onboarding page
    if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};
