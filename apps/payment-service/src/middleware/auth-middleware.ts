import { getAuth } from '@hono/clerk-auth'
import { createMiddleware } from 'hono/factory'
import { auth } from 'hono/utils/basic-auth'

export const authMiddleware = createMiddleware<{
	Variables: {
		userId: string
	}
}>(async (c, next) => {
	const auth = getAuth(c)

	if (!auth.userId) {
		return c.json({
			message: 'You are not logged in.',
		})
	}

	c.set('userId', auth.userId)

	await next()
})
