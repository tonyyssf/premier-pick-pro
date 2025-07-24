
import React, { useEffect } from 'react';
import { getSecurityHeaders } from '@/utils/enhancedSecurityUtils';
import { securityLogger } from '@/utils/securityLogger';

export const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    const headers = getSecurityHeaders();
    const csp = headers['Content-Security-Policy'];

    // Create or update CSP meta tag
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    cspMeta.setAttribute('content', csp);

    // Set comprehensive security headers via meta tags
    const securityMetas = [
      { name: 'referrer', content: headers['Referrer-Policy'] },
      { name: 'X-Content-Type-Options', content: headers['X-Content-Type-Options'] },
      { name: 'X-Frame-Options', content: headers['X-Frame-Options'] },
      { name: 'X-XSS-Protection', content: headers['X-XSS-Protection'] },
      { name: 'Permissions-Policy', content: headers['Permissions-Policy'] }
    ];

    securityMetas.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Set secure cookie defaults and monitor for violations
    document.cookie = "SameSite=Strict; Secure; Path=/";
    
    // Monitor for CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
      securityLogger.log({
        type: 'suspicious_activity',
        details: {
          operation: 'csp_violation',
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          originalPolicy: e.originalPolicy,
          disposition: e.disposition
        }
      });
    });

    // Detect and log potential security bypass attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check for suspicious script additions
              if (element.tagName === 'SCRIPT' || element.querySelector('script')) {
                securityLogger.log({
                  type: 'suspicious_activity',
                  details: {
                    operation: 'dynamic_script_detected',
                    tagName: element.tagName,
                    innerHTML: element.innerHTML.substring(0, 100)
                  }
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
};
