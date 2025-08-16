import {Input} from "@/components/ui/inputs/Input";
import {type FormEvent, useEffect, useState} from "react";
import Button from "@/components/ui/buttons/Button";
import {GoogleButton} from "@/components/ui/buttons/GoogleButton";
import {useAuthStore} from "@/stores/useAuthStore";
import {useNavigate} from "react-router";
import {InputPassword} from "@/components/ui/inputs/InputPassword.tsx";
import {type RegisterWithConfirmInput, RegisterWithConfirmSchema} from "@/schemas/authSchemas.ts";
import {z} from "zod";
import {useToast} from "@/stores/useToastStore";

export default function RegisterForm() {
    const {register} = useAuthStore();
    const toast = useToast();
    const [error, setError] = useState<string | null>(null);
    const [registerData, setRegisterData] = useState<RegisterWithConfirmInput>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            RegisterWithConfirmSchema.parse(registerData);
            await register({...registerData});
            toast.success('Inscription réussie !');
            navigate('/');
        } catch (error) {
            if (error instanceof z.ZodError) {
                if (error.issues[0].message) setError(error.issues[0].message);
                return;
            }
        }
    }

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'top-center',
            });
            setError(null);
        }
    }, [error, toast]);

    return (
        <form onSubmit={(event) => handleSubmit(event)} className={'flex flex-direction-column gap-4'}>
            <h2>Créer un compte</h2>
            <p className={'text-lg text-muted'}>Rejoignez-nous dès aujourd'hui</p>
            <Input
                id={'input-first-name'}
                value={registerData.firstName}
                onChange={(value) => setRegisterData({...registerData, firstName: value})}
                placeholder={'Prénom'}
                leftIcon={'user'}
                required
            />
            <Input
                id={'input-last-name'}
                value={registerData.lastName}
                onChange={(value) => setRegisterData({...registerData, lastName: value})}
                placeholder={'Nom de famille'}
                leftIcon={'user-check'}
                required
            />
            <Input
                id={'input-email'}
                value={registerData.email}
                onChange={(value) => setRegisterData({...registerData, email: value})}
                placeholder={'Email'}
                type={'email'}
                leftIcon={'mail'}
                required
            />
            <InputPassword
                id={'input-password'}
                value={registerData.password}
                onChange={(value) => setRegisterData({...registerData, password: value})}
                placeholder={'Mot de passe'}
                required
            />
            <InputPassword
                id={'passwordConfirmation'}
                value={registerData.passwordConfirmation}
                onChange={(value) => setRegisterData({...registerData, passwordConfirmation: value})}
                placeholder={'Confirmer le mot de passe'}
                required
            />
            <Button type={'submit'}>S'inscrire</Button>
            <div className={'or-separator'}>
                <span>
                    ou
                </span>
            </div>
            <GoogleButton/>
        </form>
    )
}