import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
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
   const sessionId = getCookie(c, 'sessionId')
   const accessToken = getCookie(c, 'accessToken')
   const refreshToken = getCookie(c, 'refreshToken')
   
   if(accessToken) {
      try {

         const payload = await verify(accessToken, JWT_SECRET)
         const sessionData = await redis.get(`session:${sessionId}`)

         if (sessionData) {
            c.set('user', {...payload, ...JSON.parse(sessionData) })
            console.log('✅ Access token valide')
            await next()
         }
      } catch (error) {
         console.log('❌ Access token expiré:', error)
      }
   }

  if(refreshToken && sessionId){
      try {
         const sessionData = await redis.get(`session:${sessionId}`)
         if(sessionData){
            const session = JSON.parse(sessionData)
            if(session.refreshToken === refreshToken){
               const newAccessToken = await sign({sub : session.userId, exp: Math.floor(Date.now() / 1000) + 60 * 5}, JWT_SECRET);

               // Rotation du refresh token (sécurité)
               const newRefreshToken = crypto.randomBytes(32).toString('hex')
               session.refreshToken = newRefreshToken
               session.lastRefresh = new Date().toISOString()
               
               // Update Redis
               await redis.setex(`session:${sessionId}`, 4 * 3600, JSON.stringify(session))
               
               // New Cookie
               setCookie(c, 'accessToken', newAccessToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'Strict',
                  maxAge: 15 * 60 // 15 min
               })
               
               setCookie(c, 'refreshToken', newRefreshToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'Strict',
                  maxAge: 30 * 24 * 60 * 60 // 30 days
               })
               
               c.set('user', session)
               console.log('🔄 Access token renouvelé')
               await next()
            }
         }
      } catch (error) {
         console.log(error)
         return c.json({error: 'Authtenication required'}, 401);
      }
  }
}