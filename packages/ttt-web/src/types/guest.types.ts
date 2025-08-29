// === GUEST INTERFACE ===
import type {Project} from "@/types/project.types.ts";
import type {Table} from "@/types/table.types.ts";
import type {UUID} from "@/types/common.types";

export interface Guest {
    id: UUID;
    projectId: UUID;
    tableId?: UUID | null;
    firstName: string;
    lastName: string;
    email?: string;
    dietary_requirements?: string;
    createdAt: string;
    updatedAt: string;

    project?: Project;
    table?: Table;
}