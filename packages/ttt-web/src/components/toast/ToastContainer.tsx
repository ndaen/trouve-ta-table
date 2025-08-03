import React from 'react'
import { useToastStore, type ToastPosition } from '@/stores/useToastStore'
import Toast from './Toast'

const ToastContainer: React.FC = () => {
    const { toasts } = useToastStore()

    const toastsByPosition = toasts.reduce((acc, toast) => {
        const position = toast.position || 'top-right'
        if (!acc[position]) acc[position] = []
        acc[position].push(toast)
        return acc
    }, {} as Record<ToastPosition, typeof toasts>)

    if (toasts.length === 0) return null

    return (
        <>
            {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
                <div
                    key={position}
                    className={`toast-container toast-container-${position}`}
                    role="region"
                    aria-label="Notifications"
                >
                    {positionToasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} />
                    ))}
                </div>
            ))}
        </>
    )
}

export default ToastContainer