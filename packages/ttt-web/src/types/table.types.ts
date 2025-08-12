// === TABLE INTERFACE ===
import type {Project} from "@/types/project.types.ts";
import type {Guest} from "@/types/guest.types.ts";
import type {UUID} from "ttt-api/app/types";

export interface Table {
    id: UUID;
    projectId: UUID;
    name: string;
    capacity: number;
    description?: string;
    createdAt: string;
    updatedAt: string;

    project?: Project;
    guests?: Guest[];
}
