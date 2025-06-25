
import { supabase } from '@/integrations/supabase/client';
import { securityLogger } from '@/utils/securityLogger';

interface SessionConfig {
  maxIdleTime: number; // milliseconds
  sessionTimeout: number; // milliseconds
  requireReauth: boolean;
  trackFingerprint: boolean;
}

class SessionSecurityManager {
  private config: SessionConfig;
  private lastActivity: number = Date.now();
  private sessionStart: number = Date.now();
  private fingerprint: string | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private sessionTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      maxIdleTime: 30 * 60 * 1000, // 30 minutes
      sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
      requireReauth: true,
      trackFingerprint: true,
      ...config
    };

    if (this.config.trackFingerprint) {
      this.generateFingerprint();
    }

    this.startSessionMonitoring();
    this.setupActivityListeners();
  }

  private async generateFingerprint(): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
      }

      const fingerprint = btoa(JSON.stringify({
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        canvas: canvas.toDataURL(),
        timestamp: this.sessionStart
      }));

      const storedFingerprint = localStorage.getItem('session_fingerprint');
      
      if (storedFingerprint && storedFingerprint !== fingerprint) {
        securityLogger.log({
          type: 'suspicious_activity',
          details: { 
            activity: 'fingerprint_mismatch',
            reason: 'Browser fingerprint changed during session'
          }
        });
        await this.forceLogout('Session security violation');
        return;
      }

      this.fingerprint = fingerprint;
      localStorage.setItem('session_fingerprint', fingerprint);
    } catch (error) {
      console.warn('Failed to generate browser fingerprint:', error);
    }
  }

  private startSessionMonitoring(): void {
    // Clear existing timers
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.sessionTimer) clearTimeout(this.sessionTimer);

    // Set idle timeout
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.config.maxIdleTime);

    // Set session timeout
    this.sessionTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.config.sessionTimeout);
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.validateSession();
      }
    });

    // Listen for storage changes (potential session hijacking)
    window.addEventListener('storage', (e) => {
      if (e.key === 'session_fingerprint' && e.newValue !== this.fingerprint) {
        this.forceLogout('Session tampering detected');
      }
    });
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    
    // Restart idle timer
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.handleIdleTimeout();
    }, this.config.maxIdleTime);
  }

  private async handleIdleTimeout(): Promise<void> {
    securityLogger.log({
      type: 'suspicious_activity',
      details: { 
        activity: 'session_idle_timeout',
        idleTime: Date.now() - this.lastActivity
      }
    });

    if (this.config.requireReauth) {
      await this.forceLogout('Session timed out due to inactivity');
    } else {
      // Refresh session
      await this.refreshSession();
    }
  }

  private async handleSessionTimeout(): Promise<void> {
    securityLogger.log({
      type: 'suspicious_activity',
      details: { 
        activity: 'session_absolute_timeout',
        sessionDuration: Date.now() - this.sessionStart
      }
    });

    await this.forceLogout('Session expired');
  }

  private async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        await this.forceLogout('No valid session found');
        return false;
      }

      // Check session expiry
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        await this.forceLogout('Session token expired');
        return false;
      }

      // Validate fingerprint if enabled
      if (this.config.trackFingerprint && this.fingerprint) {
        const storedFingerprint = localStorage.getItem('session_fingerprint');
        if (storedFingerprint !== this.fingerprint) {
          await this.forceLogout('Session fingerprint mismatch');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      await this.forceLogout('Session validation error');
      return false;
    }
  }

  private async refreshSession(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        await this.forceLogout('Failed to refresh session');
      } else {
        this.sessionStart = Date.now();
        this.startSessionMonitoring();
        securityLogger.log({
          type: 'suspicious_activity',
          details: { activity: 'session_refreshed' }
        });
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await this.forceLogout('Session refresh error');
    }
  }

  private async forceLogout(reason: string): Promise<void> {
    securityLogger.log({
      type: 'auth_failure',
      details: { reason, activity: 'forced_logout' }
    });

    // Clear all session data
    localStorage.removeItem('session_fingerprint');
    localStorage.removeItem('plpe_remember_me');
    
    // Clear timers
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.sessionTimer) clearTimeout(this.sessionTimer);

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Redirect to login
    window.location.href = '/auth';
  }

  public async extendSession(): Promise<void> {
    if (await this.validateSession()) {
      this.sessionStart = Date.now();
      this.startSessionMonitoring();
    }
  }

  public getSessionInfo(): {
    sessionAge: number;
    idleTime: number;
    fingerprint: string | null;
  } {
    return {
      sessionAge: Date.now() - this.sessionStart,
      idleTime: Date.now() - this.lastActivity,
      fingerprint: this.fingerprint
    };
  }

  public destroy(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    
    // Remove event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.updateActivity);
    });
  }
}

// Global session manager instance
export const sessionManager = new SessionSecurityManager({
  maxIdleTime: 30 * 60 * 1000, // 30 minutes
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  requireReauth: true,
  trackFingerprint: true
});

// Helper functions
export const initializeSessionSecurity = () => {
  // Session manager is already initialized as singleton
  console.log('Session security initialized');
};

export const validateCurrentSession = async (): Promise<boolean> => {
  return await sessionManager['validateSession']();
};

export const extendUserSession = async (): Promise<void> => {
  await sessionManager.extendSession();
};

export const getSessionSecurityInfo = () => {
  return sessionManager.getSessionInfo();
};
