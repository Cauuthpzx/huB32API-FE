// ============================================================
// HUB32 API Types — matches backend DTOs exactly.
// DO NOT rename fields. These must match the JSON wire format.
// ============================================================

// ---- Generic ----

export interface ApiError {
    status: number;
    type: string;
    title: string;
    detail: string;
    instance: string;
}

export interface PaginationParams {
    limit?: number;
    after?: string;
}

export interface PageInfo {
    total: number;
    limit: number;
    nextCursor: string | null;
}

// ---- Auth ----

export interface AuthRequest {
    method: string; // "hub32-key" | "logon"
    username: string;
    password: string;
    keyName?: string;
    keyData?: string;
}

export interface AuthResponse {
    token: string;
    tokenType: string; // "Bearer"
    expiresIn: number; // seconds
}

export interface LogoutRequest {
    jti: string;
}

// ---- Computer ----

export type ComputerState =
    | "online"
    | "offline"
    | "connected"
    | "connecting"
    | "disconnecting"
    | "unknown";

export interface ComputerDto {
    id: string;
    name: string;
    hostname: string;
    location: string;
    state: ComputerState;
}

export interface ComputerListDto {
    computers: ComputerDto[];
    page: PageInfo;
}

export interface ComputerListParams extends PaginationParams {
    location?: string;
    state?: ComputerState;
}

// ---- User / Session / Screen ----

export interface UserDto {
    login: string;
    fullName: string;
    domain: string;
}

export interface SessionDto {
    sessionId: number;
    userLogin: string;
    userFullName: string;
    clientAddress: string;
    uptimeSeconds: number;
    sessionType: string; // "console" | "rdp" | "ssh"
    sessionClientName: string;
    sessionHostName: string;
}

export interface ScreenDto {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ComputerInfoDto {
    computer: ComputerDto;
    user: UserDto | null;
    session: SessionDto | null;
    screens: ScreenDto[];
}

// ---- Feature ----

export interface FeatureDto {
    uid: string;
    parentUid: string;
    name: string;
    description: string;
    isActive: boolean;
    isMasterSide: boolean;
    isServiceSide: boolean;
}

export interface FeatureListDto {
    features: FeatureDto[];
}

export interface FeatureControlRequest {
    active: boolean;
    arguments: Record<string, string>;
}

/** Well-known feature UIDs */
export const FeatureUids = {
    ScreenLock: "ccb535a2-1d24-4cc1-a709-8b47d2b2ac79",
    InputLock: "e4a77879-e444-4d5e-ab27-da0a54c4a31f",
    PowerDown: "7b6e0e0c-2a8f-4b93-a8a5-8c3a1e49b634",
    Reboot: "4f7d11a7-1e44-4a3b-8d98-7e14f3b5c871",
} as const;

// ---- School ----

export interface CreateSchoolRequest {
    name: string;
    address: string;
}

export interface SchoolResponse {
    id: string;
    name: string;
    address: string;
    createdAt: number;
}

// ---- Location ----

export interface CreateLocationRequest {
    schoolId: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
    type: string; // "classroom" | "lab" | "office"
}

export interface LocationResponse {
    id: string;
    schoolId: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
    type: string;
}

/** v2 location DTO with computer count */
export interface LocationDto {
    id: string;
    name: string;
    computerCount: number;
    computerIds: string[];
}

export interface LocationListDto {
    locations: LocationDto[];
    total: number;
}

// ---- Teacher ----

export interface CreateTeacherRequest {
    username: string;
    password: string;
    fullName: string;
    role: string; // "admin" | "teacher" | "readonly"
}

export interface TeacherResponse {
    id: string;
    username: string;
    fullName: string;
    role: string;
    createdAt: number;
}

export interface AssignLocationRequest {
    locationId: string;
}

// ---- Agent ----

export interface AgentRegisterRequest {
    hostname: string;
    macAddress: string;
    agentKey: string;
    osVersion: string;
    agentVersion: string;
    capabilities: string[];
}

export interface AgentRegisterResponse {
    agentId: string;
    computerId: string;
    locationId: string;
    authToken: string;
    commandPollIntervalMs: number;
}

export type AgentState = "offline" | "online" | "busy" | "error";

export interface AgentStatusDto {
    agentId: string;
    hostname: string;
    ipAddress: string;
    state: AgentState;
    agentVersion: string;
    lastHeartbeat: string; // ISO 8601
    capabilities: string[];
}

export interface AgentCommandRequest {
    featureUid: string;
    operation: string; // "start" | "stop"
    arguments: Record<string, string>;
}

export interface AgentCommandResponse {
    commandId: string;
    status: string;
}

export interface AgentCommandResultRequest {
    commandId: string;
    status: string; // "success" | "failed"
    result: string; // JSON string
    durationMs: number;
}

// ---- Batch (v2) ----

export interface BatchFeatureRequest {
    computerIds: string[];
    featureUid: string;
    operation: string; // "start" | "stop"
    arguments: Record<string, string>;
}

export interface BatchResultItem {
    computerId: string;
    success: boolean;
    error: string;
}

export interface BatchFeatureResponse {
    total: number;
    succeeded: number;
    failed: number;
    results: BatchResultItem[];
}

// ---- Stream / WebRTC ----

export interface CreateTransportRequest {
    locationId: string;
    direction: "send" | "recv";
}

export interface CreateTransportResponse {
    id: string;
    iceParameters: unknown;
    iceCandidates: unknown;
    dtlsParameters: unknown;
}

export interface ConnectTransportRequest {
    dtlsParameters: unknown;
}

export interface ProduceRequest {
    transportId: string;
    kind: "video" | "audio";
    rtpParameters: unknown;
}

export interface ProduceResponse {
    id: string;
}

export interface ConsumeRequest {
    transportId: string;
    producerId: string;
    rtpCapabilities: unknown;
}

export interface ConsumeResponse {
    id: string;
    producerId: string;
    kind: string;
    rtpParameters: unknown;
}

export interface IceServer {
    urls: string[];
    username: string;
    credential: string;
}

// ---- Computer State (v2) ----

export interface ComputerStateDto {
    id: string;
    hostname: string;
    online: boolean;
    latencyMs: number;
}

// ---- Health (v2) ----

export interface HealthResponse {
    status: "ok" | "degraded";
}
