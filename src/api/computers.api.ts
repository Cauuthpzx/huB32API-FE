import client from "./client";
import type {
    ComputerDto,
    ComputerInfoDto,
    ComputerListDto,
    ComputerListParams,
    ComputerStateDto,
    SessionDto,
} from "./types";

export const computersApi = {
    getAll: (params?: ComputerListParams) =>
        client
            .get<ComputerListDto>("/api/v1/computers", { params })
            .then((r) => r.data),

    getById: (id: string) =>
        client
            .get<ComputerDto>(`/api/v1/computers/${id}`)
            .then((r) => r.data),

    getInfo: (id: string) =>
        client
            .get<ComputerInfoDto>(`/api/v1/computers/${id}/info`)
            .then((r) => r.data),

    getSessions: (id: string) =>
        client
            .get<SessionDto>(`/api/v1/computers/${id}/session`)
            .then((r) => r.data),

    getFramebufferUrl: (
        id: string,
        params?: { width?: number; height?: number; format?: "png" | "jpeg"; quality?: number },
    ) => {
        const apiBase = import.meta.env.VITE_MOCK_API === "true"
            ? ""
            : (import.meta.env.VITE_API_URL as string);
        const base = `${apiBase}/api/v1/computers/${id}/framebuffer`;
        const query = new URLSearchParams();
        if (params?.width) query.set("width", String(params.width));
        if (params?.height) query.set("height", String(params.height));
        if (params?.format) query.set("format", params.format);
        if (params?.quality) query.set("quality", String(params.quality));
        const qs = query.toString();
        return qs ? `${base}?${qs}` : base;
    },

    /** v2: TCP ping reachability check */
    getState: (id: string) =>
        client
            .get<ComputerStateDto>(`/api/v2/computers/${id}/state`)
            .then((r) => r.data),
};
