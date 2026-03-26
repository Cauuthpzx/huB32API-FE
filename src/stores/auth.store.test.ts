import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth.store";
import { TOKEN_KEY } from "@/api/client";

function makeFakeToken(sub: string, role: string): string {
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub, role, iat: 1000, exp: 9999 }));
    return `${header}.${payload}.${btoa("sig")}`;
}

describe("auth.store", () => {
    beforeEach(() => {
        localStorage.clear();
        useAuthStore.setState({
            token: null,
            user: null,
            isAuthenticated: false,
        });
    });

    it("starts unauthenticated", () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.token).toBeNull();
        expect(state.user).toBeNull();
    });

    it("login decodes JWT and saves to localStorage", () => {
        const token = makeFakeToken("teacher-1", "admin");
        useAuthStore.getState().login(token);

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.token).toBe(token);
        expect(state.user).toEqual({ sub: "teacher-1", role: "admin" });
        expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    });

    it("logout clears state and localStorage", () => {
        const token = makeFakeToken("teacher-1", "admin");
        useAuthStore.getState().login(token);
        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.token).toBeNull();
        expect(state.user).toBeNull();
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it("initialize restores from localStorage", () => {
        const token = makeFakeToken("teacher-2", "teacher");
        localStorage.setItem(TOKEN_KEY, token);

        useAuthStore.getState().initialize();

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual({ sub: "teacher-2", role: "teacher" });
    });

    it("initialize does nothing if no token", () => {
        useAuthStore.getState().initialize();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("initialize clears invalid token", () => {
        localStorage.setItem(TOKEN_KEY, "not-a-jwt");
        useAuthStore.getState().initialize();

        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
});
