import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class GuestMiddleware {
    redirectTo = '/dashboard'

    async handle(ctx: HttpContext, next: NextFn) {
        const isAuthenticated = await ctx.auth.check()

        if (isAuthenticated) {
            return ctx.response.status(403).json({
                message: 'Déjà authentifié',
                error: 'Already authenticated',
            })
        }

        return next()
    }
}
