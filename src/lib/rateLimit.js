/**
 * Sliding Window Memory Rate Limiter for Voxy API endpoints
 * Protects public storefront, checkout initialization, and chat endpoints.
 */

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // default 1 minute
  const maxRequests = options.maxRequests || 30; // default 30 requests per minute

  const hits = new Map();

  // Periodic cleanup of stale entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits.entries()) {
      const activeTimestamps = timestamps.filter((time) => now - time < windowMs);
      if (activeTimestamps.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, activeTimestamps);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return {
    check(key) {
      if (!key) return { success: true, remaining: maxRequests, resetMs: 0 };

      const now = Date.now();
      const timestamps = hits.get(key) || [];
      const activeTimestamps = timestamps.filter((time) => now - time < windowMs);

      if (activeTimestamps.length >= maxRequests) {
        const oldestTime = activeTimestamps[0] || now;
        const resetMs = Math.max(0, windowMs - (now - oldestTime));
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          resetMs,
        };
      }

      activeTimestamps.push(now);
      hits.set(key, activeTimestamps);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - activeTimestamps.length,
        resetMs: windowMs,
      };
    },

    reset(key) {
      hits.delete(key);
    },

    clearAll() {
      hits.clear();
    },

    size() {
      return hits.size;
    },
  };
}

