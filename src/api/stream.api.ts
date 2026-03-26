import client from "./client";
import type {
    ConsumeRequest,
    ConsumeResponse,
    ConnectTransportRequest,
    CreateTransportRequest,
    CreateTransportResponse,
    IceServer,
    ProduceRequest,
    ProduceResponse,
} from "./types";

export const streamApi = {
    createTransport: (data: CreateTransportRequest) =>
        client
            .post<CreateTransportResponse>("/api/v1/stream/transport", data)
            .then((r) => r.data),

    connectTransport: (transportId: string, data: ConnectTransportRequest) =>
        client
            .post(
                `/api/v1/stream/transport/${transportId}/connect`,
                data,
            )
            .then((r) => r.data),

    produce: (data: ProduceRequest) =>
        client
            .post<ProduceResponse>("/api/v1/stream/produce", data)
            .then((r) => r.data),

    consume: (data: ConsumeRequest) =>
        client
            .post<ConsumeResponse>("/api/v1/stream/consume", data)
            .then((r) => r.data),

    closeTransport: (transportId: string) =>
        client.delete(`/api/v1/stream/transport/${transportId}`),

    getIceServers: () =>
        client
            .get<IceServer[]>("/api/v1/stream/ice-servers")
            .then((r) => r.data),

    getCapabilities: (locationId: string) =>
        client
            .get<unknown>(
                `/api/v1/stream/capabilities/${locationId}`,
            )
            .then((r) => r.data),
};
