import type {HttpContext} from '@adonisjs/core/http'
import {loginValidator, registerValidator} from "#validators/auth";
import User from "#models/user";
import {DateTime} from "luxon";
import JwtService from "#services/jwt_service";

export default class AuthController {
	async register({request, response, auth}: HttpContext) {
		try {
			const payload = await request.validateUsing(registerValidator)

			const user = await User.create({
				firstName: payload.firstName,
				lastName: payload.lastName,
				email: payload.email,
				password: payload.password,
			})

			await auth.use('web').login(user)

			const token = JwtService.generateToken(user);

			return response.status(201).json({
				message: 'Inscription réussie',
				token
			})
		} catch (error) {
			return response.status(422).json({
				message: 'Erreur de validation',
				errors: error.messages || error.message
			})
		}
	}

	async login({request, response, auth}: HttpContext) {
		try {
			const {email, password, rememberMe} = await request.validateUsing(loginValidator)

			const user = await User.verifyCredentials(email, password)

			user.lastLoginAt = DateTime.now()
			await user.save()

			await auth.use('web').login(user, !!rememberMe)

			const token = JwtService.generateToken(user)
			return response.json({
				message: 'Connexion réussie',
				token
			})
		} catch (error) {
			return response.status(422).json({
				message: 'Email ou mot de passe incorrect',
				errors: {credentials: ['Identifiants invalides'], error: error.message}
			})
		}
	}

	async logout({response, auth}: HttpContext) {
		await auth.use('web').logout()

		return response.json({
			message: 'Déconnexion réussie'
		})
	}

	async me({response, auth}: HttpContext) {
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

	async check({response, auth}: HttpContext) {
		const isLoggedIn = await auth.check()

		return response.json({
			isAuthenticated: isLoggedIn,
			token: isLoggedIn ? JwtService.generateToken(auth.user!) : null
		})
	}
}
