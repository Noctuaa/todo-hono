import { Redis } from 'ioredis';

/**
 * Session data structure stored in Redis
 */
export interface SessionData {
  userId: number;
  username: string;
  email: string;
  refreshToken: string;
  csrfToken: string;
  rememberMe: boolean;
  loginTime: string;
  lastActivity: string;
  lastRefresh?: string;
  device?: string;
}

/**
 * Redis client
 */
const redis = new Redis({
   host: process.env.REDIS_HOST || 'localhost',
   port: parseInt(process.env.REDIS_PORT || '6379'),
   password: process.env.REDIS_PASSWORD || 'password'
})

/**
 * Redis service for session management
 * Centralizes all Redis operations for authentication sessions
 */
export class RedisService {
  private static instance: Redis;

  /**
   * Store session data in Redis
   * @param {string} sessionId - Unique session identifier
   * @param {SessionData} sessionData - Session data to store
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  static async setSession(sessionId: string, sessionData: SessionData, isRememberMe: boolean = false): Promise<void> {
    const expiry = isRememberMe ? 
      parseInt(process.env.REDIS_SESSION_EXPIRY_LONG!) :
      parseInt(process.env.REDIS_SESSION_EXPIRY_SHORT!)
    await redis.setex(`session:${sessionId}`, expiry, JSON.stringify(sessionData))
  }

  /**
   * Retrieve session data from Redis
   * @param {string} sessionId - Session identifier
   * @returns {Promise<SessionData | null>} Session data or null if not found
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Delete session from Redis
   * @param {string} sessionId - Session identifier
   * @returns {Promise<void>}
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  }

  /**
   * Close Redis connection (for graceful shutdown)
   * @returns {Promise<void>}
   */
  static async disconnect(): Promise<void> {
    await redis.quit()
  }
}