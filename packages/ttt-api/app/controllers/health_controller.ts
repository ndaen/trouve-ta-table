import type { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'

export default class HealthController {
	async check({ response }: HttpContext) {
		try {
			await Database.rawQuery('SELECT 1')

			return response.status(200).json({
				status: 'ok',
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				database: 'connected'
			})
		} catch (error) {
			return response.status(503).json({
				status: 'error',
				timestamp: new Date().toISOString(),
				error: 'Database connection failed'
			})
		}
	}
}
