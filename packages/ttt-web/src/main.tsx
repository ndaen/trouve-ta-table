import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import AppWithAuth from './AppWithAuth.tsx'
import {BrowserRouter} from "react-router"

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <StrictMode>
            <AppWithAuth/>
        </StrictMode>
    </BrowserRouter>
)