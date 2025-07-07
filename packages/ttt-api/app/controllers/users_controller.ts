import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  public async index({ response }: HttpContext) {
    const users = await User.all();
    response.json({ message: 'List of users', data: users })
  }

  public async show({ params, response }: HttpContext) {

    const userId = params.id
    response.json({ message: `User details for ID: ${userId}` })
  }

}
