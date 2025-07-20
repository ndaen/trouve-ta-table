import {ThemeToggleButton} from "@/components/buttons/ThemeToggleButton.tsx";
import {useTheme} from "@/stores/themeStore.ts";
import './style.css';
import Button from "@/components/buttons/Button.tsx";
import {Link} from "@/components/buttons/Link.tsx";
import {useEffect} from "react";

export default function Header() {
    const {darkMode, setDarkMode} = useTheme();

    useEffect(() => {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, [])

    return (
        <div className={'header-container'}>
            <div className={'header border rounded-md'}>
                <div className={'header-left'}>
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
                        <Button variant={'btn-outline'}>Connexion</Button>
                        <Button variant={'btn-secondary'}>Inscription</Button>
                        <ThemeToggleButton/>
                    </div>
                </div>
            </div>
        </div>
    );
}