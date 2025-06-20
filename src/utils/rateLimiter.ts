
// Simple in-memory rate limiter for client-side protection
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window has passed
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }

  clear(key: string): void {
    this.limits.delete(key);
  }
}

// Create rate limiters for different operations
export const adminSyncLimiter = new RateLimiter(3, 300000); // 3 requests per 5 minutes
export const leagueCreateLimiter = new RateLimiter(5, 600000); // 5 leagues per 10 minutes
export const joinLeagueLimiter = new RateLimiter(10, 60000); // 10 joins per minute

export const checkRateLimit = (limiter: RateLimiter, key: string): { allowed: boolean; timeUntilReset: number } => {
  const allowed = limiter.isAllowed(key);
  const timeUntilReset = limiter.getTimeUntilReset(key);
  
  return { allowed, timeUntilReset };
};
