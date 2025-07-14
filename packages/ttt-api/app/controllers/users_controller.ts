import type {HttpContext} from '@adonisjs/core/http'
import User from '#models/user'
import {UserService} from "#services/user_service";

export default class UsersController {
	private userService: UserService

	constructor() {
		this.userService = new UserService()
	}

	public async index({response}: HttpContext) {
		const users = await this.userService.getAll();
		return response.json({message: 'List of users', data: users})
	}

	public async show({params, response}: HttpContext) {
		const userId = params.id
		const user = await this.userService.getById(userId);
		if (!user) {
			return response.status(404).json({message: 'User not found'})
		}
		return response.json({message: `User details for ID: ${userId}`, user})
	}

	public async update({params, request, response}: HttpContext) {
		const userId = params.id
		const result = await this.userService.updateUser(userId, request.only(['role', 'firstName', 'lastName', 'subscriptionPlan', 'subscriptionExpiresAt']));
		if (!(result instanceof User)) {
			return response.status(result.status || 500).json({message: result.error})
		}
		return response.json({message: `User updated successfully`, result})
	}

	public async delete({params, response, auth}: HttpContext) {
		const userId = params.id
		const result = await this.userService.deleteUser(userId, auth.user!);
		if (result.error) {
			return response.status(result.status).json({message: result.error})
		}
		return response.json({message: `User with ID: ${userId} deleted successfully`})
	}
}
