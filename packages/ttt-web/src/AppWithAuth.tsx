import {useEffect} from "react";
import {useAuthStore} from "@/stores/useAuthStore.ts";
import {Route, Routes, useLocation, useNavigate} from "react-router"
import DesignSystemPage from "@/pages/ProtectedRoutes/DesignSystemPage.tsx"
import Header from "@/components/navigation/Header.tsx"
import {ProtectedRoute} from '@/components/navigation/ProtectedRoutes.tsx'
import DashboardPage from "@/pages/ProtectedRoutes/DashboardPage.tsx";
import ProjectDetailPage from "@/pages/ProtectedRoutes/ProjectDetailsPage.tsx";
import CreateProjectPage from "@/pages/ProtectedRoutes/CreateProjectPage.tsx";
import EditProjectPage from "@/pages/ProtectedRoutes/EditProjectPage.tsx";
import CreateTablePage from "@/pages/ProtectedRoutes/CreateTablePage.tsx";
import EditTablePage from "@/pages/ProtectedRoutes/EditTablePage.tsx";
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
                </Route>
                <Route path="projects">
                    <Route path=":id" element={
                        <ProtectedRoute>
                            <ProjectDetailPage/>
                        </ProtectedRoute>
                    }/>
                    <Route path="create" element={
                        <ProtectedRoute>
                            <CreateProjectPage/>
                        </ProtectedRoute>
                    }/>
                    <Route path=":id/edit" element={
                        <ProtectedRoute>
                            <EditProjectPage/>
                        </ProtectedRoute>
                    }/>
                    <Route path=":projectId/tables/create" element={
                        <ProtectedRoute>
                            <CreateTablePage/>
                        </ProtectedRoute>
                    }/>
                    <Route path=":projectId/tables/:tableId/edit" element={
                        <ProtectedRoute>
                            <EditTablePage/>
                        </ProtectedRoute>
                    }/>
                </Route>
                <Route path="*" element={<Page404/>}/>
            </Routes>
        </>
    )
}