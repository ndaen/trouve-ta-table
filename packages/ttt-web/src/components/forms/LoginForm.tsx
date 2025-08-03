import {Input} from "@/components/inputs/Input";
import {type FormEvent, useState} from "react";
import Button from "@/components/buttons/Button";
import {GoogleButton} from "@/components/buttons/GoogleButton";
import {useAuthStore} from "@/stores/useAuthStore";
import {useNavigate} from "react-router";
import {InputPassword} from "@/components/inputs/InputPassword.tsx";

export default function LoginForm() {
    const {login} = useAuthStore();
    const [rememberMe, setRememberMe] = useState(false);
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await login({...loginData, rememberMe: rememberMe});
        navigate('/')
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
            <Button type={'submit'} >Connexion</Button>
            <div className={'or-separator'}>
                <span>
                    ou
                </span>
            </div>
            <GoogleButton />
        </form>
    )
}