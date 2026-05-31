import { auth } from '@clerk/nextjs/server'
import React from 'react'
import type { OrderType } from '../../../types'

const fetchOrders = async () => {
	const { getToken } = await auth()
	const token = await getToken()

	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/user-orders`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				cache: 'no-store',
			},
		)

		if (!res.ok) {
			console.warn(`Failed to fetch orders: ${res.status} ${res.statusText}`)
			return []
		}

		const data = await res.json()
		return Array.isArray(data) ? (data as OrderType[]) : []
	} catch (error) {
		console.error('Failed to fetch orders:', error)
		return []
	}
}

const OrdersPage = async () => {
	const orders = await fetchOrders()

	if (orders.length === 0) {
		return <div className=''>No orders found!</div>
	}

	console.log(orders)

	return (
		<div className=''>
			<h1 className='text-2xl my-4 font-medium'>Your Orders</h1>
			<ul>
				{orders.map(order => (
					<li key={order._id} className='flex items-center mb-4'>
						<div className='w-1/4'>
							<span className='font-medium text-sm text-gray-500'>
								Order ID
							</span>
							<p>{order._id}</p>
						</div>
						<div className='w-1/12'>
							<span className='font-medium text-sm text-gray-500'>Total</span>
							<p>{order.amount / 100}</p>
						</div>
						<div className='w-1/12'>
							<span className='font-medium text-sm text-gray-500'>Status</span>
							<p>{order.status}</p>
						</div>
						<div className='w-1/8'>
							<span className='font-medium text-sm text-gray-500'>Date</span>
							<p>
								{order.createdAt
									? new Date(order.createdAt).toLocaleDateString('en-US')
									: '-'}
							</p>
						</div>
						<div className=''>
							<span className='font-medium text-sm text-gray-500'>
								Products
							</span>
							<p>
								{order.products?.map(product => product.name).join(', ') || '-'}
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

export default OrdersPage
