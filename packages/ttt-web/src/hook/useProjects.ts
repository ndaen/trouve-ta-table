import { useEffect } from 'react';
import { useProjectsStore, selectProjects, selectLoading, selectError } from '@/stores/useProjectsStore';
import type { Project } from "@/types/project.types.ts";

export const useProjects = () => {
    const projects = useProjectsStore(selectProjects);
    const loading = useProjectsStore(selectLoading);
    const error = useProjectsStore(selectError);
    const loadProjects = useProjectsStore(state => state.loadProjects);

    useEffect(() => {
        if (projects === null && !loading) {
            loadProjects();
        }
    }, [projects, loading, loadProjects]);

    return {
        projects: projects || [],
        loading,
        error,
        isEmpty: projects !== null && projects.length === 0,
        isLoaded: projects !== null
    };
};

export const useCurrentProject = () => {
    return useProjectsStore(state => state.currentProject);
};

export const useProjectsActions = () => {
    const createProject = useProjectsStore(state => state.createProject);
    const updateProject = useProjectsStore(state => state.updateProject);
    const deleteProject = useProjectsStore(state => state.deleteProject);
    const selectProject = useProjectsStore(state => state.selectProject);
    const clearError = useProjectsStore(state => state.clearError);
    const reset = useProjectsStore(state => state.reset);

    return {
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        clearError,
        reset
    };
};

export const useProjectsComplete = () => {
    const projectsData = useProjects();
    const currentProject = useCurrentProject();
    const actions = useProjectsActions();

    return {
        ...projectsData,
        currentProject,
        ...actions
    };
};

export const useProjectById = (id: string | undefined): Project | undefined => {
    const projects = useProjectsStore(selectProjects);

    if (!id || !projects) return undefined;

    return projects.find(project => project.id === id);
};

export const useProjectsStats = () => {
    const projects = useProjectsStore(selectProjects);

    if (!projects) {
        return {
            total: 0,
            active: 0,
            inactive: 0
        };
    }

    const active = projects.filter(p => p.isActive).length;

    return {
        total: projects.length,
        active,
        inactive: projects.length - active
    };
};