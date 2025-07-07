export type USER_ROLES = 'admin' | 'user'

export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: USER_ROLES
}

