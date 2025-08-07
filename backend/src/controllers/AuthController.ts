import type { Context } from 'hono'
import { User } from '../models/User.js';
import argon2 from 'argon2';
import { decode, sign, verify} from 'hono/jwt';
import { COOKIE_NAMES, setAccessToken, setRefreshToken, setAppSessionId, clearAuthCookies} from '../services/cookieService.js';
 import { getCookie, deleteCookie } from 'hono/cookie';
import { type RegisterPayload, type LoginPayload } from '../validations/authValidation.js';
import {Redis} from 'ioredis';
import crypto from 'crypto';

const redis = new Redis({
   host: process.env.REDIS_HOST || 'localhost',
   port: parseInt(process.env.REDIS_PORT || '6379'),
   password: ''
})

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

/**
 * AuthController - handles user authentication operations
 * This includes user registration, login, and logout.
 */
export class AuthController {

   static async register(c: Context) {
      try {
         // @ts-ignore - The zValidator middleware manages validation
         const payload: RegisterPayload = c.req.valid('json');

         const existingUser = await User.query().where('email', payload.email).first();
         if(existingUser) {
            return c.json({ message: 'User with this email already exists' }, 400);
         }

         const hashedPassword = await argon2.hash(payload.password);

         const user = await User.query().insert({
            username: payload.username,
            email: payload.email,
            password: hashedPassword
         });     

         return c.json({
            message: 'User registered successfully',
            data: {
               id: user.id,
               username: user.username,
               email: user.email
            }
         }, 201);
      } catch (error: unknown) {
         console.error(error);
         return c.json({ 
            message: 'Registration failed', 
            error: process.env.NODE_ENV === 'development' 
         ? error instanceof Error ? error.message : 'Erreur inconnue'
         : 'Une erreur est survenue lors de l\'enregistrement' }, 
         500);
      }
   };

   static async login(c: Context) {
      try {
         // @ts-ignore - The zValidator middleware manages validation
         const payload: LoginPayload = c.req.valid('json');

         const errorStatus = c.json({ message: 'Email ou mot de passe incorrect' }, 401); // Unauthorized

         const rememberMe = payload.rememberMe;

         const user = await User.query().where('email', payload.email).first();
         if (!user) { return errorStatus;}

         const isValidPassword = await argon2.verify(user.password, payload.password);
         if (!isValidPassword) { return errorStatus;}

         // Generate JWT token
         const sessionId = crypto.randomUUID();
         const accessTokens = await sign({sub : user.id, exp: Math.floor(Date.now() / 1000) + 60 * 5}, JWT_SECRET)
         const refreshToken = crypto.randomBytes(32).toString('hex')
         const csrfToken = crypto.randomBytes(16).toString('hex')

         // Generate Cookie 
         setAccessToken(c, accessTokens);
         setRefreshToken(c,refreshToken, rememberMe);
         setAppSessionId(c, sessionId, rememberMe);

         // SessionData store in Redis
         const sessionData = {
            userId: user.id,
            username: user.username,
            email: user.email,
            refreshToken,
            csrfToken,
            rememberMe: rememberMe,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            device: c.req.header('user-agent'),
         }

         await redis.setex(`session:${sessionId}`, 4 * 3600, JSON.stringify(sessionData))

         return c.json({
            message: 'User logged in successfully',
            data: {
               id: user.id,
               username: user.username,
               email: user.email,
            },
            rememberMe: rememberMe,
            isAuthenticated: true,
            csrfToken: csrfToken
         }, 200);


      } catch (error) {
         console.log(error)
         return c.json({ 
            message: 'Login failed', 
            error: process.env.NODE_ENV === 'development' 
         ? error instanceof Error ? error.message : 'Erreur inconnue'
         : 'Une erreur est survenue lors de l\'enregistrement' }, 
         500);
      }
   };

   static async logout(c: Context) {

      const sessionId = getCookie(c, COOKIE_NAMES.APP_ID)

      if(sessionId) {
         await redis.del(`session:${sessionId}`);
      }

      clearAuthCookies(c);

      return c.json({
         success: true,
         message: 'Logged out successfully'
      })
   };

   static async status(c:Context) {
      const user = c.get('user')
      const sessionId = getCookie(c, 'sessionId')
      
      if (sessionId) {
         const sessionData = await redis.get(`session:${sessionId}`)
         if (sessionData) {
            const session = JSON.parse(sessionData)
            session.lastActivity = new Date().toISOString()
            await redis.setex(`session:${sessionId}`, 4 * 3600, JSON.stringify(session))
         }
      }
      
      return c.json({
         authenticated: true,
         user: {
            id: user.userId,
            username: user.username,
            email: user.email
         },
         csrfToken: user.csrfToken
      })
   }
}