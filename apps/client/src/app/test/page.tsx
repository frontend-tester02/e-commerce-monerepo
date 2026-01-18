import { auth } from '@clerk/nextjs/server'

const Page = async () => {
	const { getToken, userId } = await auth()
	const token = await getToken()
	console.log(token)
	console.log(userId)

	const resProduct = await fetch('http://localhost:8000/test', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	const dataProduct = await resProduct.json()
	console.log(dataProduct)

	const resOrder = await fetch('http://localhost:8001/test', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	const dataOrder = await resOrder.json()
	console.log(dataOrder)

	const resPayment = await fetch('http://localhost:8002/test', {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})
	const dataPayment = await resPayment.json()
	console.log(dataPayment)

	return <div>Page</div>
}

export default Page
