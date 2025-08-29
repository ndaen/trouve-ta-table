import { useNavigate, useParams } from "react-router";
import { useTablesStore } from "@/stores/useTablesStore";
import { useToast } from "@/stores/useToastStore";
import TableForm from "@/components/forms/TableForm";
import Button from "@/components/ui/buttons/Button";
import { type CreateTableInput } from "@/schemas/tableSchemas";
import { useEffect, useState } from "react";
import { tablesService } from "@/services/tablesService";
import type { Table } from "@/types/table.types";
import { useProjectsStore } from "@/stores/useProjectsStore";

const EditTablePage = () => {
    const navigate = useNavigate();
    const { projectId, tableId } = useParams<{ projectId: string; tableId: string }>();
    const { updateTable, loading: storeLoading, tables, currentTable } = useTablesStore();
    const { currentProject } = useProjectsStore();
    const toast = useToast();
    
    const [table, setTable] = useState<Table | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId || !tableId) {
            setError("ID du projet ou de la table manquant");
            setFetchLoading(false);
            return;
        }

        let foundTable: Table | null = null;
        
        if (currentTable && currentTable.id === tableId) {
            foundTable = currentTable;
        } else if (tables) {
            foundTable = tables.find(t => t.id === tableId) || null;
        }

        if (foundTable) {
            setTable(foundTable);
            setFetchLoading(false);
        } else {
            fetchTable(tableId);
        }
    }, [projectId, tableId, currentTable, tables]);

    const fetchTable = async (tableId: string) => {
        try {
            setFetchLoading(true);
            setError(null);
            const fetchedTable = await tablesService.getById(tableId);
            setTable(fetchedTable);
        } catch (err) {
            console.error('Error fetching table:', err);
            setError('Table introuvable ou inaccessible');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (data: CreateTableInput) => {
        if (!tableId || !table) return;

        try {
            await updateTable(tableId, data);
            toast.success('Table modifiée avec succès !');
            navigate(`/projects/${projectId}?tab=tables`);
        } catch (error) {
            toast.error('Une erreur est survenue lors de la modification de la table');
            console.error('Update table error:', error);
        }
    };

    const handleCancel = () => {
        navigate(`/projects/${projectId}?tab=tables`);
    };

    if (fetchLoading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header text-center">
                    <h1 className="text-4xl">Chargement...</h1>
                    <p className="text-lg text-muted">Récupération des données de la table</p>
                </div>
            </div>
        );
    }

    if (error || !table) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="btn-outline"
                            icon="arrow-left"
                            onClick={handleCancel}
                        >
                            Retour au projet
                        </Button>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-4xl mb-2">Erreur</h1>
                        <p className="text-lg text-error">
                            {error || "Table introuvable"}
                        </p>
                        <div className="mt-4">
                            <Button
                                variant="btn-primary"
                                onClick={handleCancel}
                            >
                                Retour au projet
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Convert Table to CreateTableInput format for the form
    const initialData: CreateTableInput = {
        name: table.name,
        capacity: table.capacity,
        description: table.description || ''
    };

    return (
        <div className="dashboard-container">
            {/* Header avec bouton retour */}
            <div className="dashboard-header" style={{ paddingBottom: 'var(--space-4)' }}>
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="btn-outline"
                        icon="arrow-left"
                        onClick={handleCancel}
                    >
                        Retour au projet
                    </Button>
                </div>
                
                <div className="text-center">
                    <h1 className="text-4xl mb-2">Modifier la table</h1>
                    <h2 className="text-2xl text-muted mb-2">{table.name}</h2>
                    <p className="text-lg text-muted">
                        Modifiez les informations de votre table dans "{currentProject?.name || 'Projet'}"
                    </p>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="dashboard-body">
                <div className="max-width-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <TableForm
                        mode="edit"
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={storeLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditTablePage;