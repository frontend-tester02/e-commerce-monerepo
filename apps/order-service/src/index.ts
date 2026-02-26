import Fastify from 'fastify'
import { clerkPlugin, clerkClient, getAuth } from '@clerk/fastify'
import { authMiddleware } from './middleware/auth-middleware'
import { connectOrderDB } from '@repo/order-db'
import { orderRoute } from './routes/order'

const fastify = Fastify({ logger: true })

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
		await connectOrderDB()
		await fastify.listen({ port: 8001 })
		console.log('Order service is running on port 8001')
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start()
