import { create } from "zustand";
import { TOKEN_KEY } from "@/api/client";

interface AuthUser {
    sub: string; // teacher ID
    role: string;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    initialize: () => void;
}

function decodeToken(token: string): AuthUser | null {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
            sub: payload.sub ?? "",
            role: payload.role ?? "teacher",
        };
    } catch {
        return null;
    }
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,

    login: (token: string) => {
        const user = decodeToken(token);
        if (!user) return;
        localStorage.setItem(TOKEN_KEY, token);
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
    },

    initialize: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return;
        const user = decodeToken(token);
        if (!user) {
            localStorage.removeItem(TOKEN_KEY);
            return;
        }
        set({ token, user, isAuthenticated: true });
    },
}));
