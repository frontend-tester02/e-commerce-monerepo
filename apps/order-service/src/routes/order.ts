import { FastifyInstance } from 'fastify'
import { adminMiddleware, authMiddleware } from '../middleware/auth-middleware'
import { isOrderDBConnected, Order } from '@repo/order-db'

export const orderRoute = async (fastify: FastifyInstance) => {
	fastify.get(
		'/user-orders',
		{ preHandler: authMiddleware },
		async (request, reply) => {
			if (!isOrderDBConnected()) {
				return reply.status(503).send({
					error: 'Order database is unavailable',
				})
			}

			const orders = await Order.find({ userId: request.userId })
			return reply.send(orders)
		},
	)

	fastify.get(
		'/orders',
		{ preHandler: adminMiddleware },
		async (request, reply) => {
			if (!isOrderDBConnected()) {
				return reply.status(503).send({
					error: 'Order database is unavailable',
				})
			}

			const orders = await Order.find()
			return reply.send(orders)
		},
	)
}
