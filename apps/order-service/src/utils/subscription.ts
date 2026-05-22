import { consumer } from './kafka'
import { createOrder } from './order'

export const runKafkaSubscriptions = async () => {
	consumer.subscribe('payment.successful', async message => {
		const product = message.value
		console.log('Received message: payment.successful ', message)

		const order = message.value
		await createOrder(order)
	})

	// consumer.subscribe([
	// 	{
	// 		topicName: 'product.created',
	// 		topicHandler: async message => {
	// 			const product = message.value
	// 			console.log('Received message: product.created', product)

	// 			await createStripeProduct(product)
	// 		},
	// 	},
	// 	{
	// 		topicName: 'product.deleted',
	// 		topicHandler: async message => {
	// 			const productId = message.value
	// 			console.log('Received message: product.deleted', productId)

	// 			await deleteStripeProduct(productId)
	// 		},
	// 	},
	// ])
}
