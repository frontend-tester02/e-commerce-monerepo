import { Hono } from 'hono'
import stripe from '../utils/stripe'
import { authMiddleware } from '../middleware/auth-middleware'
import { CartItemsType } from '@repo/types'

const sessionRoute = new Hono()

sessionRoute.post('/create-checkout-session', authMiddleware, async c => {
	try {
		const { cart }: { cart: CartItemsType } = await c.req.json()
		const userId = c.get('userId')

		if (!Array.isArray(cart) || cart.length === 0) {
			return c.json({ message: 'Cart is empty.' }, 400)
		}

		const lineItems = await Promise.all(
			cart.map(item => {
				const unitAmount = Math.round(item.price * 100)

				if (!Number.isInteger(unitAmount) || unitAmount < 1) {
					throw new Error(`Invalid price for product ${item.name}`)
				}

				return {
					price_data: {
						currency: 'usd',
						product_data: {
							name: item.name,
							metadata: {
								productId: item.id.toString(),
								size: item.selectedSize,
								color: item.selectedColor,
							},
						},
						unit_amount: unitAmount,
					},
					quantity: item.quantity,
				}
			}),
		)

		const session = await stripe.checkout.sessions.create({
			line_items: lineItems,
			client_reference_id: userId,
			mode: 'payment',
			ui_mode: 'custom',
			return_url:
				'http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}',
		})

		if (!session.client_secret) {
			return c.json(
				{ message: 'Stripe did not return a checkout client secret.' },
				502,
			)
		}

		return c.json({ checkoutSessionClientSecret: session.client_secret })
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Failed to create checkout session.'

		console.error(error)

		return c.json({ message }, 500)
	}
})

sessionRoute.get('/:session_id', async c => {
	const { session_id } = c.req.param()
	const session = await stripe.checkout.sessions.retrieve(
		session_id as string,
		{
			expand: ['line_items'],
		},
	)

	console.log(session)

	return c.json({
		status: session.status,
		paymentStatus: session.payment_status,
	})
})

export default sessionRoute
