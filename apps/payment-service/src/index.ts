import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { authMiddleware } from './middleware/auth-middleware.js'

const app = new Hono()

app.use('*', clerkMiddleware())

app.get('/', c => {
	return c.json({
		status: 'ok',
		uptime: process.uptime(),
		timeStamp: Date.now(),
	})
})

app.get('/test', authMiddleware, c => {
	return c.json({
		message: 'Payment service is auth',
		userId: c.get('userId'),
	})
})

const start = async () => {
	try {
		serve(
			{
				fetch: app.fetch,
				port: 8002,
			},
			info => {
				console.log(`Payment service is running on port 8002`)
			}
		)
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}
start()
