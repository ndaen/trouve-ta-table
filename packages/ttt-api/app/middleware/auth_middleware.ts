import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class AuthMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const guards = options?.guards?.length ? options.guards : [ctx.auth.defaultGuard]

    try {
      await ctx.auth.authenticateUsing(guards)
      return next()
    } catch (error) {
      return ctx.response.status(401).json({
        message: 'Non authentifié',
        error: 'Unauthorized'
      })
    }
  }
}
