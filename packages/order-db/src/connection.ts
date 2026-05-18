import mongoose from 'mongoose'

let isConnected = false

export const isOrderDBConnected = () => isConnected

const getMongoUrlHost = (mongoUrl: string) => {
	try {
		return new URL(mongoUrl).host
	} catch {
		return 'configured MongoDB host'
	}
}

export const connectOrderDB = async () => {
	if (isConnected) return

	if (!process.env.MONGO_URL) {
		throw new Error('MONGO_URL is not defined in env file!')
	}

	try {
		await mongoose.connect(process.env.MONGO_URL)
		isConnected = true
		console.log('Connected to MongoDB')
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOTFOUND') {
			throw new Error(
				`Could not resolve MongoDB host "${getMongoUrlHost(process.env.MONGO_URL)}". Check that MONGO_URL uses the current Atlas connection string.`,
			)
		}

		throw error
	}
}
