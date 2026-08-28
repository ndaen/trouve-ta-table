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
        if (query.trim().length < 3) {
            toast.warning('Entrez au moins trois lettres de votre nom.');
            return;
        }

        setLoading(true);
        try {
            const response = await guestsService.searchGuests(projectId, query.trim());
            onResults(response.data, response.tooManyMatches);
        } catch (error) {
            // Un invité ne doit jamais lire « Failed to fetch » ni « Erreur 422 ».
            // Le client HTTP enveloppe toute erreur — réseau comprise — dans une
            // ApiError, dont le message est parfois du texte de navigateur en
            // anglais, parfois un libellé fabriqué à partir du code de statut. On
            // ne l'affiche donc jamais tel quel : on traduit le statut en une
            // phrase que quelqu'un debout dans un hall d'entrée comprend.
            onResults([], false);
            const statut = error instanceof ApiError ? error.status : -1;
            switch (statut) {
                case 429:
                    toast.warning("Trop de recherches d'un coup. Réessayez dans une minute.");
                    break;
                case 422:
                    toast.warning('Entrez au moins trois lettres de votre nom, et pas plus de quatre-vingts.');
                    break;
                case 0:
                    toast.error('Connexion perdue. Vérifiez votre réseau et réessayez.');
                    break;
                case 404:
                    toast.error("Cette recherche n'est plus disponible. Adressez-vous à l'accueil.");
                    break;
                default:
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
                maxLength={80}
                required
            />
            <Button type={'submit'} icon={'search'} disabled={loading}>
                {loading ? 'Recherche…' : 'Rechercher'}
            </Button>
        </form>
    );
};

export default SearchForm;
