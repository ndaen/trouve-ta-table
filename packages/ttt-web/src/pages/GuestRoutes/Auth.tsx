import {useSearchParams} from "react-router";
import LoginForm from "@/components/forms/LoginForm.tsx";
import '@/assets/styles/auth.css'
import RegisterForm from "@/components/forms/RegisterForm.tsx";

export default function Auth() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'login'

    return (
        <div className={'auth-container'}>
            <div className={'auth-card'}>
                <div className={'auth-card-header'}>
                    <button className={`auth-card-button ${activeTab === 'login' ? 'active' : 'inactive'}` } onClick={()=> setSearchParams('tab=login')}>Connexion</button>
                    <button className={`auth-card-button ${activeTab === 'register' ? 'active' : 'inactive'}`} onClick={()=> setSearchParams('tab=register')}>Inscription</button>
                </div>
                <div className={'auth-card-body'}>
                    {activeTab === 'login' && (
                        <div>
                            <LoginForm/>
                        </div>
                    )}
                    {activeTab === 'register' && (
                        <div>
                            <RegisterForm/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}