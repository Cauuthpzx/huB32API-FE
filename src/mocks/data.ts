import type {
    ComputerDto,
    ComputerState,
    FeatureDto,
    LocationResponse,
    SchoolResponse,
    SessionDto,
    TeacherResponse,
    UserDto,
} from "@/api/types";
import { FeatureUids } from "@/api/types";

// ---- Helpers ----

function uid(): string {
    return crypto.randomUUID();
}

function pickState(): ComputerState {
    const r = Math.random();
    if (r < 0.6) return "online";
    if (r < 0.8) return "offline";
    if (r < 0.9) return "connected";
    if (r < 0.95) return "connecting";
    return "disconnecting";
}

// ---- Schools ----

export const schools: SchoolResponse[] = [
    {
        id: "school-1",
        name: "Trường THPT Hub32",
        address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
    },
];

// ---- Locations ----

export const locations: LocationResponse[] = [
    {
        id: "loc-1",
        schoolId: "school-1",
        name: "Phòng Máy 1",
        building: "A",
        floor: 2,
        capacity: 30,
        type: "classroom",
    },
    {
        id: "loc-2",
        schoolId: "school-1",
        name: "Phòng Máy 2",
        building: "A",
        floor: 3,
        capacity: 25,
        type: "classroom",
    },
    {
        id: "loc-3",
        schoolId: "school-1",
        name: "Lab Tin Học",
        building: "B",
        floor: 1,
        capacity: 20,
        type: "lab",
    },
];

// ---- Computers (75 total: 30 + 25 + 20) ----

function generateComputers(
    locationId: string,
    locationName: string,
    count: number,
    startIndex: number,
): ComputerDto[] {
    return Array.from({ length: count }, (_, i) => {
        const idx = startIndex + i + 1;
        return {
            id: `pc-${idx.toString().padStart(3, "0")}`,
            name: `${locationName}-PC${(i + 1).toString().padStart(2, "0")}`,
            hostname: `HUB32-PC${idx.toString().padStart(3, "0")}`,
            location: locationId,
            state: pickState(),
        };
    });
}

export const computers: ComputerDto[] = [
    ...generateComputers("loc-1", "PM1", 30, 0),
    ...generateComputers("loc-2", "PM2", 25, 30),
    ...generateComputers("loc-3", "Lab", 20, 55),
];

// ---- Per-computer mock data generators ----

export function mockUser(computer: ComputerDto): UserDto | null {
    if (computer.state === "offline") return null;
    const num = computer.id.replace("pc-", "");
    return {
        login: `student${num}`,
        fullName: `Học Sinh ${num}`,
        domain: "HUB32",
    };
}

export function mockSession(computer: ComputerDto): SessionDto | null {
    if (computer.state === "offline") return null;
    return {
        sessionId: parseInt(computer.id.replace("pc-", ""), 10),
        userLogin: `student${computer.id.replace("pc-", "")}`,
        userFullName: `Học Sinh ${computer.id.replace("pc-", "")}`,
        clientAddress: `192.168.1.${100 + parseInt(computer.id.replace("pc-", ""), 10)}`,
        uptimeSeconds: Math.floor(Math.random() * 7200),
        sessionType: "console",
        sessionClientName: computer.hostname,
        sessionHostName: computer.hostname,
    };
}

// ---- Features (per computer, in memory for toggling) ----

const defaultFeatures: Omit<FeatureDto, "isActive">[] = [
    {
        uid: FeatureUids.ScreenLock,
        parentUid: "",
        name: "Screen Lock",
        description: "Lock the computer screen",
        isMasterSide: true,
        isServiceSide: true,
    },
    {
        uid: FeatureUids.InputLock,
        parentUid: "",
        name: "Input Lock",
        description: "Lock mouse and keyboard",
        isMasterSide: true,
        isServiceSide: true,
    },
    {
        uid: FeatureUids.PowerDown,
        parentUid: "",
        name: "Power Down",
        description: "Shut down the computer",
        isMasterSide: true,
        isServiceSide: true,
    },
    {
        uid: FeatureUids.Reboot,
        parentUid: "",
        name: "Reboot",
        description: "Restart the computer",
        isMasterSide: true,
        isServiceSide: true,
    },
];

// featureState[computerId][featureUid] = isActive
export const featureState: Record<string, Record<string, boolean>> = {};

export function getFeaturesForComputer(computerId: string): FeatureDto[] {
    if (!featureState[computerId]) {
        featureState[computerId] = {};
        for (const f of defaultFeatures) {
            featureState[computerId][f.uid] = false;
        }
    }
    return defaultFeatures.map((f) => ({
        ...f,
        isActive: featureState[computerId][f.uid] ?? false,
    }));
}

export function setFeatureActive(
    computerId: string,
    featureUid: string,
    active: boolean,
): void {
    if (!featureState[computerId]) {
        featureState[computerId] = {};
    }
    featureState[computerId][featureUid] = active;
}

// ---- Teachers ----

interface MockTeacher extends TeacherResponse {
    password: string;
    assignedLocations: string[];
}

export const teachers: MockTeacher[] = [
    {
        id: "teacher-1",
        username: "admin",
        password: "admin",
        fullName: "Quản Trị Viên",
        role: "admin",
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 60,
        assignedLocations: ["loc-1", "loc-2", "loc-3"],
    },
    {
        id: "teacher-2",
        username: "teacher1",
        password: "teacher1",
        fullName: "Nguyễn Văn Giáo",
        role: "teacher",
        createdAt: Math.floor(Date.now() / 1000) - 86400 * 30,
        assignedLocations: ["loc-1", "loc-2"],
    },
];

// ---- Fake JWT ----

export function generateFakeToken(teacherId: string): string {
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = btoa(
        JSON.stringify({
            sub: teacherId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            jti: uid(),
        }),
    );
    const signature = btoa("mock-signature");
    return `${header}.${payload}.${signature}`;
}

export function getTeacherFromToken(token: string): MockTeacher | undefined {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return teachers.find((t) => t.id === payload.sub);
    } catch {
        return undefined;
    }
}
