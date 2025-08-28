import { create } from 'zustand';
import { tablesService } from '@/services/tablesService';
import type { Table } from '@/types/table.types';
import type { CreateTableInput, UpdateTableInput } from '@/schemas/tableSchemas';
import { useProjectsStore } from './useProjectsStore';

interface TablesState {
    tables: Table[] | null;
    currentTable: Table | null;
    loading: boolean;
    error: string | null;

    loadTables: (projectId: string) => Promise<void>;
    createTable: (projectId: string, data: CreateTableInput) => Promise<void>;
    updateTable: (tableId: string, data: UpdateTableInput) => Promise<void>;
    deleteTable: (tableId: string) => Promise<void>;

    selectTable: (table: Table) => void;
    clearError: () => void;
    reset: () => void;
}

export const useTablesStore = create<TablesState>((set, get) => ({
    tables: null,
    currentTable: null,
    loading: false,
    error: null,

    loadTables: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
            const tables = await tablesService.getByProjectId(projectId);
            set({ tables, loading: false, error: null });
        } catch (error) {
            console.error("Failed to load tables:", error);
            set({ 
                tables: null, 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des tables"
            });
            throw error;
        }
    },

    createTable: async (projectId: string, data: CreateTableInput) => {
        set({ loading: true, error: null });
        try {
            const newTable = await tablesService.create(projectId, data);
            
            const { tables } = get();
            const updatedTables = tables ? [...tables, newTable] : [newTable];
            
            set({ 
                tables: updatedTables, 
                loading: false, 
                error: null 
            });

            await useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to create table:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la table"
            });
            throw error;
        }
    },

    updateTable: async (tableId: string, data: UpdateTableInput) => {
        set({ loading: true, error: null });
        try {
            const updatedTable = await tablesService.update(tableId, data);
            
            const { tables, currentTable } = get();
            const updatedTables = tables?.map(table => 
                table.id === tableId ? updatedTable : table
            ) || null;
            
            set({ 
                tables: updatedTables,
                currentTable: currentTable?.id === tableId ? updatedTable : currentTable,
                loading: false, 
                error: null 
            });

            // Refresh projects to update table data
            useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to update table:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour de la table"
            });
            throw error;
        }
    },

    deleteTable: async (tableId: string) => {
        set({ loading: true, error: null });
        try {
            await tablesService.delete(tableId);

            const { tables, currentTable } = get();
            const filteredTables = tables?.filter(table => table.id !== tableId) || null;

            set({
                tables: filteredTables,
                currentTable: currentTable?.id === tableId ? null : currentTable,
                loading: false,
                error: null
            });

            // Refresh projects to update table data
            useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to delete table:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression de la table"
            });
            throw error;
        }
    },

    selectTable: (table: Table) => {
        set({ currentTable: table });
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set({ tables: null, currentTable: null, loading: false, error: null });
    }
}));