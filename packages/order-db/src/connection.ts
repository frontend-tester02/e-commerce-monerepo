import mongoose from 'mongoose'

let connectionPromise: Promise<typeof mongoose> | null = null

type MongooseConnectionError = Error & {
	code?: string
}

export const isOrderDBConnected = () => mongoose.connection.readyState === 1

const getMongoUrlHost = (mongoUrl: string) => {
	try {
		return new URL(mongoUrl).host
	} catch {
		return 'configured MongoDB host'
	}
}

export const connectOrderDB = async () => {
	if (isOrderDBConnected()) return mongoose
	if (connectionPromise) return connectionPromise

	const mongoUrl = process.env.MONGO_URL

	if (!mongoUrl) {
		throw new Error('MONGO_URL is not defined in env file!')
	}

	try {
		connectionPromise = mongoose.connect(mongoUrl)
		await connectionPromise
		connectionPromise = null
		console.log('Connected to MongoDB')

		return mongoose
	} catch (error) {
		connectionPromise = null
		const connectionError = error as MongooseConnectionError

		if (connectionError.code === 'ENOTFOUND') {
			throw new Error(
				`Could not resolve MongoDB host "${getMongoUrlHost(mongoUrl)}". Check that MONGO_URL uses the current Atlas connection string.`,
			)
		}

		throw error
	}
}
