import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  public async index({ response }: HttpContext) {
    const users = await User.all();
    response.json({ message: 'List of users', data: users })
  }

  public async show({ params, response }: HttpContext) {
    const userId = params.id
    const user = await User.findBy('id', userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }
    response.json({ message: `User details for ID: ${userId}`, user })
  }
  public async update({ params, request, response }: HttpContext) {
    const userId = params.id
    const user = await User.findBy('id', userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    const payload = request.body()
    user.merge(payload)
    await user.save()

    response.json({ message: `User updated successfully`, user })
  }

  public async delete({ params, response, auth }: HttpContext) {
    const userId = params.id
    const user = await User.findBy('id', userId);
    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'admin' && auth.user?.role !== 'admin') {
      return response.status(403).json({ message: 'Cannot delete an admin user' })
    }

    await user.delete()
    response.json({ message: `User with ID: ${userId} deleted successfully` })
  }
}
