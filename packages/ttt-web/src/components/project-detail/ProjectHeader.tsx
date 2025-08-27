import {DynamicIcon} from "lucide-react/dynamic";
import type {Project} from "@/types/project.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";
import Modal from "@/components/ui/modals/Modal.tsx";
import {useNavigate} from "react-router";
import {useProjectsStore} from "@/stores/useProjectsStore";
import {useToast} from "@/stores/useToastStore";
import {useState} from "react";

interface ProjectHeaderProps {
    project: Project;
}

export default function ProjectHeader({project}: ProjectHeaderProps) {
    const navigate = useNavigate();
    const { deleteProject, loading } = useProjectsStore();
    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteProject(project.id);
            toast.success('Projet supprimé avec succès');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Erreur lors de la suppression du projet');
            console.error('Delete project error:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    return (
        <div className="project-header">
            <div className="project-header-info">
                <h1 className="project-title">{project.name}</h1>
            </div>

            <div className="project-actions">
                <Button
                    variant="btn-secondary"
                    size="sm"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    disabled={isDeleting}
                >
                    <DynamicIcon name="edit-3" size={16}/>
                    Modifier
                </Button>
                <ButtonIcon
                    variant="btn-destructive"
                    icon="trash-2"
                    onClick={handleDeleteClick}
                    disabled={isDeleting || loading}
                    title="Supprimer le projet"
                    size="sm"
                />
            </div>

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
                        <h2 style={{fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)'}}>Supprimer le projet</h2>
                    </div>
                }
                description={
                    <p style={{color: 'var(--muted-foreground)'}}>
                        Êtes-vous sûr de vouloir supprimer le projet <strong>"{project.name}"</strong> ? 
                        Cette action est irréversible et supprimera définitivement toutes les données associées 
                        (tables, invités, etc.).
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