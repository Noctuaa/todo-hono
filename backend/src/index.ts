import 'dotenv/config'
import { knex } from './config/database.js' 
import { serve } from '@hono/node-server'
import { RedisService } from './services/redisService.js'
import routes from './routes.js'


const port = process.env.PORT || 3000

/**
 * Graceful shutdown handler for production deployments
 * Properly closes Redis and database connections before exit
 * @param {string} signal - The received signal (SIGTERM/SIGINT)
 */
const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully...`)

    try {
      await RedisService.disconnect()
      await knex.destroy()

      console.log('All connections closed successfully')
      process.exit(0)
    } catch (error) {
      console.error('Error during shutdown:', error)
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

serve({
  fetch: routes.fetch,
  port: Number(port)
}, (info) => {
  console.log(`Server is running on http://localhost:${port}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV}`)
})
