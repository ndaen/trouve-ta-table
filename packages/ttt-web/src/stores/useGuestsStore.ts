import { create } from 'zustand';
import { guestsService } from '@/services/guestsService';
import type { Guest } from '@/types/guest.types';
import type { CreateGuestInput, UpdateGuestInput } from '@/schemas/guestSchemas';
import { useProjectsStore } from './useProjectsStore';

interface GuestsState {
    guests: Guest[] | null;
    currentGuest: Guest | null;
    loading: boolean;
    error: string | null;

    loadGuests: (projectId: string) => Promise<void>;
    createGuest: (projectId: string, data: CreateGuestInput) => Promise<void>;
    updateGuest: (guestId: string, data: UpdateGuestInput) => Promise<void>;
    deleteGuest: (guestId: string) => Promise<void>;
    assignToTable: (guestId: string, tableId: string | null) => Promise<void>;

    selectGuest: (guest: Guest) => void;
    clearError: () => void;
    reset: () => void;
}

export const useGuestsStore = create<GuestsState>((set, get) => ({
    guests: null,
    currentGuest: null,
    loading: false,
    error: null,

    loadGuests: async (projectId: string) => {
        set({ loading: true, error: null });
        try {
            const guests = await guestsService.getByProjectId(projectId);
            set({ guests, loading: false, error: null });
        } catch (error) {
            console.error("Failed to load guests:", error);
            set({ 
                guests: null, 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des invités"
            });
            throw error;
        }
    },

    createGuest: async (projectId: string, data: CreateGuestInput) => {
        set({ loading: true, error: null });
        try {
            const newGuest = await guestsService.create(projectId, data);
            
            const { guests } = get();
            const updatedGuests = guests ? [...guests, newGuest] : [newGuest];
            
            set({ 
                guests: updatedGuests, 
                loading: false, 
                error: null 
            });

            await useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to create guest:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de l'invité"
            });
            throw error;
        }
    },

    updateGuest: async (guestId: string, data: UpdateGuestInput) => {
        set({ loading: true, error: null });
        try {
            const { guests } = get();
            const currentGuest = guests?.find(g => g.id === guestId);
            
            const { tableId, ...updateData } = data;
            let updatedGuest = await guestsService.update(guestId, updateData);
            
            if (tableId !== undefined && tableId !== currentGuest?.tableId) {
                if (tableId) {
                    updatedGuest = await guestsService.assignToTable(guestId, tableId);
                } else if (currentGuest?.tableId) {
                    updatedGuest = await guestsService.unassignFromTable(guestId);
                }
            }
            
            const updatedGuests = guests?.map(guest => 
                guest.id === guestId ? updatedGuest : guest
            ) || null;
            
            set({ 
                guests: updatedGuests,
                currentGuest: updatedGuest,
                loading: false, 
                error: null 
            });

            // Refresh projects to update guest data
            useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to update guest:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour de l'invité"
            });
            throw error;
        }
    },

    deleteGuest: async (guestId: string) => {
        set({ loading: true, error: null });
        try {
            await guestsService.delete(guestId);

            const { guests, currentGuest } = get();
            const filteredGuests = guests?.filter(guest => guest.id !== guestId) || null;

            set({
                guests: filteredGuests,
                currentGuest: currentGuest?.id === guestId ? null : currentGuest,
                loading: false,
                error: null
            });

            // Refresh projects to update guest data
            useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to delete guest:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression de l'invité"
            });
            throw error;
        }
    },

    assignToTable: async (guestId: string, tableId: string | null) => {
        set({ loading: true, error: null });
        try {
            let updatedGuest: Guest;
            
            if (tableId) {
                updatedGuest = await guestsService.assignToTable(guestId, tableId);
            } else {
                updatedGuest = await guestsService.unassignFromTable(guestId);
            }
            
            const { guests, currentGuest } = get();
            const updatedGuests = guests?.map(guest => 
                guest.id === guestId ? updatedGuest : guest
            ) || null;
            
            set({ 
                guests: updatedGuests,
                currentGuest: currentGuest?.id === guestId ? updatedGuest : currentGuest,
                loading: false, 
                error: null 
            });

            // Refresh projects to update guest data
            useProjectsStore.getState().loadProjects();
        } catch (error) {
            console.error("Failed to assign guest to table:", error);
            set({ 
                loading: false, 
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de l'assignation de l'invité"
            });
            throw error;
        }
    },

    selectGuest: (guest: Guest) => {
        set({ currentGuest: guest });
    },

    clearError: () => {
        set({ error: null });
    },

    reset: () => {
        set({ guests: null, currentGuest: null, loading: false, error: null });
    }
}));