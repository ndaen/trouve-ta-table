import {DynamicIcon} from "lucide-react/dynamic";
import type {Project} from "@/types/project.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import ButtonIcon from "@/components/ui/buttons/ButtonIcon.tsx";
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

    const handleDelete = async () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action est irréversible.`)) {
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
            }
        }
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
                    onClick={handleDelete}
                    disabled={isDeleting || loading}
                    title="Supprimer le projet"
                    size="sm"
                />
            </div>
        </div>
    );
}