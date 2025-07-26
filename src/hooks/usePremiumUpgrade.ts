import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function usePremiumUpgrade() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const startUpgrade = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade to premium.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the edge function to create a payment session
      const { data, error } = await supabase.functions.invoke('create-premium-payment');
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Premium upgrade error:', error);
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
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Premium Activated!",
          description: "Your premium features have been unlocked successfully.",
        });
        
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        throw new Error(data?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
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