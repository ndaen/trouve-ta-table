import {ThemeToggleButton} from "@/components/buttons/ThemeToggleButton.tsx";
import {useTheme} from "@/stores/themeStore.ts";
import './style.css';
import Button from "@/components/buttons/Button.tsx";
import {Link} from "@/components/buttons/Link.tsx";
import {useEffect} from "react";
import {useNavigate} from "react-router";
import {useAuthStore, useIsAuthenticated} from "@/stores/useAuthStore.ts";

export default function Header() {
    const {darkMode, setDarkMode} = useTheme();
    const navigate = useNavigate()
    const {logout} = useAuthStore();
    const isAuthenticated = useIsAuthenticated()

    useEffect(() => {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [])

    return (
        <div className={'header-container'}>
            <div className={'header border rounded-md'}>
                <div className={'header-left'} onClick={() => navigate('/')}>
                    {darkMode ?
                        <img src={'/TTT-logo-white.svg'} alt={'logo'} className={'header-logo'}/>
                        :
                        <img src={'/TTT-logo-black.svg'} alt={'logo'} className={'header-logo'}/>
                    }
                    <h1 className={'text-2xl'}>Trouve Ta Table</h1>
                </div>
                <div className={'header-content'}>
                    <div className={'header-menu'}>
                        <Link href={'/'}>Accueil</Link>
                    </div>
                    <div className={'header-buttons'}>
                        {
                            isAuthenticated ?
                                <>
                                    <Button variant={'btn-outline'} onClick={() => logout()}>Déconnexion</Button>
                                </>
                                :
                                <>
                                    <Button variant={'btn-outline'} onClick={() => navigate('/auth')} >Connexion</Button>
                                    <Button variant={'btn-secondary'} onClick={() =>  navigate('/auth?tab=register')}>Inscription</Button>
                                </>
                        }
                        <ThemeToggleButton/>
                    </div>
                </div>
            </div>
        </div>
    );
}