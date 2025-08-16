import jwt from 'jsonwebtoken'
import env from '#start/env'
import type User from '#models/user'

export default class JwtService {
    private static secret = env.get('JWT_SECRET')!

    static generateToken(user: User, expiresIn: number = 60 * 60 * 24): string {
        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            subscriptionPlan: user.subscriptionPlan,
            iat: Math.floor(Date.now() / 1000),
        }

        const secretKey = this.secret as jwt.Secret

        return jwt.sign(payload, secretKey, {
            expiresIn: expiresIn,
            issuer: 'trouve-ta-table-api',
            audience: 'trouve-ta-table-frontend',
        })
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.secret)
        } catch (error) {
            throw new Error('Token invalide')
        }
    }

    static decodeToken(token: string): any {
        return jwt.decode(token)
    }
}
