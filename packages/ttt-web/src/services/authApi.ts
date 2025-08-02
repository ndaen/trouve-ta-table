
import { LoginSchema } from "@/schemas/auth.ts"
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

interface AuthResponse {
    message: string
    token: string
    tokenType: 'Bearer'
}

interface CheckResponse {
    isAuthenticated: boolean
    token?: string
    tokenType?: 'Bearer'
}

export const authApi = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const loginInformation = LoginSchema.parse({
            email: credentials.email,
            password: credentials.password
        })

        return api.post<AuthResponse>('/api/auth/login', {
            ...loginInformation,
            rememberMe: credentials.rememberMe
        })
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/api/auth/register', userData)
    },

    async logout(): Promise<{ message: string }> {
        return api.post('/api/auth/logout')
    },

    async checkAuthStatus(): Promise<CheckResponse> {
        try {
            return await api.get<CheckResponse>('/api/auth/check')
        } catch (error) {
            return { isAuthenticated: false }
        }
    },

    async me(): Promise<AuthResponse> {
        return api.get<AuthResponse>('/api/auth/me')
    },

    async refreshToken(): Promise<AuthResponse> {
        return api.post<AuthResponse>('/api/auth/refresh-token')
    },
}