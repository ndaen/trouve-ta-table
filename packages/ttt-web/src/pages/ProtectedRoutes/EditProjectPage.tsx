import { useNavigate, useParams } from "react-router";
import { useProjectsStore } from "@/stores/useProjectsStore";
import { useToast } from "@/stores/useToastStore";
import ProjectForm from "@/components/forms/ProjectForm";
import Button from "@/components/ui/buttons/Button";
import { type CreateProjectInput } from "@/schemas/projectSchemas";
import { useEffect, useState } from "react";
import { projectsService } from "@/services/projectsService";
import type { Project } from "@/types/project.types";

const EditProjectPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { updateProject, loading: storeLoading, projects, currentProject } = useProjectsStore();
    const toast = useToast();
    
    const [project, setProject] = useState<Project | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID du projet manquant");
            setFetchLoading(false);
            return;
        }

        let foundProject: Project | null = null;
        
        if (currentProject && currentProject.id === id) {
            foundProject = currentProject;
        } else if (projects) {
            foundProject = projects.find(p => p.id === id) || null;
        }

        if (foundProject) {
            setProject(foundProject);
            setFetchLoading(false);
        } else {
            fetchProject(id);
        }
    }, [id, currentProject, projects]);

    const fetchProject = async (projectId: string) => {
        try {
            setFetchLoading(true);
            setError(null);
            const fetchedProject = await projectsService.getById(projectId);
            setProject(fetchedProject);
        } catch (err) {
            console.error('Error fetching project:', err);
            setError('Projet introuvable ou inaccessible');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (data: CreateProjectInput) => {
        if (!id || !project) return;

        try {
            await updateProject(id, data);
            toast.success('Projet modifié avec succès !');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Une erreur est survenue lors de la modification du projet');
            console.error('Update project error:', error);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    if (fetchLoading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header text-center">
                    <h1 className="text-4xl">Chargement...</h1>
                    <p className="text-lg text-muted">Récupération des données du projet</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
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
                        <h1 className="text-4xl mb-2">Erreur</h1>
                        <p className="text-lg text-error">
                            {error || "Projet introuvable"}
                        </p>
                        <div className="mt-4">
                            <Button
                                variant="btn-primary"
                                onClick={handleCancel}
                            >
                                Retour au tableau de bord
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Convert Project to CreateProjectInput format for the form
    const initialData: CreateProjectInput = {
        name: project.name,
        eventType: project.eventType,
        eventDate: project.eventDate,
        venue: project.venue,
        description: project.description || ''
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
                    <h1 className="text-4xl mb-2">Modifier le projet</h1>
                    <h2 className="text-2xl text-muted mb-2">{project.name}</h2>
                    <p className="text-lg text-muted">
                        Modifiez les informations de votre événement
                    </p>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="dashboard-body">
                <div className="max-width-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <ProjectForm
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

export default EditProjectPage;