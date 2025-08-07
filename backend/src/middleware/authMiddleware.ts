import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import {COOKIE_NAMES, setAccessToken, setRefreshToken, clearAuthCookies } from '../services/cookieService.js';
import {sign, verify} from 'hono/jwt';
import { RedisService } from '../services/redisService.js';
import crypto from 'crypto';


const JWT_SECRET = process.env.JWT_SECRET || 'localhost';

/**
 * Validates CSRF token for state-changing operations
 * @param {Context} c - Hono context object 
 * @throws {Response} 403 error if CSRF invalid
 */
const validateCSRF = (c: Context, csrfToken: string, sessionId: string): Response | void => {
   if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.req.method)) {
      const csrfFromHeader = c.req.header('x-csrf-token');
      if(!csrfFromHeader || csrfFromHeader !== csrfToken) {
         // Cleanup session compromise
         RedisService.deleteSession(sessionId)
         clearAuthCookies(c)
         return c.json({error: 'CSRF token invalid - session terminated'}, 403)
      }
   }
}

/**
 * Authentication middleware for protected routes
 * Validates JWT access tokens and handles automatic refresh using Redis sessions
 * Supports token rotation for enhanced security
 * Includes CSRF protection for state-changing operations
 * 
 * @param {Context} c - Hono context object
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>} Continues to next middleware or returns 401/403
 * @throws {401} If authentication fails at any step
 * @throws {403} If CSRF token is invalid
 */
export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
   const sessionId = getCookie(c, COOKIE_NAMES.APP_ID)
   const accessToken = getCookie(c, COOKIE_NAMES.AUTH_SESSION)
   const refreshToken = getCookie(c, COOKIE_NAMES.USR_TOKEN)

   // Check for session ID - required for any authentication
   if(!sessionId){
      clearAuthCookies(c)
      return c.json({error: 'Authtenication required'}, 401);
   }

   // Validate session exists in Redis
   const sessionData = await RedisService.getSession(sessionId)
   if(!sessionData){
      clearAuthCookies(c)
      return c.json({ error: 'Session expired' }, 401)
   }

   // CSRF validation
   const csrfError = validateCSRF(c, sessionData.csrfToken, sessionId)
   if(csrfError) return csrfError


   // Try to authenticate with access token JWT
   if(accessToken) {
      try {
         const payload = await verify(accessToken, JWT_SECRET)
         c.set('user', {...payload, ...sessionData})

         console.log('Access token valid')
      
         return await next()
      } catch (error) {
         console.log('Access token expired:', error)
      }
   }


   // Access token expired - attempt refresh with refresh token
   if(sessionData.refreshToken === refreshToken){
      try {

         // Generate new access token
         const newAccessToken = await sign({sub : sessionData.userId, exp: Math.floor(Date.now() / 1000) + 60 * 5}, JWT_SECRET);

         // Rotate refresh token for security
         const newRefreshToken = crypto.randomBytes(32).toString('hex')

         // Update session with new refresh token
         sessionData.refreshToken = newRefreshToken
         sessionData.lastRefresh = new Date().toISOString()

         // Persist updated session in Redis
         await RedisService.setSession(sessionId, sessionData, sessionData.rememberMe)

         // Set new cookies with updated tokens
         setAccessToken(c, newAccessToken);
         setRefreshToken(c, newRefreshToken, sessionData.rememberMe);

         // Inject user session data into context
         c.set('user', sessionData)
         console.log('Access token refresh')
               
         return await next()
      } catch (error) {
         console.error('Refresh failed:', error)
         return c.json({ error: 'Authentication required' }, 401)
      }
   }

   await RedisService.deleteSession(sessionId);
   clearAuthCookies(c)
   console.log('No means of authenticating the user')
   return c.json({ error: 'Authentication required' }, 401)
}