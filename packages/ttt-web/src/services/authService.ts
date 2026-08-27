import { LoginSchema } from '@/schemas/authSchemas.ts'
import { api } from '@/utils/apiClient'

interface LoginCredentials {
    email: string
    password: string
    rememberMe?: boolean
}

interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface AuthUser {
    id: string
    email: string
    firstName: string
    lastName: string
}

interface AuthResponse {
    message: string
    user: AuthUser
}

interface MeResponse {
    user: AuthUser
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const loginInformation = LoginSchema.parse({
            email: credentials.email,
            password: credentials.password,
        })

        return api.post<AuthResponse>('/api/auth/login', {
            ...loginInformation,
            rememberMe: credentials.rememberMe,
        })
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/api/auth/register', userData)
    },

    async logout(): Promise<{ message: string }> {
        return api.post('/api/auth/logout')
    },

    async me(): Promise<MeResponse> {
        return api.get<MeResponse>('/api/auth/me')
    },
}
