import {ThemeToggleButton} from "@/components/ui/buttons/ThemeToggleButton.tsx";
import {useTheme} from "@/stores/themeStore.ts";
import './style.css';
import Button from "@/components/ui/buttons/Button.tsx";
import {Link} from "@/components/ui/buttons/Link.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {useAuthStore, useIsAuthenticated} from "@/stores/useAuthStore.ts";

export default function Header() {
    const {darkMode, setDarkMode} = useTheme();
    const navigate = useNavigate()
    const {logout} = useAuthStore();
    const isAuthenticated = useIsAuthenticated()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [setDarkMode])

    // get the size of the window to set a different logo based on the size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={'header-container'}>
            <div className={'header border rounded-md'}>
                <div className={'header-left'} onClick={() => navigate('/')}>
                    {darkMode ?
                        <img src={'/TTT-logo-white.svg'} alt={'logo'} className={'header-logo'}/>
                        :
                        <img src={'/TTT-logo-black.svg'} alt={'logo'} className={'header-logo'}/>
                    }
                    {isMobile ? <h1 className={'m-0 p-0'}>TTT</h1> : <h1 className={'m-0 p-0'}>Trouve Ta Table</h1>}
                </div>
                <div className={'header-content'}>
                    <div className={'header-menu'}>
                        {
                            isAuthenticated ?
                                <Link href={'/dashboard'}>Mes projects</Link>
                                :
                                <Link href={'/'}>Accueil</Link>
                        }
                    </div>
                    <div className={'header-buttons'}>
                        {
                            isAuthenticated ?
                                <>
                                    <Button variant={'btn-outline'} onClick={() => logout()}>Déconnexion</Button>
                                </>
                                :
                                <>
                                    <Button variant={'btn-outline'} onClick={() => navigate('/auth')}>Connexion</Button>
                                    <Button variant={'btn-secondary'}
                                            onClick={() => navigate('/auth?tab=register')}>Inscription</Button>
                                </>
                        }
                        <ThemeToggleButton/>
                    </div>
                </div>
            </div>
        </div>
    );
}