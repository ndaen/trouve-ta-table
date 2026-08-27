// packages/ttt-api/app/types/user.ts
import type { UUID, UserRole } from './common.js'

/**
 * User interface matching the User model
 */
export interface UserData {
    id: UUID
    email: string
    firstName: string
    lastName: string
    role: UserRole
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
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
    firstName?: string
    lastName?: string
    email?: string
    role?: UserRole
}

/**
 * Login payload
 */
export interface LoginPayload {
    email: string
    password: string
}
