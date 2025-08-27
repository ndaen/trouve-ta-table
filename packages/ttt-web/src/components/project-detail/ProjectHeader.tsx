import {DynamicIcon} from "lucide-react/dynamic";
import type {Project} from "@/types/project.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import {useNavigate} from "react-router";

interface ProjectHeaderProps {
    project: Project;
}

export default function ProjectHeader({project}: ProjectHeaderProps) {
    const navigate = useNavigate();
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
                >
                    <DynamicIcon name="edit-3" size={16}/>
                    Modifier
                </Button>
            </div>
        </div>
    );
}