import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { sessionManager, initializeSessionSecurity } from '@/utils/sessionSecurity';
import { useAuth } from '@/contexts/AuthContext';
import { securityLogger } from '@/utils/securityLogger';

interface SecurityMonitoringContextType {
  metrics: any;
  isLoading: boolean;
  performSecurityAudit: () => Promise<void>;
}

const SecurityMonitoringContext = createContext<SecurityMonitoringContextType | undefined>(undefined);

export const SecurityMonitoringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { metrics, isLoading, performSecurityAudit } = useSecurityMonitoring();

  useEffect(() => {
    // Initialize session security monitoring when user logs in
    if (user) {
      initializeSessionSecurity();
      
      // Log user session start
      securityLogger.log({
        type: 'suspicious_activity',
        userId: user.id,
        details: { 
          operation: 'session_started',
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        }
      });
    } else {
      // Clean up session monitoring when user logs out
      sessionManager.destroy();
    }
  }, [user]);

  // Monitor for security events on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user.id,
          details: { 
            operation: 'page_hidden',
            timestamp: Date.now()
          }
        });
      } else if (!document.hidden && user) {
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user.id,
          details: { 
            operation: 'page_visible',
            timestamp: Date.now()
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Monitor for potential XSS attempts
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Log JavaScript errors that might indicate security issues
      if (event.error?.stack?.includes('script') || 
          event.message?.includes('script') ||
          event.message?.includes('eval')) {
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user?.id,
          details: { 
            operation: 'potential_xss_detected',
            error: event.message,
            source: event.filename,
            line: event.lineno,
            timestamp: Date.now()
          }
        });
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [user]);

  return (
    <SecurityMonitoringContext.Provider value={{
      metrics,
      isLoading,
      performSecurityAudit
    }}>
      {children}
    </SecurityMonitoringContext.Provider>
  );
};

export const useSecurityMonitoringContext = (): SecurityMonitoringContextType => {
  const context = useContext(SecurityMonitoringContext);
  if (!context) {
    throw new Error('useSecurityMonitoringContext must be used within a SecurityMonitoringProvider');
  }
  return context;
};