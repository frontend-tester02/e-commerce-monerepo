import { Hono } from 'hono'
import Stripe from 'stripe'
import stripe from '../utils/stripe'
import { producer } from '../utils/kafka'

const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET ?? '').trim()
const webhookRoute = new Hono()

webhookRoute.post('/stripe', async c => {
	const body = await c.req.text()
	const sig = c.req.header('stripe-signature')

	let event: Stripe.Event

	try {
		if (!webhookSecret) {
			console.error('STRIPE_WEBHOOK_SECRET is missing')
			return c.json({ error: 'Webhook secret is not configured' }, 500)
		}

		event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
	} catch (error) {
		console.log('Webhook verification failed!')
		return c.json({ error: 'Webhook verification failed!' }, 400)
	}

	switch (event.type) {
		case 'checkout.session.completed':
			const session = event.data.object as Stripe.Checkout.Session
			const userId = session.client_reference_id
			const email = session.customer_details?.email ?? session.customer_email
			const amount = session.amount_total

			if (!userId || !email || amount == null) {
				console.error('Missing required checkout session fields:', {
					userId,
					email,
					amount,
					sessionId: session.id,
				})
				break
			}

			const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
			// TODO: CREATE ORDER
			await producer.send('payment.successful', {
				value: {
					userId,
					email,
					amount,
					status: session.payment_status === 'paid' ? 'success' : 'failed',
					products: lineItems.data.map(item => ({
						name: item.description,
						quantity: item.quantity,
						price: item.price?.unit_amount,
					})),
				},
			})

			break

		default:
			break
	}

	return c.json({ received: true })
})

export default webhookRoute
