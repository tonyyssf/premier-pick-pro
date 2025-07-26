import { useAuth } from '@/contexts/AuthContext';

export const usePremiumAccess = () => {
  const { user } = useAuth();
  return user?.user_metadata?.is_premium === true;
}; 