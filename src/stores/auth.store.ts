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

// Synchronous initialization — read token from localStorage at store creation.
// No async, no useEffect, no flicker.
function initAuth(): Pick<AuthState, "token" | "user" | "isAuthenticated"> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return { token: null, user: null, isAuthenticated: false };
    }
    const user = decodeToken(token);
    if (!user) {
        localStorage.removeItem(TOKEN_KEY);
        return { token: null, user: null, isAuthenticated: false };
    }
    return { token, user, isAuthenticated: true };
}

export const useAuthStore = create<AuthState>(() => {
    const initial = initAuth();
    return {
        ...initial,

        login: (token: string) => {
            const user = decodeToken(token);
            if (!user) return;
            localStorage.setItem(TOKEN_KEY, token);
            useAuthStore.setState({ token, user, isAuthenticated: true });
        },

        logout: () => {
            localStorage.removeItem(TOKEN_KEY);
            useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
        },
    };
});
