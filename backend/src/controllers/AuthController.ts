import type { Context } from 'hono'
import { User } from '../models/User.js';
import argon2 from 'argon2';
import { sign } from 'hono/jwt';
import { COOKIE_NAMES, setAccessToken, setRefreshToken, setAppSessionId, clearAuthCookies} from '../services/cookieService.js';
import { getCookie } from 'hono/cookie';
import { type RegisterPayload, type LoginPayload } from '../validations/authValidation.js';
import { RedisService } from '../services/redisService.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';

/**
 * AuthController - handles user authentication operations
 * Manages user registration, login, logout, and session status
 * Uses JWT tokens with Redis session storage for enhanced security
 */
export class AuthController {

   /**
    * Register a new user account
    * @param {Context} c - Hono context object
    * @returns {Promise<Response>} JSON response with user data or error
    * @throws {400} If user already exists
    * @throws {500} If registration fails
    */
   static async register(c: Context): Promise<Response> {
      try {
         // @ts-ignore - The zValidator middleware manages validation
         const payload: RegisterPayload = c.req.valid('json');

         const existingUser = await User.query().where('email', payload.email).first();
         if(existingUser) {
            return c.json({ errors: {email: 'Cette email existe déjà'} }, 400);
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

   /**
    * Authenticate user and create session
    * Generates JWT access token, refresh token, and stores session in Redis
    * @param {Context} c - Hono context object
    * @returns {Promise<Response>} JSON response with user data and CSRF token
    * @throws {401} If credentials are invalid
    * @throws {500} If login process fails
    */
   static async login(c: Context): Promise<Response> {
      try {
         // @ts-ignore - The zValidator middleware manages validation
         const payload: LoginPayload = c.req.valid('json');

         const errorStatus = c.json({ errors: {overall: 'Email ou mot de passe incorrect'}}, 401); // Unauthorized

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

         await RedisService.setSession(sessionId, sessionData, rememberMe)

         return c.json({
            message: 'User logged in successfully',
            user: {
               id: user.id,
               username: user.username,
               connected: true,
               csrfToken: csrfToken
            }
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

   /**
    * Logout user and cleanup session
    * Removes session from Redis and clears authentication cookies
    * @param {Context} c - Hono context object
    * @returns {Promise<Response>} JSON success response
    */
   static async logout(c: Context): Promise<Response> {
      const sessionId = getCookie(c, COOKIE_NAMES.APP_ID)

      if(sessionId) {
         await RedisService.deleteSession(sessionId);
      }

      clearAuthCookies(c);

      return c.json({
         success: true,
         message: 'Logged out successfully'
      })
   };

   /**
    * Get current user authentication status
    * Updates session activity timestamp and returns user information
    * @param {Context} c - Hono context object (user must be authenticated)
    * @returns {Promise<Response>} JSON response with user data and CSRF token
    */
   static async status(c:Context): Promise<Response> {
      const user = c.get('user')

      return c.json({
         user : {
            id: user.id,
            username: user.username,
            connected: true,
            csrfToken: user.csrfToken
         }
      })
   }
}