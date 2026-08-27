import type {Guest} from "@/types/guest.types.ts";
import type {Table} from "@/types/table.types.ts";
import {Badge, Button, FilterChips, SearchInput, TableComponent} from "@/components/ui";
import {type FilterChip} from "@/components/ui/FilterChips";
import {type TableColumn} from "@/components/ui/TableComponent";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon";
import Modal from "@/components/ui/modals/Modal";
import GuestForm from "@/components/forms/GuestForm";
import {DynamicIcon} from "lucide-react/dynamic";
import {useGuestsStore} from "@/stores/useGuestsStore";
import {useTablesStore} from "@/stores/useTablesStore";
import {useToast} from "@/stores/useToastStore";
import {useEffect, useState} from "react";
import type {CreateGuestInput, UpdateGuestInput} from "@/schemas/guestSchemas";
import type {CreateTableInput} from "@/schemas/tableSchemas";
import {getDietaryRequirementsSummary} from "@/utils/guests.ts";

interface GuestsSectionProps {
    guests: Guest[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedFilter: string;
    onFilterChange: (filterId: string) => void;
    tables: Table[];
    projectId: string;
}

export default function GuestsSection({
                                          guests: propGuests,
                                          searchTerm,
                                          onSearchChange,
                                          selectedFilter,
                                          onFilterChange,
                                          tables: propTables,
                                          projectId
                                      }: GuestsSectionProps) {
    const {guests: storeGuests, createGuest, updateGuest, deleteGuest, loadGuests, loading} = useGuestsStore();
    const {tables: storeTables, createTable, loadTables} = useTablesStore();
    const toast = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);
    const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toujours utiliser les données filtrées passées en props pour l'affichage
    // Les données du store servent pour les opérations CRUD
    const guests = propGuests;
    const tables = storeTables || propTables;

    useEffect(() => {
        // Charger les données du store uniquement si elles ne sont pas déjà chargées
        // Les props contiennent les données filtrées pour l'affichage
        if (!storeGuests && projectId) {
            loadGuests(projectId);
        }
        if (!storeTables && projectId) {
            loadTables(projectId);
        }
    }, [projectId, storeGuests, storeTables, loadGuests, loadTables]);

    const filterChips: FilterChip[] = [
        {id: 'all', label: 'Tous'},
        {id: 'placed', label: 'Placés'},
        {id: 'unplaced', label: 'Non placés'},
    ];

    const getTableName = (tableId: string | null | undefined) => {
        if (!tableId) return 'Non assigné';
        const table = tables.find(t => t.id === tableId);
        return table ? table.name : 'Table inconnue';
    };

