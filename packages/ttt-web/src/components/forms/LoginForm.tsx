import {Input} from "@/components/ui/inputs/Input";
import {type FormEvent, useState} from "react";
import Button from "@/components/ui/buttons/Button";
import {GoogleButton} from "@/components/ui/buttons/GoogleButton";
import {useAuthStore} from "@/stores/useAuthStore";
import {useNavigate, useSearchParams} from "react-router";
import {InputPassword} from "@/components/ui/inputs/InputPassword.tsx";
import {useToast} from "@/stores/useToastStore.ts";

export default function LoginForm() {
    const {login, loading} = useAuthStore();
    const [rememberMe, setRememberMe] = useState(false);
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [searchParams] = useSearchParams()
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await login({...loginData, rememberMe: rememberMe});
            const returnTo = searchParams.get('returnTo')
            navigate(returnTo || '/', {replace: true});
        } catch {
            toast.error('Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
            return;
        }
    }

    return (
        <form onSubmit={(event) =>  handleSubmit(event)} className={'flex flex-direction-column gap-4'}>
            <h2>Bon retour !</h2>
            <p className={'text-lg text-muted'}>Connectez-vous à votre compte</p>
            <Input
                id={'input-email'}
                value={loginData.email}
                onChange={(value) => setLoginData({...loginData, email: value})}
                placeholder={'Email'}
                type={'email'}
                leftIcon={'mail'}
                required
            />
            <InputPassword
                id={'input-password'}
                value={loginData.password}
                onChange={(value) => setLoginData({...loginData, password: value})}
                placeholder={'Mot de passe'}
                required
            />
            <div className={'flex flex-direction-row gap-2 align-items-center'}>
                <input type={'checkbox'} id={'input-remember-me'} value={rememberMe ? 1 : 0} onChange={() => setRememberMe(!rememberMe)} />
                <label className={'text-base'} htmlFor={'input-remember-me'}>Se souvenir de moi</label>
            </div>
            <Button isLoading={loading} type={'submit'} >Connexion</Button>
            <div className={'or-separator'}>
                <span>
                    ou
                </span>
            </div>
            <GoogleButton />
        </form>
    )
}