import type {EventType} from "@/types/common.types.ts";
import type {IconName} from "lucide-react/dynamic";
import type {Project, ProjectStatus, ProjectAction, ProgressBarConfig} from "@/types/project.types.ts";

export const getEventTypeLabel = (eventType: EventType): string => {
    switch (eventType) {
        case 'wedding':
            return 'Mariage';
        case 'bar_mitzvah':
            return 'Bar Mitzvah';
        case 'anniversary':
        case 'birthday':
            return 'Anniversaire';
        case 'corporate':
            return 'Événement d\'entreprise';
        case 'other':
            return 'Autre';
        default:
            return 'Événement inconnu';
    }
}

export const getEventTypeIcon = (eventType: EventType): IconName => {
    switch (eventType) {
        case 'wedding':
            return 'gem';
        case 'bar_mitzvah':
            return 'gift';
        case 'anniversary':
        case 'birthday':
            return 'cake';
        case 'corporate':
            return 'building-2';
        case 'other':
            return 'party-popper';
        default:
            return 'party-popper';
    }
}

const getProjectStatus = (project: Project): ProjectStatus => {
    const totalGuests = project.guests?.length || 0;
    const totalTables = project.tables?.length || 0;
    const placedGuests = project.guests?.filter(guest => guest.tableId !== null).length || 0;

    if (totalTables === 0 && totalGuests === 0) {
        return 'DRAFT';
    } else if (totalTables > 0 && totalGuests === 0) {
        return 'SETUP';
    } else if (totalGuests > 0 && placedGuests === 0) {
        return 'SETUP';
    } else if (placedGuests > 0 && placedGuests < totalGuests * 0.9) {
        return 'IN_PROGRESS';
    } else if (placedGuests >= totalGuests * 0.9 && placedGuests < totalGuests) {
        return 'NEARLY_COMPLETE';
    } else if (placedGuests === totalGuests && totalGuests > 0) {
        return 'COMPLETED';
    } else {
        return 'DRAFT';
    }
}

export const getProjectActions = (project: Project): ProjectAction[] => {
    const status = getProjectStatus(project);

    switch (status) {
        case 'DRAFT':
            return [
                { label: 'Configurer', action: 'configure', variant: 'btn-primary', icon: 'rocket' },
                { label: 'Supprimer', action: 'delete', variant: 'btn-destructive', icon: 'trash' }
            ];

        case 'SETUP':
            return [
                { label: 'Ajouter invités', action: 'add-guests', variant: 'btn-primary', icon: 'user-plus' },
                { label: 'Configurer', action: 'configure', variant: 'btn-outline', icon: 'rocket' }
            ];

        case 'IN_PROGRESS':
            return [
                { label: 'Placer invités', action: 'place-guests', variant: 'btn-primary', icon: 'user-plus' },
                { label: 'Voir détails', action: 'view-details', variant: 'btn-outline', icon: 'eye' }
            ];

        case 'NEARLY_COMPLETE':
            return [
                { label: 'Finaliser', action: 'finalize', variant: 'btn-primary', icon: 'check' },
                { label: 'Ajuster', action: 'adjust', variant: 'btn-outline', icon: 'pencil' }
            ];

        case 'COMPLETED':
            return [
                { label: 'Voir le code QR', action: 'show-qr', variant: 'btn-primary', icon: 'qr-code' },
                { label: 'Modifier', action: 'edit', variant: 'btn-outline', icon: 'pencil' }
            ];

        default:
            return [
                { label: 'Configurer', action: 'configure', variant: 'btn-primary',  icon: 'rocket' },
                { label: 'Supprimer', action: 'delete', variant: 'btn-outline', icon: 'trash' }
            ];
    }
}

export const configureProgressBar = (project: Project): ProgressBarConfig => {
    const totalGuests = project.guests?.length || 0;
    const totalTables = project.tables?.length || 0;
    const placedGuests = project.guests?.filter(guest => guest.tableId !== null).length || 0;

    const status = getProjectStatus(project);

    switch (status) {
        case 'DRAFT':
            return {
                label: "Configuration",
                value: 10,
                max: 100,
                color: "info" as const,
                text: "Projet créé"
            };

        case 'SETUP': {
            const tablesProgress = totalTables > 0 ? 20 : 0;
            const guestsProgress = totalGuests > 0 ? 10 : 0;
            return {
                label: "Tables et invités",
                value: tablesProgress + guestsProgress,
                max: 100,
                color: "warning" as const,
                text: totalTables > 0
                    ? `${totalTables} table${totalTables > 1 ? 's' : ''} créée${totalTables > 1 ? 's' : ''}`
                    : "Configuration en cours"
            };
        }

        case 'IN_PROGRESS': {
            const progressValue = Math.round((placedGuests / totalGuests) * 100);
            return {
                label: "Placement invités",
                value: progressValue,
                max: 100,
                color: "primary" as const,
                text: `${placedGuests}/${totalGuests} invités placés`
            };
        }

        case 'NEARLY_COMPLETE':
            return {
                label: "Finalisations",
                value: placedGuests,
                max: totalGuests,
                color: "success" as const,
                text: `${placedGuests}/${totalGuests} invités placés`
            };

        case 'COMPLETED':
            return {
                label: "Événement prêt",
                value: totalGuests,
                max: totalGuests,
                color: "success" as const,
                text: "Tous les invités placés"
            };

        default:
            return {
                label: "Configuration",
                value: 10,
                max: 100,
                color: "info" as const,
                text: "Statut inconnu"
            };
    }
}