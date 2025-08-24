import {useEffect} from "react";
import {useAuthStore} from "@/stores/useAuthStore.ts";
import {Route, Routes, useLocation, useNavigate} from "react-router"
import DesignSystemPage from "@/pages/ProtectedRoutes/DesignSystemPage.tsx"
import Header from "@/components/navigation/Header.tsx"
import {ProtectedRoute} from '@/components/navigation/ProtectedRoutes.tsx'
import DashboardPage from "@/pages/ProtectedRoutes/DashboardPage.tsx";
import ProjectDetailPage from "@/pages/ProtectedRoutes/ProjectDetailsPage.tsx";
import Page404 from "@/pages/Page404.tsx";

export default function AppWithAuth() {
    const {initialize, loading} = useAuthStore()
    const location = useLocation()
    const navigate = useNavigate()
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

    const handleRedirect = () => {
        if (location.pathname === '/') {
            navigate('/dashboard')
        }
        return null
    }

    handleRedirect();

    return (
        <>
            {shouldShowHeader && <Header/>}
            <Routes>
                <Route path="/show/design" element={
                    <ProtectedRoute>
                        <DesignSystemPage/>
                    </ProtectedRoute>
                }/>
                <Route path="dashboard">

                        <Route index element={
                            <ProtectedRoute>
                                <DashboardPage/>
                            </ProtectedRoute>
                        }/>
                        <Route path="projects/:id" element={
                            <ProtectedRoute>
                                <ProjectDetailPage />
                            </ProtectedRoute>
                        }/>
                </Route>
                <Route path="*" element={<Page404/>}/>
            </Routes>
        </>
    )
}