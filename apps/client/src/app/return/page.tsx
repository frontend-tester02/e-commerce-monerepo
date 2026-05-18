import Link from 'next/link'
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Clock3,
	ReceiptText,
	ShoppingBag,
} from 'lucide-react'

type ReturnPageSearchParams = Promise<{ session_id?: string }> | undefined

type PaymentSessionResponse = {
	status?: string
	paymentStatus?: string
	message?: string
}

const getPaymentServiceUrl = () => process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL

const getSession = async (sessionId: string) => {
	const paymentServiceUrl = getPaymentServiceUrl()

	if (!paymentServiceUrl) {
		return {
			ok: false,
			data: {
				message: 'Payment service URL is missing.',
			},
		}
	}

	const sessionUrl = new URL(`/sessions/${sessionId}`, paymentServiceUrl)
	try {
		const res = await fetch(sessionUrl, { cache: 'no-store' })
		const data = (await res.json()) as PaymentSessionResponse

		return {
			ok: res.ok,
			data,
		}
	} catch {
		return {
			ok: false,
			data: {
				message:
					'Payment service is unavailable. Please refresh this page in a moment.',
			},
		}
	}
}

const getPaymentView = (data: PaymentSessionResponse, ok: boolean) => {
	if (!ok) {
		return {
			icon: AlertCircle,
			iconClassName: 'bg-red-50 text-red-600',
			title: 'We could not confirm your payment',
			description:
				data.message ||
				'Your payment may still be processing. Please try checking again in a moment.',
			accentClassName: 'border-red-100 bg-red-50 text-red-700',
		}
	}

	if (data.paymentStatus === 'paid') {
		return {
			icon: CheckCircle2,
			iconClassName: 'bg-emerald-50 text-emerald-600',
			title: 'Payment successful',
			description:
				'Thank you for your order. Your payment was received and we are preparing your products.',
			accentClassName: 'border-emerald-100 bg-emerald-50 text-emerald-700',
		}
	}

	if (data.status === 'open') {
		return {
			icon: Clock3,
			iconClassName: 'bg-amber-50 text-amber-600',
			title: 'Payment is still pending',
			description:
				'Your checkout session is still open. You can return to checkout and complete your payment.',
			accentClassName: 'border-amber-100 bg-amber-50 text-amber-700',
		}
	}

	return {
		icon: AlertCircle,
		iconClassName: 'bg-red-50 text-red-600',
		title: 'Payment was not completed',
		description:
			'We did not receive a completed payment for this checkout session.',
		accentClassName: 'border-red-100 bg-red-50 text-red-700',
	}
}

const ReturnPage = async ({
	searchParams,
}: {
	searchParams: ReturnPageSearchParams
}) => {
	const sessionId = (await searchParams)?.session_id

	if (!sessionId) {
		return (
			<div className='mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-16'>
				<div className='w-full rounded-lg border border-red-100 bg-white p-8 text-center shadow-lg'>
					<div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600'>
						<AlertCircle className='h-8 w-8' />
					</div>
					<h1 className='text-2xl font-semibold text-gray-900'>
						Checkout session not found
					</h1>
					<p className='mt-3 text-sm leading-6 text-gray-500'>
						We could not find a payment session for this page.
					</p>
					<Link
						href='/cart'
						className='mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800'
					>
						Back to cart
						<ArrowRight className='h-4 w-4' />
					</Link>
				</div>
			</div>
		)
	}

	const { ok, data } = await getSession(sessionId)
	const view = getPaymentView(data, ok)
	const StatusIcon = view.icon

	return (
		<div className='mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16'>
			<div className='w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg'>
				<div className='px-6 py-10 text-center sm:px-10'>
					<div
						className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${view.iconClassName}`}
					>
						<StatusIcon className='h-10 w-10' />
					</div>
					<h1 className='text-3xl font-semibold text-gray-900'>{view.title}</h1>
					<p className='mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500'>
						{view.description}
					</p>
				</div>

				<div className='border-y border-gray-100 bg-gray-50 px-6 py-6 sm:px-10'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div className='rounded-lg border border-gray-100 bg-white p-4'>
							<p className='text-xs font-medium uppercase text-gray-400'>
								Checkout
							</p>
							<p className='mt-2 text-sm font-medium capitalize text-gray-900'>
								{data.status || 'Unknown'}
							</p>
						</div>
						<div className='rounded-lg border border-gray-100 bg-white p-4'>
							<p className='text-xs font-medium uppercase text-gray-400'>
								Payment
							</p>
							<p className='mt-2 text-sm font-medium capitalize text-gray-900'>
								{data.paymentStatus || 'Unknown'}
							</p>
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10'>
					<div
						className={`flex min-h-16 items-center gap-3 rounded-lg border px-4 py-3 text-sm ${view.accentClassName}`}
					>
						<ReceiptText className='h-5 w-5 shrink-0' />
						<span>
							Keep this page for your records while your order is processed.
						</span>
					</div>
					<div className='flex flex-col gap-3 sm:flex-row'>
						<Link
							href='/products'
							className='inline-flex min-h-16 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<ShoppingBag className='h-4 w-4' />
							Continue shopping
						</Link>
						<Link
							href='/orders'
							className='inline-flex min-h-16 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800'
						>
							View orders
							<ArrowRight className='h-4 w-4' />
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ReturnPage
