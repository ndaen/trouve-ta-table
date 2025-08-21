import {useEffect} from "react";
import {useAuthStore} from "@/stores/useAuthStore.ts";
import {Route, Routes, useLocation} from "react-router"
import DesignSystemShowcase from "@/pages/ProtectedRoutes/DesignSystemShowcase.tsx"
import Header from "@/components/navigation/Header.tsx"
import {ProtectedRoute} from '@/components/navigation/ProtectedRoutes.tsx'
import Dashboard from "@/pages/ProtectedRoutes/Dashboard.tsx";

export default function AppWithAuth() {
    const {initialize, loading} = useAuthStore()
    const location = useLocation()

    useEffect(() => {
        initialize()
    }, [initialize])

    if (loading) {
        return <div>Chargement...</div>
    }

    const routesWithoutHeader = ['/search']
    const shouldShowHeader = !routesWithoutHeader.some(route =>
        location.pathname.startsWith(route)
    )

    return (
        <>
            {shouldShowHeader && <Header/>}
            <Routes>
                <Route path="/show/design" element={
                    <ProtectedRoute>
                        <DesignSystemShowcase/>
                    </ProtectedRoute>
                }/>
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard/>
                    </ProtectedRoute>
                }/>
            </Routes>
        </>
    )
}