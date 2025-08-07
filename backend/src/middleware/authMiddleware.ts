import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { setAccessToken, setRefreshToken, clearAuthCookies } from '../services/cookieService.js';
import {sign, verify} from 'hono/jwt';
import {Redis} from 'ioredis';
import crypto from 'crypto';

const redis = new Redis({
   host: process.env.REDIS_HOST || 'localhost',
   port: parseInt(process.env.REDIS_PORT || '6379'),
   password: ''
})

const JWT_SECRET = process.env.JWT_SECRET || 'localhost';

export const authMiddleware = async (c: Context, next: () => Promise<void>) => {
   const sessionId = getCookie(c, 'app_id')
   const accessToken = getCookie(c, 'auth_session')
   const refreshToken = getCookie(c, 'usr_token')

   // === If there is no sessionId, nothing can be done ===
   if(!sessionId){
      clearAuthCookies(c)
      return c.json({error: 'Authtenication required'}, 401);
   }

   // === Redis session recovery ===
   const sessionData = await redis.get(`session:${sessionId}`)
   if(!sessionData){
      clearAuthCookies(c)
      return c.json({ error: 'Session expired' }, 401)
   }

   const session = JSON.parse(sessionData)

   // === Verification of access token ===
   if(accessToken) {
      try {
         const payload = await verify(accessToken, JWT_SECRET)
         c.set('user', {...payload, ...JSON.parse(sessionData) })
         console.log('Access token valide')
         return await next()
      } catch (error) {
         console.log('Access token expiré:', error)
      }
   }

   // === Attempting to refresh with the refresh token ===
   if(refreshToken && session.refreshToken === refreshToken){
      try {
         // === Generate a new access token ===
         const newAccessToken = await sign({sub : session.userId, exp: Math.floor(Date.now() / 1000) + 60 * 5}, JWT_SECRET);

         // === Refresh token rotation (security) ===
         const newRefreshToken = crypto.randomBytes(32).toString('hex')

         // === Update session ===
         session.refreshToken = newRefreshToken
         session.lastRefresh = new Date().toISOString()

         // === Persistence in Redis ===
         await redis.setex(`session:${sessionId}`, 14400, JSON.stringify(session))

         // ==== Update new cookies ===
         setAccessToken(c, newAccessToken);
         setRefreshToken(c, newRefreshToken, session.rememberMe);

         // === Injecting the user into the context ===
         c.set('user', session)
         console.log('🔄 Access token renouvelé')
         return await next()
      } catch (error) {
         console.error('Refresh failed:', error)
         return c.json({ error: 'Authentication required' }, 401)
      }
   }

   clearAuthCookies(c)
   console.log('No means of authenticating the user')
   return c.json({ error: 'Authentication required' }, 401)
}