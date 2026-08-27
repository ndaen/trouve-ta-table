import { create } from 'zustand'
import { authService, type AuthUser } from '@/services/authService.ts'
import {
    type LoginWithRememberInput,
    type RegisterWithConfirmInput,
} from '@/schemas/authSchemas'

interface AuthState {
    user: AuthUser | null | undefined
    loading: boolean
    initialize: () => Promise<void>
    login: (credentials: LoginWithRememberInput) => Promise<void>
    register: (userData: RegisterWithConfirmInput) => Promise<void>
    logout: () => Promise<void>
    isAuth: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true,

    isAuth: () => {
        return get().user !== null
    },

    initialize: async () => {
        set({ loading: true })
        try {
            const response = await authService.me()
            set({ user: response.user })
        } catch {
            set({ user: null })
        } finally {
            set({ loading: false })
        }
    },

    login: async (credentials) => {
        try {
            const response = await authService.login(credentials)
            set({ user: response.user })
        } catch (error) {
            console.warn("Erreur lors de la connexion:", error)
            throw error
        }
    },

    register: async (userData) => {
        const response = await authService.register(userData)
        set({ user: response.user })
    },

    logout: async () => {
        await authService.logout()
        set({ user: null })
    },
}))

export const initializeAuth = () => {
    useAuthStore.getState().initialize()
}

export const useIsAuthenticated = () => {
    const { user, loading } = useAuthStore()
    return !loading && user !== null
}
