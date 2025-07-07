import type { HttpContext } from '@adonisjs/core/http'
import {loginValidator, registerValidator} from "#validators/auth";
import User from "#models/user";
import {DateTime} from "luxon";

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    console.log('=== REGISTER CALLED ===')
    console.log('Request body:', request.body())
    console.log('Auth object exists:', !!auth)

    try {
      const payload = await request.validateUsing(registerValidator)

      const user = await User.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
      })

      await auth.use('web').login(user)

      return response.status(201).json({
        message: 'Inscription réussie',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName
        }
      })
    } catch (error) {
      return response.status(422).json({
        message: 'Erreur de validation',
        errors: error.messages || error.message
      })
    }
  }

  async login({ request, response, auth }: HttpContext) {
    try {
      const { email, password, rememberMe } = await request.validateUsing(loginValidator)

      const user = await User.verifyCredentials(email, password)

      user.lastLoginAt = DateTime.now()
      await user.save()

      await auth.use('web').login(user, !!rememberMe)

      return response.json({
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName
        }
      })
    } catch (error) {
      return response.status(422).json({
        message: 'Email ou mot de passe incorrect',
        errors: { credentials: ['Identifiants invalides'], error: error.message }
      })
    }
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()

    return response.json({
      message: 'Déconnexion réussie'
    })
  }

  async me({ response, auth }: HttpContext) {
    const user = auth.user!

    return response.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    })
  }

  async check({ response, auth }: HttpContext) {
    const isLoggedIn = await auth.check()

    return response.json({
      isAuthenticated: isLoggedIn,
      user: isLoggedIn ? {
        id: auth.user!.id,
        email: auth.user!.email,
        firstName: auth.user!.firstName,
        lastName: auth.user!.lastName,
        fullName: auth.user!.fullName
      } : null
    })
  }
}
