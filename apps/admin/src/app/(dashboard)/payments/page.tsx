import { OrderType } from '@repo/types'
import { columns } from './columns'
import { DataTable } from './data-table'
import { auth } from '@clerk/nextjs/server'

const getData = async (): Promise<OrderType[]> => {
	try {
		const orderServiceUrl = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL

		if (!orderServiceUrl) {
			console.error('NEXT_PUBLIC_ORDER_SERVICE_URL is not configured')
			return []
		}

		const { getToken } = await auth()
		const token = await getToken()

		if (!token) {
			console.error('Unable to fetch payments: Clerk token is missing')
			return []
		}

		const res = await fetch(`${orderServiceUrl}/orders`, {
			cache: 'no-store',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		const data = await res.json()

		if (!res.ok) {
			console.error('Unable to fetch payments', {
				status: res.status,
				body: data,
			})
			return []
		}

		if (!Array.isArray(data)) {
			console.error('Payments endpoint returned non-array data', data)
			return []
		}

		return data
	} catch (err) {
		console.error('Unable to fetch payments', err)
		return []
	}
}

const PaymentsPage = async () => {
	const data = await getData()
	console.log(`Loaded ${data.length} payments`)

	return (
		<div className=''>
			<div className='mb-8 px-4 py-2 bg-secondary rounded-md'>
				<h1 className='font-semibold'>All Payments</h1>
			</div>
			<DataTable columns={columns} data={data} />
		</div>
	)
}

export default PaymentsPage
