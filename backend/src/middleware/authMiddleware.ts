import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { setAccessToken, setRefreshToken, clearAuthCookies } from '../services/cookieService.js';
import {sign, verify} from 'hono/jwt';
import { RedisService } from '../services/redisService.js';
import crypto from 'crypto';


const JWT_SECRET = process.env.JWT_SECRET || 'localhost';

/**
 * Authentication middleware for protected routes
 * Validates JWT access tokens and handles automatic refresh using Redis sessions
 * Supports token rotation for enhanced security
 * 
 * @param {Context} c - Hono context object
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>} Continues to next middleware or returns 401
 * @throws {401} If authentication fails at any step
 */
export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
   const sessionId = getCookie(c, 'app_id')
   const accessToken = getCookie(c, 'auth_session')
   const refreshToken = getCookie(c, 'usr_token')

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


   // Try to authenticate with access token JWT
   if(accessToken) {
      try {
         const payload = await verify(accessToken, JWT_SECRET)
         c.set('user', {...payload, ...sessionData})
         console.log('Access token valide')
         return await next()
      } catch (error) {
         console.log('Access token expiré:', error)
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
         console.log('🔄 Access token renouvelé')
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