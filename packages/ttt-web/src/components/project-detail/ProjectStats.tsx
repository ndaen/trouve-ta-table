import type { Project } from "@/types/project.types.ts";
import StatCard from "@/components/ui/StatCard.tsx";
import Card from "@/components/ui/cards/Card.tsx";

interface ProjectStatsProps {
    project: Project;
    stats: {
        totalTables: number;
        totalGuests: number;
        placedGuests: number;
        qrScans: number;
    };
}

export default function ProjectStats({ project, stats }: ProjectStatsProps) {
    const placementPercentage = stats.totalGuests > 0 
        ? Math.round((stats.placedGuests / stats.totalGuests) * 100) 
        : 0;

    return (
        <div className="project-overview">
            {/* Project Details */}
            <div className="project-details-card">
                <Card
                    header={<h3>Détails du projet</h3>}
                    body={
                        <div>
                            <div className="project-detail-row">
                                <span className="project-detail-label">Date de l'évènement</span>
                                <span className="project-detail-value">
                                    {new Date(project.eventDate).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="project-detail-row">
                                <span className="project-detail-label">Lieu</span>
                                <span className="project-detail-value">{project.venue}</span>
                            </div>
                            <div className="project-detail-row">
                                <span className="project-detail-label">Type d'évènement</span>
                                <span className="project-detail-value">{project.eventType}</span>
                            </div>
                            {project.description && (
                                <div className="project-detail-row">
                                    <span className="project-detail-label">Description</span>
                                    <span className="project-detail-value">{project.description}</span>
                                </div>
                            )}
                            <div className="project-detail-row">
                                <span className="project-detail-label">Statut</span>
                                <span className="project-detail-value">
                                    {project.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Statistics */}
            <div className="project-stats">
                <StatCard
                    label="Tables"
                    value={stats.totalTables}
                    icon="table"
                    trend={{
                        value: 0,
                        type: 'neutral'
                    }}
                />
                <StatCard
                    label="Invités"
                    value={stats.totalGuests}
                    icon="users"
                    trend={{
                        value: 0,
                        type: 'neutral'
                    }}
                />
                <StatCard
                    label="Placés"
                    value={`${stats.placedGuests}/${stats.totalGuests}`}
                    icon="user-check"
                    trend={{
                        value: placementPercentage,
                        type: placementPercentage > 50 ? 'positive' : placementPercentage > 25 ? 'neutral' : 'negative'
                    }}
                />
                <StatCard
                    label="QR Scannés"
                    value={stats.qrScans}
                    icon="qr-code"
                    trend={{
                        value: 0,
                        type: 'neutral'
                    }}
                />
            </div>
        </div>
    );
}