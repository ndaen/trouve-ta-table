import {useParams} from "react-router";
import '@/assets/styles/searchTable/index.css';
import SearchForm from "@/components/forms/SearchForm.tsx";
import {useState} from "react";
import Modal from "@/components/ui/modals/Modal.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import {DynamicIcon} from "lucide-react/dynamic";
import type {GuestSearchResult} from "@/services/guestsService.ts";

const GuestSearchPage = () => {
    const {projectId} = useParams();
    const [helpVisible, setHelpVisible] = useState<boolean>(false);
    const [results, setResults] = useState<GuestSearchResult[]>([]);
    const [tooManyMatches, setTooManyMatches] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const [selected, setSelected] = useState<GuestSearchResult | null>(null);

    const handleResults = (found: GuestSearchResult[], tooMany: boolean) => {
        setResults(found);
        setTooManyMatches(tooMany);
        setSearched(true);
        // Un seul résultat : on ouvre directement, personne n'a envie de
        // cliquer sur une liste d'un élément.
        setSelected(found.length === 1 ? found[0] : null);
    };

    return (
        <div className="search-table-container">
            <div className="card search-table-card">
                <div className="flex flex-direction-column text-center mb-4">
                    <h1>Trouve ta table</h1>
                    <p className="text-muted">Entrez votre nom pour découvrir votre placement</p>
                </div>

                <SearchForm projectId={projectId} onResults={handleResults}/>

                {searched && tooManyMatches && (
                    <p className="text-muted text-center">
                        Trop de noms correspondent. Ajoutez quelques lettres de votre nom de famille.
                    </p>
                )}

                {searched && !tooManyMatches && results.length === 0 && (
                    <p className="text-muted text-center">
                        Aucun nom ne correspond. Essayez une autre orthographe, ou demandez à
                        l'accueil.
                    </p>
                )}

                {results.length > 1 && (
                    <div className="flex flex-direction-column gap-2">
                        <p className="text-muted text-center">Plusieurs personnes portent ce nom :</p>
                        {results.map((result, index) => (
                            <Button
                                key={`${result.fullName}-${index}`}
                                variant="btn-secondary"
                                onClick={() => setSelected(result)}
                            >
                                {result.fullName}
                                {result.table ? ` · ${result.table.name}` : ''}
                            </Button>
                        ))}
                    </div>
                )}

                <Button onClick={() => setHelpVisible(true)} variant="btn-secondary">
                    Comment ça marche ?
                </Button>

                <Modal
                    header={<h2>Comment ça marche ?</h2>}
                    body={
                        <div>
                            <p>Entrez votre nom, en entier ou en partie, dans le champ ci-dessus.</p>
                            <p>Si plusieurs personnes portent le même nom, choisissez la vôtre dans
                                la liste.</p>
                            <p>Si vous ne vous trouvez pas, adressez-vous à l'accueil.</p>
                        </div>
                    }
                    isOpen={helpVisible}
                    onClose={() => setHelpVisible(false)}
                />

                <Modal
                    header={<h2>Trouvée !</h2>}
                    body={
                        selected ? (
                            <>
                                <div className="flex flex-direction-column gap-2 p-h-2 p-v-3 bg-secondary">
                                    <div className="flex flex-direction-row items-center gap-2">
                                        <DynamicIcon name="user" size={20}/>
                                        <p>{selected.fullName}</p>
                                    </div>

                                    {selected.table ? (
                                        <>
                                            <div className="flex flex-direction-row items-center gap-2">
                                                <DynamicIcon name="table" size={20}/>
                                                <p>{selected.table.name}</p>
                                            </div>
                                            {selected.table.description && (
                                                <div className="flex flex-direction-row items-center gap-2">
                                                    <DynamicIcon name="map-pin" size={20}/>
                                                    <p>{selected.table.description}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p>Vous n'êtes pas encore assigné à une table.</p>
                                    )}
                                </div>
                                <p className="text-muted text-center">
                                    Dirigez-vous vers votre table et profitez de la soirée !
                                </p>
                            </>
                        ) : (
                            <p>Aucune information disponible</p>
                        )
                    }
                    isOpen={selected !== null}
                    onClose={() => setSelected(null)}
                />
            </div>
        </div>
    );
};

export default GuestSearchPage;
