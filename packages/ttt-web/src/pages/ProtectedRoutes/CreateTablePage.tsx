import { useNavigate, useParams } from "react-router";
import { useTablesStore } from "@/stores/useTablesStore";
import { useToast } from "@/stores/useToastStore";
import TableForm from "@/components/forms/TableForm";
import Button from "@/components/ui/buttons/Button";
import { type CreateTableInput } from "@/schemas/tableSchemas";
import { useProjectsStore } from "@/stores/useProjectsStore";

const CreateTablePage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { createTable, loading } = useTablesStore();
    const { currentProject } = useProjectsStore();
    const toast = useToast();

    if (!projectId) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header text-center">
                    <h1 className="text-4xl">Erreur</h1>
                    <p className="text-lg text-error">ID du projet manquant</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (data: CreateTableInput) => {
        try {
            await createTable(projectId, data);
            toast.success('Table créée avec succès !');
            navigate(`/projects/${projectId}?tab=tables`);
        } catch (error) {
            toast.error('Une erreur est survenue lors de la création de la table');
            console.error('Create table error:', error);
        }
    };

    const handleCancel = () => {
        navigate(`/projects/${projectId}?tab=tables`);
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
                    <h1 className="text-4xl mb-2">Créer une nouvelle table</h1>
                    <p className="text-lg text-muted">
                        Ajoutez une table à votre projet "{currentProject?.name || 'Projet'}"
                    </p>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="dashboard-body">
                <div className="max-width-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <TableForm
                        mode="create"
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateTablePage;