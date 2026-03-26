import { create } from "zustand";
import { toast } from "sonner";
import type { ComputerDto, LocationResponse } from "@/api/types";
import { locationsApi } from "@/api/locations.api";

const SIDEBAR_PIN_KEY = "hub32_sidebar_pinned";
const LOCATIONS_CACHE_KEY = "hub32_locations";
const SELECTED_LOCATION_KEY = "hub32_selected_location";
const COMPUTERS_CACHE_KEY = "hub32_computers";

function readJson<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

// Restore cached state synchronously at store creation — zero flicker
const cachedLocations = readJson<LocationResponse[]>(LOCATIONS_CACHE_KEY) ?? [];
const cachedLocationId = localStorage.getItem(SELECTED_LOCATION_KEY);
const cachedComputers = readJson<ComputerDto[]>(COMPUTERS_CACHE_KEY) ?? [];

interface RoomState {
    locations: LocationResponse[];
    selectedLocationId: string | null;
    computers: ComputerDto[];
    selectedComputerIds: Set<string>;
    isLoadingLocations: boolean;
    isLoadingComputers: boolean;
    error: string | null;
    sidebarPinned: boolean;

    fetchLocations: (schoolId: string) => Promise<void>;
    selectLocation: (id: string) => Promise<void>;
    toggleComputer: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    togglePin: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
    // Start with cached data — no loading state if cache exists
    locations: cachedLocations,
    selectedLocationId: cachedLocationId,
    computers: cachedComputers,
    selectedComputerIds: new Set<string>(),
    isLoadingLocations: cachedLocations.length === 0,
    isLoadingComputers: cachedComputers.length === 0,
    error: null,
    sidebarPinned: localStorage.getItem(SIDEBAR_PIN_KEY) === "true",

    fetchLocations: async (schoolId: string) => {
        // Only show loading if no cached data
        if (get().locations.length === 0) {
            set({ isLoadingLocations: true });
        }
        try {
            const locs = await locationsApi.getBySchool(schoolId);
            localStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify(locs));
            set({ locations: locs, isLoadingLocations: false });

            // Auto-select first location if none selected
            const currentId = get().selectedLocationId;
            if (locs.length > 0 && (!currentId || !locs.some((l) => l.id === currentId))) {
                await get().selectLocation(locs[0].id);
            } else if (currentId) {
                // Refresh computers for current selection
                await get().selectLocation(currentId);
            }
        } catch {
            set({ isLoadingLocations: false, error: "fetch_locations_failed" });
            toast.error("Failed to load rooms");
        }
    },

    selectLocation: async (id: string) => {
        localStorage.setItem(SELECTED_LOCATION_KEY, id);

        // Only clear + show loading if switching to a different room with no cache
        const prevId = get().selectedLocationId;
        if (prevId !== id) {
            set({
                selectedLocationId: id,
                computers: [],
                selectedComputerIds: new Set(),
                isLoadingComputers: true,
            });
        } else if (get().computers.length === 0) {
            set({ isLoadingComputers: true });
        }

        try {
            const pcs = await locationsApi.getComputers(id);
            localStorage.setItem(COMPUTERS_CACHE_KEY, JSON.stringify(pcs));
            set({ selectedLocationId: id, computers: pcs, isLoadingComputers: false });
        } catch {
            set({ isLoadingComputers: false, error: "fetch_computers_failed" });
            toast.error("Failed to load computers");
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
