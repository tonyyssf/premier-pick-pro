// Security event logging utility
export interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit_exceeded' | 'invalid_input' | 'unauthorized_access' | 'suspicious_activity';
  userId?: string;
  userAgent?: string;
  ip?: string;
  details?: Record<string, any>;
  timestamp: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    this.events.push(securityEvent);

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent);
    }

    // In production, you might want to send these to a logging service
    this.sendToLoggingService(securityEvent);
  }

  private sendToLoggingService(event: SecurityEvent): void {
    // This would integrate with your logging service (e.g., Sentry, LogRocket, etc.)
    // For now, we'll just store them locally
    try {
      const existingLogs = localStorage.getItem('security_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(event);
      
      // Keep only last 100 events in localStorage
      const recentLogs = logs.slice(-100);
      localStorage.setItem('security_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
    localStorage.removeItem('security_logs');
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logAuthFailure = (details?: Record<string, any>) => {
  securityLogger.log({
    type: 'auth_failure',
    details,
  });
};

export const logRateLimitExceeded = (userId: string, operation: string) => {
  securityLogger.log({
    type: 'rate_limit_exceeded',
    userId,
    details: { operation },
  });
};

export const logInvalidInput = (userId: string, field: string, value: string) => {
  securityLogger.log({
    type: 'invalid_input',
    userId,
    details: { field, value: value.substring(0, 100) }, // Truncate long values
  });
};

export const logUnauthorizedAccess = (userId: string, resource: string) => {
  securityLogger.log({
    type: 'unauthorized_access',
    userId,
    details: { resource },
  });
};

export const logSuspiciousActivity = (userId: string, activity: string, details?: Record<string, any>) => {
  securityLogger.log({
    type: 'suspicious_activity',
    userId,
    details: { activity, ...details },
  });
};
