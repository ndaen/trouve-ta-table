import { useNavigate, useLocation } from "react-router";
import { useProjectsStore } from "@/stores/useProjectsStore";
import { useToast } from "@/stores/useToastStore";
import ProjectForm from "@/components/forms/ProjectForm";
import Button from "@/components/ui/buttons/Button";
import { type CreateProjectInput, EVENT_TYPE_OPTIONS } from "@/schemas/projectSchemas";
import { useEffect, useState } from "react";

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { createProject, loading } = useProjectsStore();
    const toast = useToast();
    const [initialData, setInitialData] = useState<Partial<CreateProjectInput>>({});

    // Handle query parameter for event type pre-selection
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const preselectedType = searchParams.get('type');
        
        if (preselectedType && EVENT_TYPE_OPTIONS.find(option => option.value === preselectedType)) {
            setInitialData({ eventType: preselectedType as CreateProjectInput['eventType'] });
        }
    }, [location.search]);

    const handleSubmit = async (data: CreateProjectInput) => {
        try {
            await createProject(data);
            toast.success('Projet créé avec succès !');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Une erreur est survenue lors de la création du projet');
            console.error('Create project error:', error);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
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
                        Retour au tableau de bord
                    </Button>
                </div>

                <div className="text-center">
                    <h1 className="text-4xl mb-2">Créer un nouveau projet</h1>
                    <p className="text-lg text-muted">
                        Créez votre nouvel événement et commencez à organiser vos réservations
                    </p>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="dashboard-body">
                <div className="max-width-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <ProjectForm
                        mode="create"
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateProjectPage;