import {type FormEvent, useState} from "react";
import {Input} from "@/components/ui/inputs/Input.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import {guestsService} from "@/services/guestsService.ts";
import {useToast} from "@/stores/useToastStore.ts";
import type {UUID} from "ttt-api/app/types";
import type {Guest} from "@/types/guest.types.ts";
import type {Email} from "@/types/common.types.ts";
import {ApiError} from "@/utils/apiClient.ts";

interface SearchTableFormProps {
    projectId: UUID | string | undefined;
    setResultModalVisible?: (visible: boolean) => void;
    setGuestResult?: (guest: Guest | null) => void;
}

const SearchForm = ({projectId, setResultModalVisible, setGuestResult}: SearchTableFormProps) => {
    const toast = useToast();
    const [fullName, setFullName] = useState({
        firstName: '',
        lastName: '',
    });
    const [email, setEmail] = useState<Email | string>('');
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!projectId) {
            toast.error('Aucun projet sélectionné.');
            return;
        }
        if (!fullName.firstName || !fullName.lastName) {
            toast.error('Veuillez remplir les deux champs.');
            return;
        }
        if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Veuillez entrer une adresse email valide.');
            return;
        }

        try {
            const response = await guestsService.getGuestTable(projectId, fullName.firstName, fullName.lastName, email);
            if (response) {
                if (setGuestResult) {
                    setGuestResult(response.data);
                }
                if (setResultModalVisible) {
                    setResultModalVisible(true);
                }
            }

        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 400) {
                    toast.warning(error.message);
                    return;
                }
                toast.error(error.message);

            } else {
                toast.error('Une erreur est survenue lors de la recherche.');
            }
        }


    }

    return (
        <form onSubmit={handleSubmit} className={'search-table-form'}>
            <Input
                id={'input-first-name'}
                placeholder={'Prénom'}
                value={fullName.firstName}
                leftIcon={'user'}
                onChange={(value) => setFullName({...fullName, firstName: value})}
                label={'Prénom'}
                required
            />
            <Input
                id={'input-last-name'}
                placeholder={'Nom de famille'}
                value={fullName.lastName}
                leftIcon={'user-check'}
                onChange={(value) => setFullName({...fullName, lastName: value})}
                label={'Nom de famille'}
                required
            />
            <Input
                id={'input-email'}
                type={'email'}
                value={email}
                onChange={(value) => setEmail(value)}
                label={'Email (optionnel)'}
                leftIcon={'mail'}
                placeholder={'Email'}
            />
            <Button type={'submit'} icon={'search'}>Rechercher</Button>
        </form>
    );
};

export default SearchForm;