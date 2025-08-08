import {type ReactNode, useEffect, useRef} from 'react'
import {useNavigate, useLocation} from 'react-router'
import {useAuthStore, useIsAuthenticated} from '@/stores/useAuthStore'

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({children}: ProtectedRouteProps) {
    const {loading} = useAuthStore()
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()
    const location = useLocation()
    const hasRedirected = useRef(false)

    useEffect(() => {
        if (!loading && !isAuthenticated && !hasRedirected.current) {
            hasRedirected.current = true
            const currentPath = location.pathname
            navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, {replace: true})
        }
    }, [isAuthenticated, loading, location.pathname, navigate])

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

export function GuestOnlyRoute({children}: GuestOnlyRouteProps) {
    const {loading} = useAuthStore()
    const isAuthenticated = useIsAuthenticated()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/', {replace: true})
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