import {type FormEvent, useState} from "react";
import {Input} from "@/components/ui/inputs/Input.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import {guestsService, type GuestSearchResult} from "@/services/guestsService.ts";
import {useToast} from "@/stores/useToastStore.ts";
import type {UUID} from "ttt-api/app/types";
import {ApiError} from "@/utils/apiClient.ts";

interface SearchFormProps {
    projectId: UUID | string | undefined;
    onResults: (results: GuestSearchResult[], tooManyMatches: boolean) => void;
}

const SearchForm = ({projectId, onResults}: SearchFormProps) => {
    const toast = useToast();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!projectId) {
            toast.error('Aucun mariage sélectionné.');
            return;
        }
        if (query.trim().length < 2) {
            toast.warning('Entrez au moins deux lettres de votre nom.');
            return;
        }

        setLoading(true);
        try {
            const response = await guestsService.searchGuests(projectId, query.trim());
            onResults(response.data, response.tooManyMatches);
        } catch (error) {
            if (error instanceof ApiError && error.status === 429) {
                toast.warning('Trop de recherches d\'un coup. Réessayez dans une minute.');
            } else if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Une erreur est survenue lors de la recherche.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={'search-table-form'}>
            <Input
                id={'input-guest-name'}
                placeholder={'Votre nom'}
                value={query}
                leftIcon={'user'}
                onChange={(value) => setQuery(value)}
                label={'Votre nom'}
                required
            />
            <Button type={'submit'} icon={'search'} disabled={loading}>
                {loading ? 'Recherche…' : 'Rechercher'}
            </Button>
        </form>
    );
};

export default SearchForm;
