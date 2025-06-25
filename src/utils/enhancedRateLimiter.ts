
// Enhanced rate limiter with user-specific limits and advanced tracking
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  userSpecificLimits?: Record<string, { max: number; window: number }>;
  blockDuration?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
  violations: number;
}

class EnhancedRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly config: RateLimitConfig;
  private readonly violationThreshold = 3;

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDuration: 15 * 60 * 1000, // 15 minutes default
      ...config
    };
  }

  isAllowed(key: string, userId?: string): { 
    allowed: boolean; 
    timeUntilReset: number;
    remainingRequests: number;
    isBlocked: boolean;
  } {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        timeUntilReset: entry.blockedUntil - now,
        remainingRequests: 0,
        isBlocked: true
      };
    }

    // Get applicable limits
    const limits = this.getApplicableLimits(userId);
    
    if (!entry || now > entry.resetTime) {
      // First request or window has passed
      this.limits.set(key, {
        count: 1,
        resetTime: now + limits.windowMs,
        violations: entry?.violations || 0
      });
      return {
        allowed: true,
        timeUntilReset: limits.windowMs,
        remainingRequests: limits.maxRequests - 1,
        isBlocked: false
      };
    }

    if (entry.count >= limits.maxRequests) {
      // Rate limit exceeded
      entry.violations++;
      
      // Block user if too many violations
      if (entry.violations >= this.violationThreshold) {
        entry.blockedUntil = now + (this.config.blockDuration || 15 * 60 * 1000);
      }
      
      return {
        allowed: false,
        timeUntilReset: entry.resetTime - now,
        remainingRequests: 0,
        isBlocked: !!entry.blockedUntil
      };
    }

    entry.count++;
    return {
      allowed: true,
      timeUntilReset: entry.resetTime - now,
      remainingRequests: limits.maxRequests - entry.count,
      isBlocked: false
    };
  }

  private getApplicableLimits(userId?: string): { maxRequests: number; windowMs: number } {
    if (userId && this.config.userSpecificLimits?.[userId]) {
      const userLimits = this.config.userSpecificLimits[userId];
      return { maxRequests: userLimits.max, windowMs: userLimits.window };
    }
    return { maxRequests: this.config.maxRequests, windowMs: this.config.windowMs };
  }

  clearViolations(key: string): void {
    const entry = this.limits.get(key);
    if (entry) {
      entry.violations = 0;
      entry.blockedUntil = undefined;
    }
  }

  getStats(key: string): RateLimitEntry | null {
    return this.limits.get(key) || null;
  }
}

// Enhanced rate limiters with user-specific configurations
export const enhancedAdminSyncLimiter = new EnhancedRateLimiter({
  maxRequests: 3,
  windowMs: 5 * 60 * 1000, // 5 minutes
  blockDuration: 30 * 60 * 1000, // 30 minutes block
  userSpecificLimits: {
    // Super admin gets higher limits
    'super_admin': { max: 10, window: 5 * 60 * 1000 }
  }
});

export const enhancedLeagueCreateLimiter = new EnhancedRateLimiter({
  maxRequests: 3,
  windowMs: 10 * 60 * 1000, // 10 minutes
  blockDuration: 60 * 60 * 1000 // 1 hour block
});

export const enhancedJoinLeagueLimiter = new EnhancedRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  blockDuration: 10 * 60 * 1000 // 10 minutes block
});

export const enhancedAuthLimiter = new EnhancedRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 60 * 60 * 1000 // 1 hour block for auth failures
});

export const checkEnhancedRateLimit = (
  limiter: EnhancedRateLimiter, 
  key: string, 
  userId?: string
): { 
  allowed: boolean; 
  timeUntilReset: number;
  remainingRequests: number;
  isBlocked: boolean;
} => {
  return limiter.isAllowed(key, userId);
};
