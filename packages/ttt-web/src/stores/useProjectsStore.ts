import { create } from "zustand";
import type { Project } from "@/types/project.types.ts";
import { projectsService } from "@/services/projectsService.ts";
import type { CreateProjectInput } from "@/schemas/projectSchemas.ts";
import { CreateProjectSchema } from "@/schemas/projectSchemas.ts";
import { ApiError } from "@/utils/apiClient.ts";

interface ProjectsState {
    projects: Project[] | null
    currentProject: Project | null
    loading: boolean
    error: string | null

    loadProjects: () => Promise<void>
    createProject: (data: CreateProjectInput) => Promise<void>
    updateProject: (id: string, data: Partial<Project>) => Promise<void>
    deleteProject: (id: string) => Promise<void>

    selectProject: (project: Project) => void
    clearError: () => void
    reset: () => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
    projects: null,
    currentProject: null,
    loading: false,
    error: null,

    loadProjects: async () => {
        set({ loading: true, error: null });
        try {
            const projects = await projectsService.getByUser();
            set({
                projects,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Failed to load projects:", error);
            set({
                projects: null,
                loading: false,
                error: error instanceof ApiError ? error.message : "Erreur lors du chargement des projets"
            });
        }
    },

    createProject: async (data: CreateProjectInput) => {
        set({ loading: true, error: null });
        try {
            const validData = CreateProjectSchema.parse(data);

            const newProject = await projectsService.create(validData);

            const { projects } = get();
            set({
                currentProject: newProject,
                projects: projects ? [...projects, newProject] : [newProject],
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Failed to create project:", error);
            set({
                loading: false,
                error: error instanceof ApiError ? error.message : "Erreur lors de la création du projet"
            });
            throw error;
        }
    },

    updateProject: async (id: string, data: Partial<Project>) => {
        set({ loading: true, error: null });
        try {
            const updatedProject = await projectsService.update(id, data);

            const { projects, currentProject } = get();
            const updatedProjects = projects?.map(project =>
                project.id === id ? updatedProject : project
            ) || null;

            set({
                projects: updatedProjects,
                currentProject: currentProject?.id === id ? updatedProject : currentProject,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Failed to update project:", error);
            set({
                loading: false,
                error: error instanceof ApiError ? error.message : "Erreur lors de la mise à jour du projet"
            });
            throw error;
        }
    },

    deleteProject: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await projectsService.delete(id);

            const { projects, currentProject } = get();
            const filteredProjects = projects?.filter(project => project.id !== id) || null;

            set({
                projects: filteredProjects,
                currentProject: currentProject?.id === id ? null : currentProject,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Failed to delete project:", error);
            set({
                loading: false,
                error: error instanceof ApiError ? error.message : "Erreur lors de la suppression du projet"
            });
            throw error;
        }
    },

    selectProject: (project: Project) => {
        set({ currentProject: project });
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set({
            projects: null,
            currentProject: null,
            loading: false,
            error: null
        });
    }
}))

export const selectProjects = (state: ProjectsState) => state.projects;
export const selectCurrentProject = (state: ProjectsState) => state.currentProject;
export const selectLoading = (state: ProjectsState) => state.loading;
export const selectError = (state: ProjectsState) => state.error;