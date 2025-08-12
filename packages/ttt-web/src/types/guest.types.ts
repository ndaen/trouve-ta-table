// === GUEST INTERFACE ===
import type {UUID} from "ttt-api/app/types";
import type {Project} from "@/types/project.types.ts";
import type {Table} from "@/types/table.types.ts";

export interface Guest {
    id: UUID;
    projectId: UUID;
    tableId?: UUID | null;
    firstName: string;
    lastName: string;
    email?: string;
    dietaryRequirements?: string;
    createdAt: string;
    updatedAt: string;

    project?: Project;
    table?: Table;
}