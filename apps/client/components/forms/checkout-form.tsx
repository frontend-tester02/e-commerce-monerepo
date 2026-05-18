'use client'

import { ShippingFormInputs } from '../../lib/validation'
import { type FormEvent, useState } from 'react'
import {
	PaymentElement,
	useCheckout,
} from '@stripe/react-stripe-js/checkout'

const CheckoutForm = ({
	shippingForm,
}: {
	shippingForm: ShippingFormInputs
}) => {
	const checkout = useCheckout()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<{ message: string } | null>(null)

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (checkout.type !== 'success') return

		setLoading(true)
		setError(null)

		const emailResult = await checkout.checkout.updateEmail(shippingForm.email)
		if (emailResult.type === 'error') {
			setError(emailResult.error)
			setLoading(false)
			return
		}

		const shippingResult = await checkout.checkout.updateShippingAddress({
			name: shippingForm.name,
			address: {
				line1: shippingForm.address,
				city: shippingForm.city,
				country: 'US',
			},
		})
		if (shippingResult.type === 'error') {
			setError(shippingResult.error)
			setLoading(false)
			return
		}

		const res = await checkout.checkout.confirm()
		if (res.type === 'error') {
			setError(res.error)
		}
		setLoading(false)
	}
	return (
		<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
			<PaymentElement options={{ layout: 'accordion' }} />

			<button
				className='w-full rounded-lg bg-gray-800 p-3 text-sm font-medium text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300'
				disabled={loading || checkout.type !== 'success'}
				type='submit'
			>
				{loading ? 'Loading...' : 'Pay'}
			</button>

			{checkout.type === 'error' && (
				<div className='rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700'>
					{checkout.error.message}
				</div>
			)}
			{error && (
				<div className='rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700'>
					{error.message}
				</div>
			)}
		</form>
	)
}

export default CheckoutForm
