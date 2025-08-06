import type { Context } from 'hono'
import { User } from '../models/User.js';
import argon2 from 'argon2';
import { decode, sign, verify} from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { type RegisterPayload, type LoginPayload } from '../validations/authValidation.js';
import {Redis} from 'ioredis';
import crypto from 'crypto';

const redis = new Redis({
   host: process.env.REDIS_HOST || 'localhost',
   port: parseInt(process.env.REDIS_PORT || '6379'),
   password: ''
})

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

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

         const user = await User.query().where('email', payload.email).first();
         if (!user) { return errorStatus;}

         const isValidPassword = await argon2.verify(user.password, payload.password);
         if (!isValidPassword) { return errorStatus;}

         // Generate JWT token
         const sessionId = crypto.randomUUID();
         const accessTokens = await sign({sub : user.id, exp: Math.floor(Date.now() / 1000) + 60 * 5}, JWT_SECRET)
         const refreshToken = crypto.randomBytes(32).toString('hex')
         const csrfToken = crypto.randomBytes(16).toString('hex')

         setCookie(c, 'accessToken', accessTokens,{
            httpOnly:true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 15 * 60
         })

         setCookie(c, 'refreshToken', refreshToken,{
            httpOnly:true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60
         })

         setCookie(c, 'sessionId', sessionId, {
            httpOnly:true,
            secure: true,
            sameSite: 'strict'
         })

         const sessionData = {
            userId: user.id,
            username: user.username,
            email: user.email,
            refreshToken,
            csrfToken,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString,
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
      const sessionId = getCookie(c, 'sessionId')
      if(sessionId) {
         await redis.del(`session:${sessionId}`);
      }

      deleteCookie(c, 'sessionId')
      deleteCookie(c, 'accessToken')
      deleteCookie(c, 'refreshToken')

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