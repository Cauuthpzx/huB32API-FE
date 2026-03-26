import { create } from "zustand";
import type { ComputerDto, LocationResponse } from "@/api/types";
import { locationsApi } from "@/api/locations.api";

const SIDEBAR_PIN_KEY = "hub32_sidebar_pinned";

interface RoomState {
    locations: LocationResponse[];
    selectedLocationId: string | null;
    computers: ComputerDto[];
    selectedComputerIds: Set<string>;
    isLoadingLocations: boolean;
    isLoadingComputers: boolean;
    sidebarPinned: boolean;

    fetchLocations: (schoolId: string) => Promise<void>;
    selectLocation: (id: string) => Promise<void>;
    toggleComputer: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    togglePin: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
    locations: [],
    selectedLocationId: null,
    computers: [],
    selectedComputerIds: new Set<string>(),
    isLoadingLocations: true,
    isLoadingComputers: true,
    sidebarPinned: localStorage.getItem(SIDEBAR_PIN_KEY) === "true",

    fetchLocations: async (schoolId: string) => {
        set({ isLoadingLocations: true });
        try {
            const locs = await locationsApi.getBySchool(schoolId);
            set({ locations: locs, isLoadingLocations: false });
            if (locs.length > 0 && !get().selectedLocationId) {
                await get().selectLocation(locs[0].id);
            }
        } catch {
            set({ isLoadingLocations: false });
        }
    },

    selectLocation: async (id: string) => {
        set({
            selectedLocationId: id,
            computers: [],
            selectedComputerIds: new Set(),
            isLoadingComputers: true,
        });
        try {
            const pcs = await locationsApi.getComputers(id);
            set({ computers: pcs, isLoadingComputers: false });
        } catch {
            set({ isLoadingComputers: false });
        }
    },

    toggleComputer: (id: string) => {
        set((state) => {
            const next = new Set(state.selectedComputerIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { selectedComputerIds: next };
        });
    },

    selectAll: () => {
        set((state) => ({
            selectedComputerIds: new Set(state.computers.map((c) => c.id)),
        }));
    },

    deselectAll: () => {
        set({ selectedComputerIds: new Set() });
    },

    togglePin: () => {
        set((state) => {
            const next = !state.sidebarPinned;
            localStorage.setItem(SIDEBAR_PIN_KEY, String(next));
            return { sidebarPinned: next };
        });
    },
}));
