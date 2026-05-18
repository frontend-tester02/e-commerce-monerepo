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
		<form onSubmit={handleSubmit}>
			<PaymentElement options={{ layout: 'accordion' }} />
			<button disabled={loading || checkout.type !== 'success'} type='submit'>
				{loading ? 'Loading...' : 'Pay'}
			</button>
			{checkout.type === 'error' && (
				<div className=''>{checkout.error.message}</div>
			)}
			{error && <div className=''>{error.message}</div>}
		</form>
	)
}

export default CheckoutForm
