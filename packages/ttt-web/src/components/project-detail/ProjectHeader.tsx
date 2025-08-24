import {DynamicIcon} from "lucide-react/dynamic";
import type {Project} from "@/types/project.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";

interface ProjectHeaderProps {
    project: Project;
}

export default function ProjectHeader({project}: ProjectHeaderProps) {
    return (
        <div className="project-header">
            <div className="project-header-info">
                <h1 className="project-title">{project.name}</h1>
            </div>

            <div className="project-actions">
                <Button
                    variant="btn-outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement QR code preview */
                    }}
                >
                    <DynamicIcon name="qr-code" size={16}/>
                    QR Code
                </Button>
                <Button
                    variant="btn-secondary"
                    size="sm"
                    onClick={() => {/* TODO: Implement edit functionality */
                    }}
                >
                    <DynamicIcon name="edit-3" size={16}/>
                    Modifier
                </Button>
            </div>
        </div>
    );
}