
import { z } from 'zod';

// Advanced input sanitization
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol (potential XSS)
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .trim();
};

export const sanitizeSql = (input: string): string => {
  // Remove common SQL injection patterns
  return input
    .replace(/('|(\\'));?(\s|$)/gi, '') // Remove quote escaping attempts
    .replace(/(;|--|\||\/\*|\*\/)/g, '') // Remove SQL metacharacters
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '') // Remove SQL keywords
    .trim();
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255) // Limit filename length
    .trim();
};

// Enhanced validation schemas with stronger rules
export const enhancedLeagueNameSchema = z
  .string()
  .min(3, 'League name must be at least 3 characters')
  .max(50, 'League name must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_']+$/, 'League name contains invalid characters')
  .refine((val) => {
    const sanitized = sanitizeHtml(val);
    return sanitized === val && sanitized.trim().length > 0;
  }, 'League name contains unsafe content')
  .refine((val) => {
    // Check for common profanity or inappropriate content
    const inappropriate = /\b(spam|test123|admin|root|null|undefined)\b/i;
    return !inappropriate.test(val);
  }, 'League name contains inappropriate content');

export const enhancedUsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), 'Username cannot start or end with a hyphen')
  .refine((val) => {
    // Prevent common system usernames
    const reserved = ['admin', 'root', 'system', 'user', 'guest', 'null', 'undefined', 'test'];
    return !reserved.includes(val.toLowerCase());
  }, 'Username is reserved')
  .refine((val) => {
    // Prevent sequential characters that might indicate automated accounts
    return !/(.)\1{3,}/.test(val); // No more than 3 consecutive identical characters
  }, 'Username contains too many consecutive identical characters');

export const enhancedEmailSchema = z
  .string()
  .email('Invalid email format')
  .max(320, 'Email address too long') // RFC 5321 limit
  .refine((email) => {
    // Additional email validation
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [local, domain] = parts;
    
    // Check local part length (RFC 5321: 64 characters max)
    if (local.length > 64) return false;
    
    // Check domain part
    if (domain.length > 253) return false;
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }, 'Invalid email domain')
  .refine((email) => {
    // Check for disposable/temporary email domains
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
      'mailinator.com', 'throwaway.email'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed');

export const enhancedPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
  .refine((password) => {
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'letmein', 
      'welcome', 'monkey', '1234567890'
    ];
    return !commonPasswords.includes(password.toLowerCase());
  }, 'Password is too common')
  .refine((password) => {
    // Check for sequences and patterns
    const hasSequence = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
    const hasRepeating = /(.)\1{2,}/.test(password); // No more than 2 consecutive identical characters
    return !hasSequence && !hasRepeating;
  }, 'Password contains predictable patterns');

// XSS and injection prevention
export const validateAndSanitizeInput = (input: any, schema: z.ZodSchema) => {
  if (typeof input === 'string') {
    input = sanitizeHtml(input);
  }
  
  const result = schema.safeParse(input);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  
  return result.data;
};

// File upload validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images are allowed.' };
  }
  
  // Validate filename
  const sanitizedName = sanitizeFilename(file.name);
  if (sanitizedName !== file.name || sanitizedName.length === 0) {
    return { valid: false, error: 'Invalid filename' };
  }
  
  return { valid: true };
};

// Rate limiting validation
export const validateRateLimitHeaders = (headers: Record<string, string>): boolean => {
  const userAgent = headers['user-agent'];
  const origin = headers['origin'];
  
  // Check for suspicious user agents
  if (userAgent) {
    const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
    if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
      return false;
    }
  }
  
  // Validate origin if present
  if (origin && !origin.includes(window.location.hostname)) {
    return false;
  }
  
  return true;
};
