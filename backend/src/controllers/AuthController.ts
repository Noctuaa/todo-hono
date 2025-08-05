import type { Context } from 'hono'
import { User } from '../models/User.js';
import argon2 from 'argon2';
import { type RegisterPayload } from '../validations/authValidation.js';

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
   }
}