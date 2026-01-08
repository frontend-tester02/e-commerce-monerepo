import React from 'react'
import ProductList from '../../../components/shared/product-list'

const ProductsPage = async ({
	searchParams,
}: {
	searchParams: Promise<{ category: string }>
}) => {
	const category = (await searchParams).category
	return (
		<div className='pt-5'>
			<ProductList category={category} params='products' />
		</div>
	)
}

export default ProductsPage
