import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter, Route, Routes} from "react-router";
import DesignSystemShowcase from "./pages/DesignSystemShowcase.tsx";
import Header from "@/components/navigation/Header.tsx";

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <StrictMode>
            <Header/>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path={"/show/design"} element={<DesignSystemShowcase/>}/>
            </Routes>
        </StrictMode>
    </BrowserRouter>,
)
