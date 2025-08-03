import { create } from 'zustand'
import { parseJWT } from '@/utils/jwt'
import { authApi } from '@/services/authApi'
import {
    type LoginWithRememberInput,
    type RegisterWithConfirmInput,
} from '@/schemas/auth'

interface User {
    sub: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: string
    subscriptionPlan: string
}

interface AuthState {
    user: User | null | undefined
    loading: boolean
    initialize: () => Promise<void>
    login: (credentials: LoginWithRememberInput) => Promise<void>
    register: (userData: RegisterWithConfirmInput) => Promise<void>
    logout: () => Promise<void>
    isAuth: () => boolean
    getToken: () => string | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,

    isAuth: () => {
        return get().user !== null
    },

    initialize: async () => {
        try {
            set({ loading: true })
            const token = localStorage.getItem("userToken")
            if (token) {
                try {
                    if (!get().user) {
                        const response = await authApi.checkAuthStatus()
                        if (response.isAuthenticated && response.token) {
                            const user = parseJWT(response.token)
                            localStorage.setItem("userToken", response.token)
                            set({ user })
                        } else {
                            localStorage.removeItem("userToken")
                            set({ user: null })
                        }
                    }
                } catch (error) {
                    console.log("Token invalide")
                    localStorage.removeItem("userToken")
                    set({ user: null })
                }
            } else {
                set({ loading: true })
                const response = await authApi.checkAuthStatus()
                if (response.isAuthenticated && response.token) {
                    const user = parseJWT(response.token)
                    localStorage.setItem("userToken", response.token)
                    set({ user })
                }
            }
        } catch (error) {
            console.error("Erreur lors de l'initialisation de l'auth:", error)
            set({ user: null })
        } finally {
            set({ loading: false })
        }
    },

    login: async (credentials) => {
        try {
            const response = await authApi.login(credentials)
            const user = parseJWT(response.token)
            localStorage.setItem("userToken", response.token)
            set({ user })
        } catch (error) {
            throw error
        }
    },

    register: async (userData) => {
        try {
            const response = await authApi.register(userData)
            const user = parseJWT(response.token)
            localStorage.setItem("userToken", response.token)
            set({ user })
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        localStorage.removeItem("userToken")
        set({ user: null })
        await authApi.logout()
    },

    getToken: () => {
        return localStorage.getItem("userToken")
    }
}))

export const initializeAuth = () => {
    useAuthStore.getState().initialize()
}

export const useIsAuthenticated = () => {
    const { user, loading } = useAuthStore()
    return !loading && user !== null
}