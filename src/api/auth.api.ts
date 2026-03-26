import client from "./client";
import type { AuthRequest, AuthResponse, TeacherResponse } from "./types";

export const authApi = {
    login: (data: AuthRequest) =>
        client
            .post<AuthResponse>("/api/v1/auth", data)
            .then((r) => r.data),

    logout: () =>
        client.delete("/api/v1/auth").then((r) => r.data),

    getMe: () =>
        client
            .get<TeacherResponse>("/api/v1/auth/me")
            .then((r) => r.data),
};
