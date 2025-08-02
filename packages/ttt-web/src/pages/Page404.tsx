import '@/assets/styles/page404.css'
import Button from "@/components/buttons/Button.tsx";
import {useNavigate} from "react-router";

const Page404 = () => {
    const navigate = useNavigate();
    return (
        <div className="page404-container">
            <h1 className={'title-404'}>404</h1>
            <p className={'subtitle-404'}>Page non trouvée</p>
            <p className={'description-404'}>
                La page que vous cherchez n'existe pas ou a été déplacée.
            </p>
            <Button icon={'arrow-left'} variant={'btn-outline'} onClick={() => navigate('/')}>
                Retour à l'accueil
            </Button>
        </div>
    );
};

export default Page404;