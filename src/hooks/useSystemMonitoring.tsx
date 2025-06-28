
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from '@/utils/securityLogger';

interface SystemMetrics {
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    lastHour: number;
  };
  rateLimit: {
    syncOperations: number;
    maxAllowed: number;
    timeWindow: string;
    nextReset: Date | null;
  };
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    edgeFunctions: 'healthy' | 'warning' | 'error';
    lastHealthCheck: Date;
  };
  errorLogs: Array<{
    id: string;
    timestamp: Date;
    level: 'error' | 'warning' | 'info';
    message: string;
    details?: any;
  }>;
}

export const useSystemMonitoring = () => {
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['system-monitoring'],
    queryFn: async (): Promise<SystemMetrics> => {
      // Get security logs from localStorage
      const securityLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      
      // Simulate API call metrics (in a real implementation, this would come from your monitoring service)
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const recentLogs = securityLogs.filter((log: any) => 
        new Date(log.timestamp) > oneHourAgo
      );

      // Check database health by making a simple query
      let dbHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        const { error } = await supabase.from('gameweeks').select('id').limit(1);
        if (error) dbHealth = 'error';
      } catch {
        dbHealth = 'error';
      }

      // Check edge functions health
      let functionsHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      try {
        // This is a lightweight check - in production you might have a dedicated health endpoint
        const response = await fetch('https://uocfjxteyrjnihemezgo.supabase.co/functions/v1/health', {
          method: 'GET',
        });
        if (!response.ok) functionsHealth = 'warning';
      } catch {
        functionsHealth = 'warning';
      }

      return {
        apiCalls: {
          total: securityLogs.length,
          successful: securityLogs.filter((log: any) => !log.type.includes('failure')).length,
          failed: securityLogs.filter((log: any) => log.type.includes('failure')).length,
          lastHour: recentLogs.length,
        },
        rateLimit: {
          syncOperations: 3, // This would come from your rate limiter
          maxAllowed: 3,
          timeWindow: '5 minutes',
          nextReset: new Date(now.getTime() + 5 * 60 * 1000),
        },
        systemHealth: {
          database: dbHealth,
          edgeFunctions: functionsHealth,
          lastHealthCheck: now,
        },
        errorLogs: securityLogs.slice(-20).map((log: any, index: number) => ({
          id: `${index}`,
          timestamp: new Date(log.timestamp),
          level: log.type === 'auth_failure' ? 'error' : 
                 log.type === 'rate_limit_exceeded' ? 'warning' : 'info',
          message: `${log.type}: ${log.details?.operation || log.details?.resource || 'System event'}`,
          details: log.details,
        })).reverse(),
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const performHealthCheck = async () => {
    await refetch();
  };

  const clearErrorLogs = () => {
    securityLogger.clearEvents();
    refetch();
  };

  return {
    metrics,
    isLoading,
    performHealthCheck,
    clearErrorLogs,
    refetch,
  };
};
