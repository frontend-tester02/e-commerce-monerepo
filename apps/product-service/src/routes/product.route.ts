import { Router } from 'express'
import {
	createProduct,
	deleteProduct,
	getProduct,
	getProducts,
	updateProduct,
} from '../contollers/product.contoller'
import { adminMiddleware } from '../middleware/auth-middlesware'

const router: Router = Router()

router.post('/', createProduct)
router.put('/:id', adminMiddleware, updateProduct)
router.delete('/:id', adminMiddleware, deleteProduct)
router.get('/', getProducts)
router.get('/:id', getProduct)

export default router
