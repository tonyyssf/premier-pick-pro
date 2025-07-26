import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { analytics } from '@/utils/analytics';

export function usePremiumUpgrade() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const startUpgrade = async (source?: 'insights_banner' | 'chart_overlay' | 'export_button') => {
    if (!user) {
      analytics.trackPremiumUpgradeFailed('user_not_authenticated', 'start_upgrade');
      
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade to premium.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Track upgrade attempt
      analytics.trackPremiumUpgradeStarted(source || 'insights_banner');
      
      // Call the edge function to create a payment session
      const { data, error } = await supabase.functions.invoke('create-premium-payment');
      
      if (error) {
        analytics.trackPremiumUpgradeFailed(error.message, 'payment_session_creation');
        throw error;
      }

      if (data?.url) {
        // Track successful redirect to payment
        analytics.trackFeatureUsage('premium_payment_redirect');
        
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        analytics.trackPremiumUpgradeFailed('no_payment_url', 'payment_session_creation');
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Premium upgrade error:', error);
      analytics.trackPremiumUpgradeFailed(String(error), 'start_upgrade');
      
      toast({
        title: "Upgrade Failed",
        description: "There was an error starting your premium upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-premium-payment', {
        body: { sessionId }
      });
      
      if (error) {
        analytics.trackPremiumUpgradeFailed(error.message, 'payment_verification');
        throw error;
      }

      if (data?.success) {
        // Track successful premium activation
        analytics.trackPremiumUpgradeCompleted('stripe', 9.99);
        analytics.trackPremiumFeatureUsage('advanced_analytics');
        analytics.trackUserEngagement('premium_upgrade');
        
        toast({
          title: "Premium Activated!",
          description: "Your premium features have been unlocked successfully.",
        });
        
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        analytics.trackPremiumUpgradeFailed(data?.message || 'verification_failed', 'payment_verification');
        throw new Error(data?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      analytics.trackPremiumUpgradeFailed(String(error), 'payment_verification');
      
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return {
    startUpgrade,
    verifyPayment,
    isLoading
  };
}