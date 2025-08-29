import type { Table } from "@/types/table.types.ts";
import type { Guest } from "@/types/guest.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";
import Modal from "@/components/ui/modals/Modal.tsx";
import { DynamicIcon } from "lucide-react/dynamic";
import { useNavigate } from "react-router";
import { useTablesStore } from "@/stores/useTablesStore";
import { useToast } from "@/stores/useToastStore";
import { useState, useEffect } from "react";

interface TablesSectionProps {
    tables: Table[];
    guests: Guest[];
    projectId: string;
}

export default function TablesSection({ tables: propTables, guests, projectId }: TablesSectionProps) {
    const navigate = useNavigate();
    const { tables: storeTables, deleteTable, loading, loadTables } = useTablesStore();
    const toast = useToast();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Use store tables if available, fallback to props
    const tables = storeTables || propTables;

    // Load tables from store when component mounts
    useEffect(() => {
        if (!storeTables && projectId) {
            loadTables(projectId);
        }
    }, [projectId, storeTables, loadTables]);
    const getTableOccupancy = (tableId: string) => {
        const tableGuests = guests.filter(g => g.tableId === tableId);
        return tableGuests.length;
    };

    const getOccupancyPercentage = (tableId: string, capacity: number) => {
        const occupied = getTableOccupancy(tableId);
        return capacity > 0 ? (occupied / capacity) * 100 : 0;
    };

    const getOccupancyStatus = (occupied: number, capacity: number) => {
        if (occupied === 0) return 'Vide';
        if (occupied === capacity) return 'Compléte';
        return 'Disponible';
    };

    const getStatusColor = (occupied: number, capacity: number) => {
        if (occupied === 0) return 'text-muted';
        if (occupied === capacity) return 'text-error';
        return 'text-success';
    };

    const handleCreateTable = () => {
        navigate(`/projects/${projectId}/tables/create`);
    };

    const handleEditTable = (table: Table) => {
        navigate(`/projects/${projectId}/tables/${table.id}/edit`);
    };

    const handleDeleteClick = (table: Table) => {
        setTableToDelete(table);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!tableToDelete) return;
        
        try {
            setIsDeleting(true);
            await deleteTable(tableToDelete.id);
            toast.success('Table supprimée avec succès');
            setShowDeleteModal(false);
        } catch (error) {
            toast.error('Erreur lors de la suppression de la table');
            console.error('Delete table error:', error);
        } finally {
            setIsDeleting(false);
            setTableToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setTableToDelete(null);
    };

    return (
        <div className="tables-section">
            {tables.length > 0 && (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)'}}>
                    <div>
                        <h3 style={{margin: 0}}>Gestion des tables</h3>
                        <p style={{color: 'var(--muted-foreground)', margin: 0, fontSize: 'var(--text-sm)'}}>
                            {tables.length} table{tables.length > 1 ? 's' : ''} configurée{tables.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button 
                        variant="btn-primary"
                        onClick={handleCreateTable}
                        size="sm"
                    >
                        <DynamicIcon name="plus" size={14} />
                        Ajouter une table
                    </Button>
                </div>
            )}

            {tables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <DynamicIcon name="table" size={48} />
                    </div>
                    <h4 className="empty-state-title">Aucune table configurée</h4>
                    <p className="empty-state-description">
                        Commencez par ajouter des tables à votre projet
                    </p>
                    <Button 
                        variant="btn-primary"
                        onClick={handleCreateTable}
                    >
                        <DynamicIcon name="plus" size={16} />
                        Ajouter une table
                    </Button>
                </div>
            ) : (
                <div className="tables-grid">
                    {tables.map((table) => {
                        const occupied = getTableOccupancy(table.id);
                        const percentage = getOccupancyPercentage(table.id, table.capacity);
                        const status = getOccupancyStatus(occupied, table.capacity);
                        const statusColor = getStatusColor(occupied, table.capacity);

                        return (
                            <div key={table.id} className="table-card">
                                <div className="table-card-header">
                                    <div>
                                        <h4 className="table-name">{table.name}</h4>
                                        <span className="table-capacity">
                                            Capacité: {table.capacity} personnes
                                        </span>
                                    </div>
                                    <span className={`text-sm font-medium ${statusColor}`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="table-occupancy">
                                    <div className="occupancy-bar">
                                        <div 
                                            className="occupancy-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="occupancy-text">
                                        {occupied}/{table.capacity} places occupées
                                    </div>
                                </div>

                                {table.description && (
                                    <p className="text-sm text-muted mt-2">
                                        {table.description}
                                    </p>
                                )}

                                <div className="form-row" style={{ gap: 'var(--space-2)' }}>
                                    <Button 
                                        variant="btn-secondary" 
                                        size="sm"
                                        onClick={() => handleEditTable(table)}
                                        disabled={isDeleting}
                                    >
                                        <DynamicIcon name="edit-3" size={14} />
                                        Modifier
                                    </Button>
                                    <ButtonIcon
                                        variant="btn-destructive"
                                        icon="trash-2"
                                        size="sm"
                                        onClick={() => handleDeleteClick(table)}
                                        disabled={isDeleting || loading}
                                        title="Supprimer la table"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                            <DynamicIcon name="trash-2" size={20} style={{color: 'var(--error)'}} />
                        </div>
                        <h2 style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)'}}>Supprimer la table</h2>
                    </div>
                }
                description={
                    <p style={{color: 'var(--muted-foreground)'}}>
                        Êtes-vous sûr de vouloir supprimer la table <strong>"{tableToDelete?.name}"</strong> ? 
                        Cette action est irréversible et supprimera définitivement tous les invités assignés à cette table.
                    </p>
                }
                body={
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)'}}>
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