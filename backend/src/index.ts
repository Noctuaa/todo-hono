import 'dotenv/config'
import './config/database.js'
import { serve } from '@hono/node-server'
import routes from './routes.js'


const port = process.env.PORT || 3000

serve({
  fetch: routes.fetch,
  port: Number(port)
}, (info) => {
  console.log(`Server is running on http://localhost:${port}`)
  console.log(`📦 Environment: ${process.env.NODE_ENV}`)
})
