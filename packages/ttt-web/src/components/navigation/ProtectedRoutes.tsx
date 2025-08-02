import {type ReactNode, useEffect} from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore, useIsAuthenticated } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { loading } = useAuthStore()
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/auth', { replace: true })
        }
    }, [isAuthenticated, loading, navigate])

    if (loading) {
        return <div>Chargement...</div>
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

interface GuestOnlyRouteProps {
    children: ReactNode
}

export function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
    const { loading } = useAuthStore()
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/', { replace: true })
        }
    }, [isAuthenticated, loading, navigate])

    if (loading) {
        return <div>Chargement...</div>
    }

    if (isAuthenticated) {
        return null
    }

    return <>{children}</>
}