    const columns: TableColumn<Guest>[] = [
        {
            id: 'name',
            label: 'Nom',
            width: '30%',
            render: (_, guest) => (
                <div className="guest-info">
                    <span className="guest-name">{guest.firstName} {guest.lastName}</span>
                    {guest.email && (
                        <span className="guest-email">{guest.email}</span>
                    )}
                </div>
            )
        },
        {
            id: 'tableId',
            label: 'Table',
            width: '25%',
            render: (_, guest) => (
                <span className={guest.tableId ? '' : 'text-muted'}>
                    {getTableName(guest.tableId)}
                </span>
            )
        },
        {
            id: 'dietaryRequirements',
            label: 'Régime alimentaire',
            width: '25%',
            render: (_, guest) => (
                guest.dietaryRequirements ? (
                    <Badge variant="badge-secondary">
                        {getDietaryRequirementsSummary(guest.dietaryRequirements)}
                    </Badge>
                ) : (
                    <span className="text-muted text-sm">Aucun</span>
                )
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            width: '20%',
            render: (_, guest) => (
                <div style={{display: 'flex', gap: 'var(--space-2)'}}>
                    <Button
                        variant="btn-secondary"
                        size="sm"
                        onClick={() => handleEditGuest(guest)}
                        disabled={isDeleting || isUpdating || isCreating}
                    >
                        <DynamicIcon name="edit-3" size={14}/>
                        Modifier
                    </Button>
                    <ButtonIcon
                        variant="btn-destructive"
                        icon="trash-2"
                        size="sm"
                        onClick={() => handleDeleteClick(guest)}
                        disabled={isDeleting || loading}
                        title="Supprimer l'invité"
                    />
                </div>
            )
        }
    ];

    const handleCreateGuest = async (data: CreateGuestInput) => {
        try {
            setIsCreating(true);
            await createGuest(projectId, data);
            toast.success('Invité ajouté avec succès');
            setShowCreateModal(false);
        } catch (error) {
            toast.error('Erreur lors de l\'ajout de l\'invité');
            console.error('Create guest error:', error);
            throw error;
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditGuest = (guest: Guest) => {
        setGuestToEdit(guest);
        setShowEditModal(true);
    };

    const handleUpdateGuest = async (data: UpdateGuestInput) => {
        if (!guestToEdit) return;

        try {
            setIsUpdating(true);
            await updateGuest(guestToEdit.id, data);
            toast.success('Invité modifié avec succès');
            setShowEditModal(false);
        } catch (error) {
            toast.error('Erreur lors de la modification de l\'invité');
            console.error('Update guest error:', error);
            throw error;
        } finally {
            setIsUpdating(false);
            setGuestToEdit(null);
        }
    };

    const handleDeleteClick = (guest: Guest) => {
        setGuestToDelete(guest);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!guestToDelete) return;

        try {
            setIsDeleting(true);
            await deleteGuest(guestToDelete.id);
            toast.success('Invité supprimé avec succès');
            setShowDeleteModal(false);
        } catch (error) {
            toast.error('Erreur lors de la suppression de l\'invité');
            console.error('Delete guest error:', error);
        } finally {
            setIsDeleting(false);
            setGuestToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setGuestToDelete(null);
    };

    const handleCreateTable = async (data: CreateTableInput) => {
        try {
            await createTable(projectId, data);
            toast.success('Table créée avec succès');
        } catch (error) {
            toast.error('Erreur lors de la création de la table');
            console.error('Create table error:', error);
            throw error;
        }
    };

    return (
        <div className="guests-section">
            {guests.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div>
                        <h3 style={{margin: 0}}>Gestion des invités</h3>
                        <p style={{color: 'var(--muted-foreground)', margin: 0, fontSize: 'var(--text-sm)'}}>
                            {guests.length} invité{guests.length > 1 ? 's' : ''} ajouté{guests.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        variant="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        size="sm"
                        disabled={isCreating || isUpdating || isDeleting}
                    >
                        <DynamicIcon name="plus" size={14}/>
                        Ajouter un invité
                    </Button>
                </div>
            )}

            <div className="guests-controls">
                <div className="guests-search">
                    <SearchInput
                        placeholder="Rechercher un invité..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                <FilterChips
                    chips={filterChips}
                    activeChip={selectedFilter}
                    onChipClick={onFilterChange}
                />
            </div>

            {guests.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <DynamicIcon name="user-plus" size={48}/>
                    </div>
                    <h4 className="empty-state-title">Aucun invité ajouté</h4>
                    <p className="empty-state-description">
                        {searchTerm
                            ? `Aucun invité ne correspond à "${searchTerm}"`
                            : 'Commencez par ajouter des invités à votre projet'
                        }
                    </p>
                    <Button
                        variant="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        disabled={isCreating}
                    >
                        <DynamicIcon name="plus" size={16}/>
                        Ajouter un invité
                    </Button>
                </div>
            ) : (
                <TableComponent
                    columns={columns}
                    data={guests}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        showInfo: true
                    }}
                />
            )}

            {/* Modal de création d'invité */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                size="md"
                header={<h3>Ajouter un invité</h3>}
                body={
                    <GuestForm
                        mode="create"
                        onSubmit={handleCreateGuest}
                        onCancel={() => setShowCreateModal(false)}
                        isLoading={isCreating}
                        tables={tables}
                        onCreateTable={handleCreateTable}
                    />
                }
            />

            {/* Modal d'édition d'invité */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                size="md"
                header={<h3>Modifier l'invité</h3>}
                body={
                    <GuestForm
                        mode="edit"
                        initialData={guestToEdit ? {
                            firstName: guestToEdit.firstName,
                            lastName: guestToEdit.lastName,
                            email: guestToEdit.email,
                            dietaryRequirements: guestToEdit.dietaryRequirements ?? undefined,
                            tableId: guestToEdit.tableId
                        } : undefined}
                        onSubmit={handleUpdateGuest}
                        onCancel={() => setShowEditModal(false)}
                        isLoading={isUpdating}
                        tables={tables}
                        onCreateTable={handleCreateTable}
                    />
                }
            />

            {/* Modal de confirmation de suppression */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                size="sm"
                header={
                    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-3)'}}>
                        <div
                            className="rounded-full"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'var(--error-light, rgba(190, 18, 60, 0.1))'
                            }}
                        >
                            <DynamicIcon name="trash-2" size={20} style={{color: 'var(--error)'}}/>
                        </div>
                        <h2 style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)'}}>Supprimer
                            l'invité</h2>
                    </div>
                }
                description={
                    <p style={{color: 'var(--muted-foreground)'}}>
                        Êtes-vous sûr de vouloir supprimer
                        l'invité <strong>"{guestToDelete?.firstName} {guestToDelete?.lastName}"</strong> ?
                        Cette action est irréversible.
                    </p>
                }
                body={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 'var(--space-3)',
                        marginTop: 'var(--space-6)'
                    }}>
                        <Button
                            variant="btn-outline"
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="btn-destructive"
                            onClick={handleConfirmDelete}
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            icon="trash-2"
                        >
                            Supprimer définitivement
                        </Button>
                    </div>
                }
            />
        </div>
    );
}