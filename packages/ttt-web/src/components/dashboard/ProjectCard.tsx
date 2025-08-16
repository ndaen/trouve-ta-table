import type {Project} from "@/types/project.types.ts";
import Card from "@/components/ui/cards/Card.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {configureProgressBar, getEventTypeIcon, getEventTypeLabel, getProjectActions} from "@/utils/projects.ts";
import {formatDate} from "@/utils/date.ts";
import {Calendar, MapPin} from "lucide-react";
import {DynamicIcon} from "lucide-react/dynamic";
import ProgressBar from "@/components/ui/ProgressBar.tsx";
import Button from "@/components/ui/buttons/Button.tsx";

interface ProjectCardProps {
    project: Project
}

const ProjectCard = ({project}: ProjectCardProps) => {
    const progressBarConfig = configureProgressBar(project);
    const actionButtons = getProjectActions(project);
    console.log(actionButtons)
    return (
        <Card
            className={'project-card'}
            header={
                <div className={'project-card-header'}>
                    <div className={'project-card-header-top'}>
                        <div className={'flex items-center flex-direction-row gap-2'}>
                            <Calendar size={20}/>
                            <p>
                                {
                                    formatDate(project.eventDate, {format: 'long'})
                                }
                            </p>
                        </div>
                        <Badge>
                            <DynamicIcon size={16} name={getEventTypeIcon(project.eventType)}/>
                            {getEventTypeLabel(project.eventType)}
                        </Badge>
                    </div>
                    <h2>{project.name}</h2>
                </div>
            }
            description={<>
                <MapPin size={14}/>
                {project.venue}
            </>}
            body={
                <div className={'project-card-body'}>
                    <ProgressBar
                        max={progressBarConfig.max}
                        value={progressBarConfig.value}
                        label={progressBarConfig.label}
                        customValueText={progressBarConfig.text}
                        color={progressBarConfig.color}
                    />
                    <div className={'project-card-stats'}>
                        <div className={'project-card-stat'}>
                            <span className={'project-card-stat-value'}>
                                {project.tables?.length || '--'}
                            </span>
                            <span className={'project-card-stat-label'}>Tables</span>
                        </div>
                        <div className={'project-card-stat'}>
                            <span className={'project-card-stat-value'}>
                                {project.guests?.length || '--'}
                            </span>
                            <span className={'project-card-stat-label'}>Invités</span>
                        </div>
                        <div className={'project-card-stat'}>
                            <span className={'project-card-stat-value'}>
                                {project.guests?.filter(guest => guest.tableId !== null).length || '--'}
                            </span>
                            <span className={'project-card-stat-label'}>Placé</span>
                        </div>
                    </div>
                    <div className={'project-card-actions'}>
                        {actionButtons.map((actionButton) => (
                            <Button variant={actionButton.variant} icon={actionButton.icon ? actionButton.icon : null}>{actionButton.label}</Button>
                        ))}
                    </div>
                </div>
            }
        />

    );
};

export default ProjectCard;