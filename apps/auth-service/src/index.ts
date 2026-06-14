import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import { authMiddleware } from './middleware/auth-middlesware.js'
import userRouter from './routes/user.route'

const app = express()

app.use(
	cors({
		origin: ['http://localhost:3003'],
		credentials: true,
	}),
)

app.use(express.json())
app.use(clerkMiddleware())

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err)
	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
	})
})

app.use('/users', authMiddleware, userRouter)

const start = async () => {
	try {
		
		app.listen(8003, () => {
			console.log('Auth service is running on 8003')
		})
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}

start()
