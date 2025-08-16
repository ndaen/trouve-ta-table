export interface JWTPayload {
    sub: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: 'admin' | 'user'
    subscriptionPlan: 'free' | 'starter' | 'pro' | 'enterprise'
    iat: number
    exp: number
    iss: string
    aud: string
}

export function parseJWT(token: string): JWTPayload {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch {
        throw new Error('Token JWT invalide')
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const decoded = parseJWT(token)
        return decoded.exp * 1000 < Date.now()
    } catch {
        return true
    }
}

export function getTokenTimeToExpire(token: string): number {
    try {
        const decoded = parseJWT(token)
        return Math.max(0, (decoded.exp * 1000) - Date.now())
    } catch {
        return 0
    }
}

export function isTokenExpiringSoon(token: string, minutesThreshold: number = 5): boolean {
    const timeToExpire = getTokenTimeToExpire(token)
    return timeToExpire < (minutesThreshold * 60 * 1000)
}