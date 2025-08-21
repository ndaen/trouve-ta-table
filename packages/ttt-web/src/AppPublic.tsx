import {Route, Routes, useLocation} from "react-router"
import App from './App.tsx'
import Header from "@/components/navigation/Header.tsx"
import Auth from "@/pages/GuestRoutes/Auth.tsx"
import {GuestOnlyRoute} from '@/components/navigation/ProtectedRoutes.tsx'
import Page404 from "@/pages/Page404.tsx";
import GuestSearchPage from "@/pages/GuestSearchPage.tsx";

function AppPublicContent() {
    const location = useLocation()

    const routesWithoutHeader = ['/search']
    const shouldShowHeader = !routesWithoutHeader.some(route => 
        location.pathname.startsWith(route)
    )

    return (
        <>
            {shouldShowHeader && <Header/>}
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/auth" element={
                    <GuestOnlyRoute>
                        <Auth/>
                    </GuestOnlyRoute>
                }/>
                <Route path="/search/:projectId" element={<GuestSearchPage/>}/>
                <Route path="*" element={<Page404/>}/>
            </Routes>
        </>
    )
}

export default function AppPublic() {
    return <AppPublicContent />
}