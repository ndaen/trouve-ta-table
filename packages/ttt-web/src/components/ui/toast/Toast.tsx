import React, { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { type Toast as ToastType, useToastStore } from '@/stores/useToastStore'

interface ToastProps {
    toast: ToastType
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
    const { removeToast } = useToastStore()
    const [progress, setProgress] = useState(100)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!toast.duration || toast.duration <= 0) return

        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100)
            setProgress(remaining)

            if (remaining <= 0) {
                clearInterval(interval)
            }
        }, 16)

        return () => clearInterval(interval)
    }, [toast.duration])

    const handleClose = () => {
        setIsVisible(false)
        setTimeout(() => removeToast(toast.id), 200)
    }

    const getIcon = () => {
        const iconProps = { size: 20 }
        switch (toast.type) {
            case 'success':
                return <CheckCircle {...iconProps} />
            case 'error':
                return <XCircle {...iconProps} />
            case 'warning':
                return <AlertTriangle {...iconProps} />
            case 'info':
                return <Info {...iconProps} />
            default:
                return <Info {...iconProps} />
        }
    }

    return (
        <div
            className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''}`}
            role="alert"
            aria-live="polite"
        >
            <div className="toast-content">
                <div className="toast-icon">
                    {getIcon()}
                </div>

                <div className="toast-body">
                    {toast.title && (
                        <div className="toast-title">{toast.title}</div>
                    )}
                    <div className="toast-message">{toast.message}</div>
                </div>

                <button
                    className="toast-close"
                    onClick={handleClose}
                    aria-label="Fermer la notification"
                >
                    <X size={16} />
                </button>
            </div>

            {(toast.duration ?? 0) > 0 && (
                <div className="toast-progress-bar">
                    <div
                        className="toast-progress-fill"
                        style={{
                            width: `${progress}%`,
                            transition: progress === 100 ? 'none' : 'width 16ms linear'
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default Toast