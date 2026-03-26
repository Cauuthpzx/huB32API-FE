import { http, HttpResponse, delay } from "msw";
import {
    computers,
    generateFakeToken,
    getFeaturesForComputer,
    getTeacherFromToken,
    locations,
    mockSession,
    mockUser,
    schools,
    setFeatureActive,
    teachers,
} from "./data";
import type { TeacherResponse } from "@/api/types";
import type {
    AuthRequest,
    BatchFeatureRequest,
    CreateLocationRequest,
    CreateSchoolRequest,
    CreateTeacherRequest,
    FeatureControlRequest,
} from "@/api/types";

const API = ""; // handlers use relative paths — MSW intercepts on same origin

// ---- Auth guard helper ----

function requireAuth(request: Request) {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    return getTeacherFromToken(auth.slice(7));
}

function safeTeacher(t: { id: string; username: string; fullName: string; role: string; createdAt: number }): TeacherResponse {
    return { id: t.id, username: t.username, fullName: t.fullName, role: t.role, createdAt: t.createdAt };
}

function unauthorized() {
    return HttpResponse.json(
        { status: 401, type: "/errors/401", title: "Unauthorized", detail: "Invalid or missing token", instance: "" },
        { status: 401 },
    );
}

export const handlers = [
    // ================================================================
    // AUTH
    // ================================================================

    http.post(`${API}/api/v1/auth`, async ({ request }) => {
        await delay(200);
        const body = (await request.json()) as AuthRequest;
        const teacher = teachers.find(
            (t) => t.username === body.username && t.password === body.password,
        );
        if (!teacher) {
            return HttpResponse.json(
                { status: 401, type: "/errors/401", title: "Unauthorized", detail: "Invalid username or password", instance: "/api/v1/auth" },
                { status: 401 },
            );
        }
        return HttpResponse.json({
            token: generateFakeToken(teacher.id),
            tokenType: "Bearer",
            expiresIn: 3600,
        });
    }),

    http.delete(`${API}/api/v1/auth`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json(null, { status: 204 });
    }),

    http.get(`${API}/api/v1/auth/me`, async ({ request }) => {
        await delay(100);
        const teacher = requireAuth(request);
        if (!teacher) return unauthorized();
        return HttpResponse.json(safeTeacher(teacher));
    }),

    // ================================================================
    // COMPUTERS
    // ================================================================

    http.get(`${API}/api/v1/computers`, async ({ request }) => {
        await delay(150);
        if (!requireAuth(request)) return unauthorized();
        const url = new URL(request.url);
        const locationId = url.searchParams.get("location");
        const stateFilter = url.searchParams.get("state");
        const limit = parseInt(url.searchParams.get("limit") ?? "200", 10);

        let filtered = computers;
        if (locationId) filtered = filtered.filter((c) => c.location === locationId);
        if (stateFilter) filtered = filtered.filter((c) => c.state === stateFilter);
        const page = filtered.slice(0, limit);

        return HttpResponse.json({
            computers: page,
            page: { total: filtered.length, limit, nextCursor: null },
        });
    }),

    http.get(`${API}/api/v1/computers/:id`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const pc = computers.find((c) => c.id === params.id);
        if (!pc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        return HttpResponse.json(pc);
    }),

    http.get(`${API}/api/v1/computers/:id/info`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const pc = computers.find((c) => c.id === params.id);
        if (!pc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        return HttpResponse.json({
            computer: pc,
            user: mockUser(pc),
            session: mockSession(pc),
            screens: [{ x: 0, y: 0, width: 1920, height: 1080 }],
        });
    }),

    http.get(`${API}/api/v1/computers/:id/session`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const pc = computers.find((c) => c.id === params.id);
        if (!pc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        const session = mockSession(pc);
        if (!session) return HttpResponse.json({ status: 404, title: "No active session" }, { status: 404 });
        return HttpResponse.json(session);
    }),

    http.get(`${API}/api/v2/computers/:id/state`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const pc = computers.find((c) => c.id === params.id);
        if (!pc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        const isOnline = pc.state !== "offline";
        const latency = isOnline ? Math.floor(Math.random() * 20) + 1 : 0;
        return HttpResponse.json({
            id: pc.id,
            hostname: pc.hostname,
            state: pc.state,
            reachable: isOnline,
            latencyMs: latency,
            pingLatencyMs: latency,
        });
    }),

    // ================================================================
    // FEATURES
    // ================================================================

    http.get(`${API}/api/v1/computers/:id/features`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const id = params.id as string;
        return HttpResponse.json({ features: getFeaturesForComputer(id) });
    }),

    http.get(`${API}/api/v1/computers/:id/features/:fid`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const features = getFeaturesForComputer(params.id as string);
        const f = features.find((ft) => ft.uid === params.fid);
        if (!f) return HttpResponse.json({ status: 404, title: "Feature not found" }, { status: 404 });
        return HttpResponse.json(f);
    }),

    http.put(`${API}/api/v1/computers/:id/features/:fid`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as FeatureControlRequest;
        setFeatureActive(params.id as string, params.fid as string, body.active);
        return HttpResponse.json({ success: true });
    }),

    http.post(`${API}/api/v2/batch/features`, async ({ request }) => {
        await delay(300);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as BatchFeatureRequest;
        const results = body.computerIds.map((cid) => {
            const pc = computers.find((c) => c.id === cid);
            if (!pc || pc.state === "offline") {
                return { computerId: cid, success: false, error: "Computer offline" };
            }
            setFeatureActive(cid, body.featureUid, body.operation === "start");
            return { computerId: cid, success: true, error: "" };
        });
        const succeeded = results.filter((r) => r.success).length;
        return HttpResponse.json({
            total: results.length,
            succeeded,
            failed: results.length - succeeded,
            results,
        });
    }),

    // ================================================================
    // SCHOOLS
    // ================================================================

    http.get(`${API}/api/v1/schools`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json(schools);
    }),

    http.get(`${API}/api/v1/schools/:id`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const school = schools.find((s) => s.id === params.id);
        if (!school) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        return HttpResponse.json(school);
    }),

    http.post(`${API}/api/v1/schools`, async ({ request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as CreateSchoolRequest;
        const school = {
            id: `school-${schools.length + 1}`,
            name: body.name,
            address: body.address,
            createdAt: Math.floor(Date.now() / 1000),
        };
        schools.push(school);
        return HttpResponse.json(school, { status: 201 });
    }),

    http.put(`${API}/api/v1/schools/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as CreateSchoolRequest;
        const school = schools.find((s) => s.id === params.id);
        if (!school) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        school.name = body.name;
        school.address = body.address;
        return HttpResponse.json(school);
    }),

    http.delete(`${API}/api/v1/schools/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const idx = schools.findIndex((s) => s.id === params.id);
        if (idx === -1) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        schools.splice(idx, 1);
        return HttpResponse.json(null, { status: 204 });
    }),

    // ================================================================
    // LOCATIONS
    // ================================================================

    http.get(`${API}/api/v1/locations`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const url = new URL(request.url);
        const schoolId = url.searchParams.get("school_id");
        const filtered = schoolId
            ? locations.filter((l) => l.schoolId === schoolId)
            : locations;
        return HttpResponse.json(filtered);
    }),

    http.post(`${API}/api/v1/locations`, async ({ request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as CreateLocationRequest & { schoolId: string };
        const loc = {
            id: `loc-${locations.length + 1}`,
            schoolId: body.schoolId,
            name: body.name,
            building: body.building,
            floor: body.floor,
            capacity: body.capacity,
            type: body.type,
        };
        locations.push(loc);
        return HttpResponse.json(loc, { status: 201 });
    }),

    http.get(`${API}/api/v1/locations/:id`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const loc = locations.find((l) => l.id === params.id);
        if (!loc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        return HttpResponse.json(loc);
    }),

    http.put(`${API}/api/v1/locations/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as Partial<CreateLocationRequest>;
        const loc = locations.find((l) => l.id === params.id);
        if (!loc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        if (body.name !== undefined) loc.name = body.name;
        if (body.building !== undefined) loc.building = body.building;
        if (body.floor !== undefined) loc.floor = body.floor;
        if (body.capacity !== undefined) loc.capacity = body.capacity;
        if (body.type !== undefined) loc.type = body.type;
        return HttpResponse.json(loc);
    }),

    http.delete(`${API}/api/v1/locations/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const idx = locations.findIndex((l) => l.id === params.id);
        if (idx === -1) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        locations.splice(idx, 1);
        return HttpResponse.json(null, { status: 204 });
    }),

    http.get(`${API}/api/v1/locations/:id/computers`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json(
            computers.filter((c) => c.location === params.id),
        );
    }),

    // v2 locations
    http.get(`${API}/api/v2/locations`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const locs = locations.map((l) => {
            const pcs = computers.filter((c) => c.location === l.id);
            return {
                id: l.id,
                name: l.name,
                computerCount: pcs.length,
                computerIds: pcs.map((c) => c.id),
            };
        });
        return HttpResponse.json({ locations: locs, total: locs.length });
    }),

    http.get(`${API}/api/v2/locations/:id`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const loc = locations.find((l) => l.id === params.id);
        if (!loc) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        const pcs = computers.filter((c) => c.location === loc.id);
        return HttpResponse.json({
            id: loc.id,
            name: loc.name,
            computerCount: pcs.length,
            computerIds: pcs.map((c) => c.id),
        });
    }),

    // ================================================================
    // TEACHERS
    // ================================================================

    http.get(`${API}/api/v1/teachers`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json(teachers.map(safeTeacher));
    }),

    http.get(`${API}/api/v1/teachers/:id`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const t = teachers.find((t) => t.id === params.id);
        if (!t) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        return HttpResponse.json(safeTeacher(t));
    }),

    http.post(`${API}/api/v1/teachers`, async ({ request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as CreateTeacherRequest;
        const t = {
            id: `teacher-${teachers.length + 1}`,
            username: body.username,
            password: body.password,
            fullName: body.fullName,
            role: body.role,
            createdAt: Math.floor(Date.now() / 1000),
            assignedLocations: [] as string[],
        };
        teachers.push(t);
        return HttpResponse.json(safeTeacher(t), { status: 201 });
    }),

    http.put(`${API}/api/v1/teachers/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as Partial<CreateTeacherRequest>;
        const t = teachers.find((t) => t.id === params.id);
        if (!t) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        if (body.fullName !== undefined) t.fullName = body.fullName;
        if (body.role !== undefined) t.role = body.role;
        if (body.password !== undefined) t.password = body.password;
        return HttpResponse.json(safeTeacher(t));
    }),

    http.delete(`${API}/api/v1/teachers/:id`, async ({ params, request }) => {
        await delay(200);
        if (!requireAuth(request)) return unauthorized();
        const idx = teachers.findIndex((t) => t.id === params.id);
        if (idx === -1) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        teachers.splice(idx, 1);
        return HttpResponse.json(null, { status: 204 });
    }),

    http.post(`${API}/api/v1/teachers/:id/locations`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const body = (await request.json()) as { locationId: string };
        const t = teachers.find((t) => t.id === params.id);
        if (!t) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        if (!t.assignedLocations.includes(body.locationId)) {
            t.assignedLocations.push(body.locationId);
        }
        return HttpResponse.json({ success: true });
    }),

    http.delete(`${API}/api/v1/teachers/:id/locations/:locationId`, async ({ params, request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        const t = teachers.find((t) => t.id === params.id);
        if (!t) return HttpResponse.json({ status: 404, title: "Not found" }, { status: 404 });
        t.assignedLocations = t.assignedLocations.filter(
            (l) => l !== params.locationId,
        );
        return HttpResponse.json(null, { status: 204 });
    }),

    // ================================================================
    // STREAM (stub responses for WebRTC — not fully functional in mock)
    // ================================================================

    http.post(`${API}/api/v1/stream/transport`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json({
            id: crypto.randomUUID(),
            iceParameters: { usernameFragment: "mock", password: "mock" },
            iceCandidates: [],
            dtlsParameters: { fingerprints: [] },
        });
    }),

    http.post(`${API}/api/v1/stream/transport/:id/connect`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json({ success: true });
    }),

    http.post(`${API}/api/v1/stream/produce`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json({ id: crypto.randomUUID() });
    }),

    http.post(`${API}/api/v1/stream/consume`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json({
            id: crypto.randomUUID(),
            producerId: crypto.randomUUID(),
            kind: "video",
            rtpParameters: {},
        });
    }),

    http.delete(`${API}/api/v1/stream/transport/:id`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json(null, { status: 204 });
    }),

    http.get(`${API}/api/v1/stream/ice-servers`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json([
            { urls: ["stun:stun.l.google.com:19302"], username: "", credential: "" },
        ]);
    }),

    http.get(`${API}/api/v1/stream/capabilities/:locationId`, async ({ request }) => {
        await delay(100);
        if (!requireAuth(request)) return unauthorized();
        return HttpResponse.json({ codecs: [], headerExtensions: [] });
    }),

    // ================================================================
    // HEALTH
    // ================================================================

    http.get(`${API}/api/v2/health`, async () => {
        return HttpResponse.json({ status: "ok" });
    }),

    http.get(`${API}/health`, async () => {
        return HttpResponse.json({ status: "ok" });
    }),

    // ================================================================
    // CATCH-ALL — prevent passthrough to non-existent server
    // ================================================================
    http.all("*", () => {
        return new HttpResponse(null, { status: 200 });
    }),
];
