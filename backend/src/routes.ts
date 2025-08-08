/*|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|| The routes file is used for defining the HTTP routes.
|--------------------------------------------------------------------------
*/

import { Hono } from 'hono';
import { cors } from 'hono/cors' 
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator'

// Import middleware
import { authMiddleware } from './middleware/authMiddleware.js';

// Import controllers
import { AuthController } from './controllers/AuthController.js'

// Import validation schemas
import { registerSchema, loginSchema } from './validations/authValidation.js';


// Define routes for authentication
const authRouter = new Hono()
   .get('/status', authMiddleware, AuthController.status)
   .post('/register', zValidator('json', registerSchema), AuthController.register)
   .post('/login', zValidator('json',loginSchema), AuthController.login)
   .post('/logout', authMiddleware, AuthController.logout);
   


const app = new Hono() // Main application instance
   .use('/*', cors({
      origin: 'http://localhost:5173',
      credentials: true
   }))
   .use('*', logger()) // Log all requests
   .route('/auth', authRouter)


type AppType = typeof app;

export default app as AppType;