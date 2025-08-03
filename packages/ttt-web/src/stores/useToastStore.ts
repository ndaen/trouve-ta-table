import {create} from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type ToastPosition =
    | 'top-left' | 'top-center' | 'top-right'
    | 'center-left' | 'center' | 'center-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'


export interface Toast {
    id: string
    type: ToastType
    title?: string
    message: string
    duration?: number
    position?: ToastPosition
    createdAt: number
}

interface ToastStore {
    toasts: Toast[]
    position: ToastPosition

    addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string
    removeToast: (id: string) => void
    clearAll: () => void
    setPosition: (position: ToastPosition) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
    toasts: [],
    position: 'top-right',

    addToast: (toastData) => {
        const id = Math.random().toString(36).substring(2, 9)
        const toast: Toast = {
            ...toastData,
            id,
            createdAt: Date.now(),
            duration: toastData.duration ?? 5000, // 5 secondes par défaut
            position: toastData.position ?? get().position
        }

        set((state) => ({
            toasts: [...state.toasts, toast]
        }))

        if (toast.duration && toast.duration > 0) {
            setTimeout(() => {
                get().removeToast(id)
            }, toast.duration)
        }

        return id
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter(toast => toast.id !== id)
        }))
    },

    clearAll: () => {
        set({ toasts: [] })
    },

    setPosition: (position) => {
        set({ position })
    }
}))

export const useToast = () => {
    const { addToast, removeToast, clearAll, setPosition } = useToastStore()

    return {
        success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => {
            return addToast({type: 'success', message, ...options})
        },

        error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => {
            return addToast({type: 'error', message, duration: 0, ...options}) // Les erreurs ne disparaissent pas automatiquement par défaut
        },

        warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => {
            return addToast({type: 'warning', message, ...options})
        },

        info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => {
            return addToast({type: 'info', message, ...options})
        },

        show: (type: ToastType, message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message' | 'createdAt'>>) => {
            return addToast({type, message, ...options})
        },

        dismiss: removeToast,
        clear: clearAll,
        setPosition
    }
}