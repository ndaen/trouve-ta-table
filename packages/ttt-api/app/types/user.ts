// packages/ttt-api/app/types/user.ts
import type { UUID, UserRole, SubscriptionPlan } from './common.js'

/**
 * User interface matching the User model
 */
export interface UserData {
	id: UUID
	email: string
	firstName: string
	lastName: string
	role: UserRole
	subscriptionPlan: SubscriptionPlan
	subscriptionExpiresAt: string | null
	lastLoginAt: string
	createdAt: string
	updatedAt: string
}

/**
 * User creation payload
 */
export interface CreateUserPayload {
	email: string
	password: string
	firstName: string
	lastName: string
	role?: UserRole
	subscriptionPlan?: SubscriptionPlan
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
	firstName?: string
	lastName?: string
	email?: string
	role?: UserRole
	subscriptionPlan?: SubscriptionPlan
}

/**
 * Login payload
 */
export interface LoginPayload {
	email: string
	password: string
}

/**
 * JWT payload for user authentication
 */
export interface JwtPayload {
	sub: UUID
	email: string
	firstName: string
	lastName: string
	fullName: string
	role: UserRole
	subscriptionPlan: SubscriptionPlan
	iat: number
	exp: number
	iss: string
	aud: string
}
