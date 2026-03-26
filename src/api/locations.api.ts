import client from "./client";
import type {
    ComputerDto,
    CreateLocationRequest,
    LocationDto,
    LocationListDto,
    LocationResponse,
} from "./types";

export const locationsApi = {
    // ---- v1: school-scoped ----

    create: (schoolId: string, data: Omit<CreateLocationRequest, "schoolId">) =>
        client
            .post<LocationResponse>(
                `/api/v1/schools/${schoolId}/locations`,
                { ...data, schoolId },
            )
            .then((r) => r.data),

    getBySchool: (schoolId: string) =>
        client
            .get<LocationResponse[]>(`/api/v1/schools/${schoolId}/locations`)
            .then((r) => r.data),

    getById: (id: string) =>
        client
            .get<LocationResponse>(`/api/v1/locations/${id}`)
            .then((r) => r.data),

    update: (id: string, data: Partial<CreateLocationRequest>) =>
        client
            .put<LocationResponse>(`/api/v1/locations/${id}`, data)
            .then((r) => r.data),

    remove: (id: string) =>
        client.delete(`/api/v1/locations/${id}`),

    getComputers: (id: string) =>
        client
            .get<ComputerDto[]>(`/api/v1/locations/${id}/computers`)
            .then((r) => r.data),

    // ---- v2: flat list ----

    getAll: () =>
        client
            .get<LocationListDto>("/api/v2/locations")
            .then((r) => r.data),

    getV2ById: (id: string) =>
        client
            .get<LocationDto>(`/api/v2/locations/${id}`)
            .then((r) => r.data),
};
