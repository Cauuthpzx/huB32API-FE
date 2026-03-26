import client from "./client";
import type { CreateSchoolRequest, SchoolResponse } from "./types";

export const schoolsApi = {
    getAll: () =>
        client
            .get<SchoolResponse[]>("/api/v1/schools")
            .then((r) => r.data),

    getById: (id: string) =>
        client
            .get<SchoolResponse>(`/api/v1/schools/${id}`)
            .then((r) => r.data),

    create: (data: CreateSchoolRequest) =>
        client
            .post<SchoolResponse>("/api/v1/schools", data)
            .then((r) => r.data),

    update: (id: string, data: CreateSchoolRequest) =>
        client
            .put<SchoolResponse>(`/api/v1/schools/${id}`, data)
            .then((r) => r.data),

    remove: (id: string) =>
        client.delete(`/api/v1/schools/${id}`),
};
