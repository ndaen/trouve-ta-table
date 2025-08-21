import {StrictMode, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppWithAuth from './AppWithAuth.tsx'
import {BrowserRouter} from "react-router"
import ToastContainer from "@/components/ui/toast/ToastContainer.tsx";
import AppPublic from "./AppPublic.tsx";
import {useAuthStore} from "@/stores/useAuthStore.ts";

function AppRouter() {
    const {user, loading, initialize} = useAuthStore()
    
    useEffect(() => {
        initialize()
    }, [initialize])
    
    if (loading) {
        return <div>Chargement...</div>
    }
    
    // If user is authenticated, render AppWithAuth, otherwise render AppPublic
    return user ? <AppWithAuth/> : <AppPublic/>
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <StrictMode>
            <ToastContainer/>
            <AppRouter/>
        </StrictMode>
    </BrowserRouter>
)