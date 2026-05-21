import Fastify from 'fastify'
import { clerkPlugin, clerkClient, getAuth } from '@clerk/fastify'
import { authMiddleware } from './middleware/auth-middleware'
import { connectOrderDB } from '@repo/order-db'
import { orderRoute } from './routes/order'
import { consumer, producer } from './utils/kafka'

const fastify = Fastify({ logger: true })
const port = Number(process.env.PORT ?? 8001)

fastify.register(clerkPlugin)

fastify.get('/order', async (request, reply) => {
	return reply.status(200).send({
		status: 'ok',
		uptime: process.uptime(),
		timeStamp: Date.now(),
	})
})

fastify.get('/test', { preHandler: authMiddleware }, (request, reply) => {
	return reply.send({
		message: 'Order service is auth',
		userId: request.userId,
	})
})

fastify.register(orderRoute)

const start = async () => {
	try {
		try {
			Promise.all([
				await connectOrderDB(),
				await producer.connect(),
				await consumer.connect(),
			])
		} catch (error) {
			fastify.log.warn(error, 'Order database is unavailable')
		}

		await fastify.listen({ port })
		console.log(`Order service is running on port ${port}`)
	} catch (err) {
		if (err instanceof Error && 'code' in err && err.code === 'EADDRINUSE') {
			fastify.log.warn(
				`Order service is already running on port ${port}. Reusing existing process.`,
			)
			return
		}

		fastify.log.error(err)
		process.exit(1)
	}
}

start()
