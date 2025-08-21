import {useParams} from "react-router";
import '@/assets/styles/searchTable/index.css';
import SearchForm from "@/components/forms/SearchForm.tsx";
import {useState} from "react";
import Modal from "@/components/ui/modals/Modal.tsx";
import type {Guest} from "@/types/guest.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import {DynamicIcon} from "lucide-react/dynamic";

const GuestSearchPage = () => {
    const {projectId} = useParams();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
    const [guestResult, setGuestResult] = useState<Guest | null>(null);

    return (
        <div className="search-table-container">
            <div className="card search-table-card">
                <div className="flex flex-direction-column text-center mb-4">
                    <h1>Trouve ta table</h1>
                    <p className="text-muted">Entrez votre nom pour découvrir votre placement</p>
                </div>
                <SearchForm
                    projectId={projectId}
                    setResultModalVisible={setResultModalVisible}
                    setGuestResult={setGuestResult}
                />
                <Button
                    onClick={() => setModalVisible(true)}
                    variant="btn-secondary"
                >
                    Comment ça marche ?
                </Button>
                <Modal
                    header={<h2>Comment ça marche ?</h2>}
                    body={
                        <div>
                            <p>Pour trouver votre table, entrez votre prénom et nom de famille dans les champs
                                ci-dessus.</p>
                            <p>Si vous avez des difficultés, contactez l'organisateur de l'événement.</p>
                        </div>
                    }
                    isOpen={modalVisible}
                    onClose={() => setModalVisible(false)}
                />
                <Modal
                    header={<h2>Trouvée !</h2>}
                    body={
                        guestResult ? (
                            <>
                                <div className="flex flex-direction-column gap-2 p-h-2 p-v-3 bg-secondary">
                                    <div className="flex flex-direction-row items-center gap-2">
                                        <DynamicIcon name="user" size={20}/>
                                        <p>{guestResult.firstName} {guestResult.lastName}</p>
                                    </div>

                                    {guestResult.table ? (
                                        <>
                                            <div className="flex flex-direction-row items-center gap-2">
                                                <DynamicIcon name="table" size={20}/>
                                                <p>{guestResult.table.name}</p>
                                            </div>
                                            <div className="flex flex-direction-row items-center gap-2">
                                                <DynamicIcon name="map-pin" size={20}/>
                                                <p>{guestResult.table.description}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <p>Vous n'êtes pas encore assigné à une table.</p>
                                    )}
                                    {guestResult.dietaryRequirements && (
                                        <div className="flex flex-direction-row items-center gap-2">
                                            <DynamicIcon name="wheat-off" size={20}/>
                                            <p>{guestResult.dietaryRequirements}</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-muted text-center">Dirigez-vous vers votre table et profitez de la soirée !</p>
                            </>
                        ) : (
                            <p>Aucune information disponible</p>
                        )
                    }
                    isOpen={resultModalVisible}
                    onClose={() => setResultModalVisible(false)}
                />
            </div>
        </div>
    );
};

export default GuestSearchPage;