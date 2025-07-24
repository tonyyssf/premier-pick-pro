import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { securityLogger } from '@/utils/securityLogger';
import { detectSuspiciousActivity } from '@/utils/enhancedSecurityUtils';
import { useToast } from '@/hooks/use-toast';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Perform security checks on component mount
    const performSecurityChecks = async () => {
      try {
        // Detect suspicious browser activity
        const { fingerprint, suspiciousFeatures } = await detectSuspiciousActivity();
        
        if (suspiciousFeatures.length > 0) {
          securityLogger.log({
            type: 'suspicious_activity',
            userId: user?.id,
            details: {
              operation: 'security_middleware_check',
              suspiciousFeatures,
              fingerprint: fingerprint.substring(0, 50) + '...'
            }
          });
          
          // Warn user about potential security issues
          if (suspiciousFeatures.includes('webdriver_detected') || 
              suspiciousFeatures.includes('headless_browser')) {
            toast({
              title: "Security Notice",
              description: "Automated browser detected. Please use a standard browser for security.",
              variant: "destructive",
            });
          }
        }
        
        // Log user session activity
        if (user) {
          securityLogger.log({
            type: 'suspicious_activity',
            userId: user.id,
            details: {
              operation: 'user_activity_tracked',
              timestamp: Date.now(),
              fingerprint: fingerprint.substring(0, 50) + '...'
            }
          });
        }
      } catch (error) {
        console.error('Security check failed:', error);
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user?.id,
          details: {
            operation: 'security_check_failed',
            error: String(error)
          }
        });
      }
    };

    performSecurityChecks();
  }, [user, toast]);

  // Monitor for tab visibility changes (potential security concern)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user) {
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user.id,
          details: {
            operation: document.hidden ? 'tab_hidden' : 'tab_visible',
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

  // Monitor for right-click context menu (potential security inspection)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (user) {
        securityLogger.log({
          type: 'suspicious_activity',
          userId: user.id,
          details: {
            operation: 'context_menu_accessed',
            timestamp: Date.now(),
            position: { x: e.clientX, y: e.clientY }
          }
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [user]);

  // Monitor for developer tools detection
  useEffect(() => {
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;

    const detection = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          if (user) {
            securityLogger.log({
              type: 'suspicious_activity',
              userId: user.id,
              details: {
                operation: 'devtools_opened',
                timestamp: Date.now(),
                dimensions: {
                  outerHeight: window.outerHeight,
                  innerHeight: window.innerHeight,
                  outerWidth: window.outerWidth,
                  innerWidth: window.innerWidth
                }
              }
            });
          }
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          if (user) {
            securityLogger.log({
              type: 'suspicious_activity',
              userId: user.id,
              details: {
                operation: 'devtools_closed',
                timestamp: Date.now()
              }
            });
          }
        }
      }
    };

    const interval = setInterval(detection, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // Monitor for unusual keyboard combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Monitor for common developer shortcuts
      const suspiciousKeys = [
        { keys: ['F12'], name: 'f12_devtools' },
        { keys: ['Control', 'Shift', 'I'], name: 'ctrl_shift_i' },
        { keys: ['Control', 'Shift', 'J'], name: 'ctrl_shift_j' },
        { keys: ['Control', 'U'], name: 'ctrl_u_view_source' },
        { keys: ['Control', 'Shift', 'C'], name: 'ctrl_shift_c_inspect' }
      ];

      for (const combo of suspiciousKeys) {
        if (combo.keys.every(key => 
          key === e.key || 
          (key === 'Control' && e.ctrlKey) || 
          (key === 'Shift' && e.shiftKey) ||
          (key === 'Alt' && e.altKey)
        )) {
          if (user) {
            securityLogger.log({
              type: 'suspicious_activity',
              userId: user.id,
              details: {
                operation: 'suspicious_keyboard_combo',
                comboName: combo.name,
                timestamp: Date.now()
              }
            });
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [user]);

  return <>{children}</>;
};