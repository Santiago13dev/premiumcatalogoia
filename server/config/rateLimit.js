import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Create different rate limiters for different endpoints
export const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      client: redis,
      prefix: 'rl:',
    }),
    skip: (req) => {
      // Skip rate limiting for whitelisted IPs
      const whitelist = process.env.WHITELIST_IPS?.split(',') || [];
      return whitelist.includes(req.ip);
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id || req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: options.message || 'Rate limit exceeded',
        retryAfter: req.rateLimit.resetTime
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Specific rate limiters
export const generalLimiter = createRateLimiter();

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true
});

export const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'API rate limit exceeded'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads'
});

export const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: 'Too many search requests'
});