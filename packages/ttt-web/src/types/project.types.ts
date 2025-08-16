import type {User} from "@/types/user.types.ts";
import type {EventType, UUID} from "@/types/common.types.ts";
import type {Table} from "@/types/table.types.ts";
import type {Guest} from "@/types/guest.types.ts";
import type {IconName} from "lucide-react/dynamic";

export type ProjectStatus = 'DRAFT' | 'SETUP' | 'IN_PROGRESS' | 'NEARLY_COMPLETE' | 'COMPLETED';

export type ProjectActionType = 'configure' | 'delete' | 'add-guests' | 'place-guests' | 'view-details' | 'finalize' | 'adjust' | 'show-qr' | 'edit';

export interface ProjectAction {
    label: string;
    action: ProjectActionType;
    variant: 'btn-primary' | 'btn-outline' | 'btn-destructive' ;
    icon?: IconName;
}

export interface ProgressBarConfig {
    label: string;
    value: number;
    max: number;
    color: 'info' | 'warning' | 'primary' | 'success';
    text: string;
}

export interface Project {
    id: UUID;
    userId: UUID;
    name: string;
    eventType: EventType;
    eventDate: string;
    venue: string;
    description?: string;
    qrCodeUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;

    user?: User;
    tables?: Table[];
    guests?: Guest[];
}