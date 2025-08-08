import {StrictMode, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter, Route, Routes} from "react-router"
import DesignSystemShowcase from "@/pages/ProtectedRoutes/DesignSystemShowcase.tsx"
import Header from "@/components/navigation/Header.tsx"
import Auth from "@/pages/GuestRoutes/Auth.tsx"

import {GuestOnlyRoute, ProtectedRoute} from '@/components/navigation/ProtectedRoutes.tsx'

import {initializeAuth, useAuthStore} from "@/stores/useAuthStore.ts";
import Page404 from "@/pages/Page404.tsx";
import ToastContainer from '@/components/toast/ToastContainer.tsx'
import SearchInProject from "@/pages/SearchInProject.tsx";
import Dashboard from "@/pages/ProtectedRoutes/Dashboard.tsx";

function AppWithAuth() {
    useEffect(() => {
        initializeAuth()
    }, [])

    const {loading} = useAuthStore()

    if (loading) {
        return <div>Chargement...</div>
    }

    return (
        <>
            <Header/>
            <ToastContainer/>
            <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<App/>}/>
                <Route path="*" element={<Page404/>}/>
                <Route path="/search/:projectId" element={<SearchInProject/>}/>

                <Route path="/auth" element={
                    <GuestOnlyRoute>
                        <Auth/>
                    </GuestOnlyRoute>
                }
                />

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

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <StrictMode>
            <AppWithAuth/>
        </StrictMode>
    </BrowserRouter>
)