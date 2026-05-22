import stripe from './stripe'
import { StripeProductType } from '@repo/types'

export const createStripeProduct = async (item: StripeProductType) => {
	try {
		const res = await stripe.products.create({
			id: item.id,
			name: item.name,
			default_price_data: {
				currency: 'usd',
				unit_amount: item.price * 100,
			},
		})
		return res
	} catch (error) {
		console.log(error)
		return error
	}
}

export const getStripeProductPrice = async (productId: number) => {
	const res = await stripe.prices.list({
		product: productId.toString(),
		limit: 1,
	})
	const unitAmount = res.data[0]?.unit_amount

	if (typeof unitAmount !== 'number') {
		throw new Error(`Stripe price not found for product ${productId}`)
	}

	return unitAmount
}

export const deleteStripeProduct = async (productId: number) => {
	try {
		const res = await stripe.products.del(productId.toString())
		return res
	} catch (error) {
		console.log(error)
		return error
	}
}
