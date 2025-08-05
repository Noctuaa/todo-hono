/*|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|| The routes file is used for defining the HTTP routes.
|--------------------------------------------------------------------------
*/

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator'

// Import controllers
import { AuthController } from './controllers/AuthController.js'

// Import validation schemas
import { registerSchema, loginSchema } from './validations/authValidation.js';


// Define routes for authentication
const authRouter = new Hono()
   .post('/register', zValidator('json', registerSchema), AuthController.register)
   .post('/login', zValidator('json', loginSchema))
   .post('/logout');
   


const app = new Hono() // Main application instance
   .use('*', logger()) // Log all requests
   .route('/auth', authRouter)


type AppType = typeof app;

export default app as AppType;