import { securityLogger } from './securityLogger';

/**
 * Enhanced Content Security Policy configuration
 */
export const getSecurityHeaders = () => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://uocfjxteyrjnihemezgo.supabase.co wss://uocfjxteyrjnihemezgo.supabase.co https://o4509564147466240.ingest.us.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  };
};

/**
 * SQL injection prevention utilities
 */
export const sanitizeSqlInput = (input: string): string => {
  if (typeof input !== 'string') {
    securityLogger.log({
      type: 'invalid_input',
      details: { 
        operation: 'sql_sanitization_failed',
        inputType: typeof input,
        value: String(input)
      }
    });
    throw new Error('Input must be a string');
  }

  // Remove or escape potentially dangerous SQL characters
  const dangerous = /['";\\-]/g;
  const sqlKeywords = /\b(DROP|DELETE|TRUNCATE|UPDATE|INSERT|SELECT|UNION|EXEC|EXECUTE)\b/gi;
  
  if (dangerous.test(input) || sqlKeywords.test(input)) {
    securityLogger.log({
      type: 'invalid_input',
      details: { 
        operation: 'potential_sql_injection_detected',
        input: input.substring(0, 100) // Log first 100 chars only
      }
    });
  }

  return input.replace(dangerous, '').trim();
};

/**
 * XSS prevention utilities
 */
export const sanitizeHtmlInput = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove script tags and event handlers
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const eventPattern = /\bon\w+\s*=/gi;
  const jsPattern = /javascript:/gi;
  
  let sanitized = input
    .replace(scriptPattern, '')
    .replace(eventPattern, '')
    .replace(jsPattern, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  if (sanitized !== input) {
    securityLogger.log({
      type: 'invalid_input',
      details: { 
        operation: 'xss_attempt_detected',
        originalLength: input.length,
        sanitizedLength: sanitized.length
      }
    });
  }

  return sanitized;
};

/**
 * CSRF protection utilities
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (): string => {
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

export const verifyCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('csrf_token');
  const isValid = storedToken === token && token.length === 64;
  
  if (!isValid) {
    securityLogger.log({
      type: 'suspicious_activity',
      details: { 
        operation: 'csrf_token_mismatch',
        tokenProvided: !!token,
        tokenLength: token?.length || 0
      }
    });
  }
  
  return isValid;
};

/**
 * Input validation with security logging
 */
export const validateSecureInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }

  if (input.length > maxLength) {
    securityLogger.log({
      type: 'invalid_input',
      details: { 
        operation: 'input_too_long',
        providedLength: input.length,
        maxLength
      }
    });
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`);
  }

  // Check for potential security threats
  const threats = [
    { pattern: /<script/i, name: 'script_tag' },
    { pattern: /javascript:/i, name: 'javascript_protocol' },
    { pattern: /on\w+\s*=/i, name: 'event_handler' },
    { pattern: /data:.*base64/i, name: 'base64_data_uri' },
    { pattern: /\|\||&&/g, name: 'logical_operators' }
  ];

  for (const threat of threats) {
    if (threat.pattern.test(input)) {
      securityLogger.log({
        type: 'invalid_input',
        details: { 
          operation: 'security_threat_detected',
          threatType: threat.name,
          input: input.substring(0, 100)
        }
      });
      throw new Error(`Invalid input detected: ${threat.name}`);
    }
  }

  return sanitizeHtmlInput(input);
};

/**
 * Rate limiting utilities
 */
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number; blocked: boolean }>();

export const checkRateLimit = (key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: 0, lastAttempt: 0, blocked: false };

  // Reset if window has passed
  if (now - record.lastAttempt > config.windowMs) {
    record.attempts = 0;
    record.blocked = false;
  }

  // Check if currently blocked
  if (record.blocked && now - record.lastAttempt < config.blockDurationMs) {
    return { allowed: false, remaining: 0 };
  }

  // Check attempts
  if (record.attempts >= config.maxAttempts) {
    record.blocked = true;
    securityLogger.log({
      type: 'rate_limit_exceeded',
      details: { 
        operation: 'rate_limit_triggered',
        key: key.substring(0, 10) + '...', // Partial key for privacy
        attempts: record.attempts,
        config
      }
    });
    return { allowed: false, remaining: 0 };
  }

  // Allow and increment
  record.attempts++;
  record.lastAttempt = now;
  rateLimitStore.set(key, record);

  return { allowed: true, remaining: config.maxAttempts - record.attempts };
};

/**
 * Secure cookie utilities
 */
export const setSecureCookie = (name: string, value: string, options: {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
} = {}) => {
  const defaults = {
    httpOnly: true,
    secure: window.location.protocol === 'https:',
    sameSite: 'strict' as const,
    maxAge: 3600 // 1 hour
  };

  const cookieOptions = { ...defaults, ...options };
  
  let cookieString = `${name}=${value}`;
  
  if (cookieOptions.maxAge) {
    cookieString += `; Max-Age=${cookieOptions.maxAge}`;
  }
  
  if (cookieOptions.secure) {
    cookieString += '; Secure';
  }
  
  cookieString += `; SameSite=${cookieOptions.sameSite}`;
  cookieString += '; Path=/';

  document.cookie = cookieString;
};

/**
 * Browser fingerprinting detection
 */
export const detectSuspiciousActivity = (): Promise<{
  fingerprint: string;
  suspiciousFeatures: string[];
}> => {
  return new Promise((resolve) => {
    const suspiciousFeatures: string[] = [];
    
    // Check for automation tools
    if ((window as any).webdriver || (navigator as any).webdriver) {
      suspiciousFeatures.push('webdriver_detected');
    }
    
    if ((window as any).chrome && (window as any).chrome.runtime && (window as any).chrome.runtime.onConnect) {
      suspiciousFeatures.push('chrome_extension_detected');
    }
    
    // Check for headless browser
    if (navigator.webdriver === true) {
      suspiciousFeatures.push('headless_browser');
    }
    
    // Check for missing plugins
    if (navigator.plugins.length === 0) {
      suspiciousFeatures.push('no_plugins');
    }
    
    // Generate fingerprint
    const fingerprint = btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    }));
    
    if (suspiciousFeatures.length > 0) {
      securityLogger.log({
        type: 'suspicious_activity',
        details: { 
          operation: 'suspicious_browser_detected',
          features: suspiciousFeatures,
          fingerprint: fingerprint.substring(0, 50) + '...'
        }
      });
    }
    
    resolve({ fingerprint, suspiciousFeatures });
  });
};