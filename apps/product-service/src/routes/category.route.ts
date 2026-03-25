import { Router } from 'express'
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from '../contollers/category.contoller'
import { adminMiddleware } from '../middleware/auth-middlesware'

const router: Router = Router()

router.post('/', adminMiddleware, createCategory)
router.put('/:id', adminMiddleware, updateCategory)
router.delete('/:id', adminMiddleware, deleteCategory)
router.get('/', getCategories)

export default router
