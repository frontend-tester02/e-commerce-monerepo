/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useAuth } from '@clerk/nextjs'
import { CheckoutElementsProvider } from '@stripe/react-stripe-js/checkout'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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
	const [clientSecret, setClientSecret] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const { getToken, isLoaded, isSignedIn } = useAuth()
	const { cart, hasHydrated } = useCart()

	useEffect(() => {
		if (!isLoaded || !hasHydrated) return

		const createCheckoutSession = async () => {
			setLoading(true)
			setError(null)
			setClientSecret(null)

			if (!isSignedIn) {
				setError('Please sign in before payment.')
				setLoading(false)
				return
			}

			if (cart.length === 0) {
				setError('Your cart is empty.')
				setLoading(false)
				return
			}

			try {
				const token = await getToken()

				if (!token) {
					throw new Error('Unable to get your sign-in token.')
				}

				const nextClientSecret = await fetchClientSecret(token, cart)
				setClientSecret(nextClientSecret)
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: 'Failed to load the payment form.',
				)
			} finally {
				setLoading(false)
			}
		}

		createCheckoutSession()
	}, [cart, getToken, hasHydrated, isLoaded, isSignedIn])

	if (!stripePublishableKey) {
		return (
			<div className='rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700'>
				Stripe publishable key is missing.
			</div>
		)
	}

	if (loading) {
		return (
			<div className='flex min-h-64 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-500'>
				Loading secure payment form...
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700'>
				<p>{error}</p>
				{!isSignedIn && (
					<Link
						href='/sign-in'
						className='w-max rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800'
					>
						Sign in
					</Link>
				)}
			</div>
		)
	}

	if (!clientSecret) {
		return (
			<div className='rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700'>
				Payment form could not be started.
			</div>
		)
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
