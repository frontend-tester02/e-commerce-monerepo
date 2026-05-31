import Link from 'next/link'
import Categories from './categories'
import ProductCard from '../cards/product.card'
import Filter from './filter'
import { ProductType } from '../../types'

const fetchData = async ({
	category,
	sort,
	search,
	params,
}: {
	category?: string
	sort?: string
	search?: string
	params: 'homepage' | 'products'
}) => {
	try {
		const queryParams = new URLSearchParams({
			sort: sort || 'newest',
		})

		if (category) queryParams.set('category', category)
		if (search) queryParams.set('search', search)
		if (params === 'homepage') queryParams.set('limit', '10')

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?${queryParams.toString()}`,
		)

		if (!res.ok) {
			console.warn(`Failed to fetch products: ${res.status} ${res.statusText}`)
			return []
		}

		const data = await res.json()
		return Array.isArray(data) ? (data as ProductType[]) : []
	} catch (error) {
		console.error('Failed to fetch products:', error)
		return []
	}
}

const ProductList = async ({
	category,
	sort,
	search,
	params,
}: {
	category: string
	sort?: string
	search?: string
	params: 'homepage' | 'products'
}) => {
	const products = await fetchData({ category, sort, search, params })
	return (
		<div className='w-full'>
			<Categories />
			{params === 'products' && <Filter />}
			<div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12'>
				{products.length > 0 ? (
					products.map(product => (
						<ProductCard key={product.id} product={product} />
					))
				) : (
					<p className='text-sm text-gray-500'>No products found.</p>
				)}
			</div>
			<Link
				href={category ? `/products/?category=${category}` : '/products'}
				className='flex justify-end mt-4 underline text-sm text-gray-500'
			>
				View all products
			</Link>
		</div>
	)
}

export default ProductList
