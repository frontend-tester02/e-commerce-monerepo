import { FastifyInstance } from 'fastify'
import { request } from 'http'
import { authMiddleware } from '../middleware/auth-middleware'
import { Order } from '@repo/order-db'

export const orderRoute = async (fastify: FastifyInstance) => {
	fastify.get(
		'/user-oder',
		{ preHandler: authMiddleware },
		async (request, reply) => {
			const orders = await Order.find({ userId: request.userId })
			return reply.send(orders)
		},
	)

	fastify.get('/orders', async (request, reply) => {
		const orders = await Order.find()
		return reply.send(orders)
	})
}
