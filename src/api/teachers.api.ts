import client from "./client";
import type {
    AssignLocationRequest,
    CreateTeacherRequest,
    TeacherResponse,
} from "./types";

export const teachersApi = {
    getAll: () =>
        client
            .get<TeacherResponse[]>("/api/v1/teachers")
            .then((r) => r.data),

    getById: (id: string) =>
        client
            .get<TeacherResponse>(`/api/v1/teachers/${id}`)
            .then((r) => r.data),

    create: (data: CreateTeacherRequest) =>
        client
            .post<TeacherResponse>("/api/v1/teachers", data)
            .then((r) => r.data),

    update: (id: string, data: Partial<CreateTeacherRequest>) =>
        client
            .put<TeacherResponse>(`/api/v1/teachers/${id}`, data)
            .then((r) => r.data),

    remove: (id: string) =>
        client.delete(`/api/v1/teachers/${id}`),

    assignLocation: (teacherId: string, data: AssignLocationRequest) =>
        client
            .post(`/api/v1/teachers/${teacherId}/locations`, data)
            .then((r) => r.data),

    removeLocation: (teacherId: string, locationId: string) =>
        client.delete(
            `/api/v1/teachers/${teacherId}/locations/${locationId}`,
        ),
};
