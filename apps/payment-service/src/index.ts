import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { clerkMiddleware } from '@hono/clerk-auth'
import sessionRoute from './routes/session.route.js'
import { cors } from 'hono/cors'
import stripe from './utils/stripe.js'
import webhookRoute from './routes/webhooks.route.js'

const app = new Hono()
const port = Number(process.env.PORT ?? 8002)

app.use(
	'*',
	cors({
		origin: ['http://localhost:3002'],
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['GET', 'POST', 'OPTIONS'],
	}),
)
app.use('*', clerkMiddleware())

app.get('/', c => {
	return c.json({
		status: 'ok',
		uptime: process.uptime(),
		timeStamp: Date.now(),
	})
})

app.route('/sessions', sessionRoute)
app.route('/webhooks', webhookRoute)

app.post('/create-stripe-product', async c => {
	const res = await stripe.products.create({
		id: '123',
		name: 'Test Product',
		default_price_data: {
			currency: 'usd',
			unit_amount: 10 * 100,
		},
	})

	return c.json(res)
})

app.get('/stripe-product-price', async c => {
	const res = await stripe.prices.list({
		product: '123',
	})

	return c.json(res)
})

const start = async () => {
	try {
		const server = serve(
			{
				fetch: app.fetch,
				port,
			},
			info => {
				console.log(`Payment service is running on port ${info.port}`)
			},
		)

		server.on('error', error => {
			if ('code' in error && error.code === 'EADDRINUSE') {
				console.warn(
					`Payment service is already running on port ${port}. Reusing existing process.`,
				)
				process.exit(0)
			}

			throw error
		})
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}
start()
