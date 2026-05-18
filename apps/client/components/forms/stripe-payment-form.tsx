/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useAuth } from '@clerk/nextjs'
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useMemo, useState } from 'react'
import useCart from '../../hooks/use-cart'
import { ShippingFormInputs } from '../../lib/validation'
import { CartItemsType } from '../../types'
import CheckoutForm from './checkout-form'

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null

const getErrorMessage = (json: unknown) => {
	if (json && typeof json === 'object' && 'message' in json) {
		const message = json.message

		if (typeof message === 'string') {
			return message
		}
	}

	return 'Failed to create checkout session'
}

const fetchClientSecret = async (token: string, cart: CartItemsType) => {
	const paymentServiceUrl = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL

	if (!paymentServiceUrl) {
		throw new Error('Payment service URL is missing.')
	}

	const checkoutSessionUrl = new URL(
		'/sessions/create-checkout-session',
		paymentServiceUrl,
	)

	const response = await fetch(checkoutSessionUrl, {
		method: 'POST',
		body: JSON.stringify({
			cart,
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})

	const json: unknown = await response.json()

	if (!response.ok) {
		throw new Error(getErrorMessage(json))
	}

	const clientSecret =
		json && typeof json === 'object' && 'checkoutSessionClientSecret' in json
			? json.checkoutSessionClientSecret
			: null

	if (typeof clientSecret !== 'string' || !clientSecret.includes('_secret_')) {
		throw new Error('Invalid checkout session client secret')
	}

	return clientSecret
}

const StripePaymentForm = ({
	shippingForm,
}: {
	shippingForm: ShippingFormInputs
}) => {
	const [token, setToken] = useState<string | null>(null)
	const { getToken } = useAuth()
	const { cart } = useCart()

	const clientSecret = useMemo(() => {
		if (!token) return null
		return fetchClientSecret(token, cart)
	}, [token, cart])

	useEffect(() => {
		getToken().then(token => setToken(token))
	}, [])

	if (!stripePublishableKey) {
		return <div className=''>Stripe publishable key is missing.</div>
	}

	if (!clientSecret) {
		return <div className=''>Loading...</div>
	}
	return (
		<CheckoutElementsProvider
			stripe={stripe}
			options={{ clientSecret }}
		>
			<CheckoutForm shippingForm={shippingForm} />
		</CheckoutElementsProvider>
	)
}

export default StripePaymentForm
