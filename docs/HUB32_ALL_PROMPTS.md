# HUB32 — TOÀN BỘ PROMPTS CHO CLAUDE CODE
# Copy từng prompt vào Claude Code theo đúng thứ tự
# Mỗi prompt = 1 session hoặc 1 task trong session
# KHÔNG skip, KHÔNG gộp, KHÔNG đổi thứ tự

================================================================
TRACK A: BACKEND (chạy trên Claude Code instance 1)
================================================================

================================================================
PHASE 0 — SECURITY FIX (Tuần 1)
================================================================

------- PROMPT 0.1: Remove HS256 -------

Read docs/superpowers/specs/2026-03-26-phase0-security-design.md for context.

Item #1: Remove HS256 completely. RS256-only.

Tasks:
1. Remove JwtAlgorithm::HS256 from Constants.hpp enum
2. Remove jwt_algorithm_from_string("HS256") mapping  
3. Remove all HS256 code paths in JwtAuth.cpp and JwtValidator.cpp
4. If config has algorithm=HS256 → fail with error, do not fallback
5. If no RS256 private key found → server MUST refuse to start
6. Update all tests that reference HS256
7. Add test: verify server rejects HS256 token

Build and run tests after EACH sub-task.
Commit: fix(security): remove HS256, enforce RS256-only


------- PROMPT 0.2: Config fail-on-error -------

Item #10: Config validation — fail on error, not warn.

Tasks:
1. In ConfigValidator.cpp: change all "return defaults()" on critical errors to return Result<void>::fail()
2. Critical config fields that MUST exist: httpPort, tlsCertPath (if TLS enabled), jwtPrivateKeyPath
3. In ServerConfig.cpp: if ConfigValidator returns error, log and exit(1)
4. Server MUST refuse to start with invalid/missing critical config
5. Non-critical fields (corsMaxAge, cacheMaxAge) can use defaults with warning
6. Add test: missing required config → server exits with error

Build and test.
Commit: fix(security): config fail-on-error for critical fields


------- PROMPT 0.3: TLS mandatory -------

Item #5: TLS mandatory when enabled.

Tasks:
1. In HttpServer.cpp: if config has tlsEnabled=true but cert or key file missing → refuse to start
2. Add startup check: verify cert file exists AND is readable
3. Add startup check: verify key file exists AND is readable  
4. Log clear error message with file paths that are missing
5. Add test: tlsEnabled=true + missing cert → server exits

Build and test.
Commit: fix(security): refuse start when TLS cert/key missing


------- PROMPT 0.4: Token revocation persistence -------

Item #11: Token revocation must be persistent, not fall back to in-memory.

Tasks:
1. In TokenStore.cpp: if configured SQLite path can't be opened → FAIL, do not silently use in-memory
2. Add periodic purge: every kTokenPurgeIntervalCalls (100) calls to authenticate(), delete expired tokens
3. Add test: corrupt db path → TokenStore construction fails
4. Add test: revoked token persists across TokenStore re-creation (simulate restart)

Build and test.
Commit: fix(security): persistent token revocation, no silent fallback


------- PROMPT 0.5: AuditLog SQLite errors -------

Item #8: AuditLog SQLite error handling.

Tasks:
1. Check EVERY sqlite3_step() and sqlite3_exec() return code in AuditLog.cpp
2. PRAGMA results: check return codes
3. Table creation failure → fail AuditLog construction (not silent continue)
4. Batch inserts: wrap in transaction, ROLLBACK on any failure
5. Log all SQLite errors with sqlite3_errmsg()
6. Add test: simulate insert failure → verify ROLLBACK

Build and test.
Commit: fix(security): check all AuditLog SQLite return codes


------- PROMPT 0.6: Input validation -------

Item #9: Input validation fixes.

Tasks:
1. JSON depth check: check depth BEFORE recursion, not after
2. Create safe_stoi() in validation_utils that checks string length before calling std::stoi
3. Find ALL std::stoi calls across the codebase (should be 5+ files), replace with safe_stoi
4. Add max length validation for all string fields in all controllers
5. Add test: deeply nested JSON → rejected before stack overflow
6. Add test: oversized string → rejected
7. Add test: string that would overflow stoi → rejected safely

Build and test.
Commit: fix(security): safe input validation, prevent overflow


------- PROMPT 0.7: Argon2id -------

Item #4: Add Argon2id password hashing.

Tasks:
1. Add libargon2 via FetchContent in CMakeLists.txt
2. In CryptoUtils: add argon2id_hash(password, salt) and argon2id_verify(password, hash)
3. Parameters: Argon2id, 64MB memory, 3 iterations, 1 parallelism, 32-byte hash
4. New passwords → Argon2id. Existing PBKDF2 hashes → keep PBKDF2 verify for backward compat
5. Password hash format: "$argon2id$..." (standard PHC string format)
6. Detect hash type by prefix: "$argon2id$" → argon2, "$pbkdf2-sha256$" → pbkdf2
7. Add test: hash + verify roundtrip with Argon2id
8. Add test: PBKDF2 hash still verifies (backward compat)

Build and test.
Commit: feat(security): add Argon2id hashing, keep PBKDF2 backward compat


------- PROMPT 0.8: Rate limiter -------

Item #6: Rate limiter per-endpoint + document clock choice.

Tasks:
1. Current mutex-based approach is correct (not a race condition)
2. Add per-endpoint rate limits: auth endpoints get stricter limit (10/min vs 120/min)
3. Add comment documenting that steady_clock is used for intervals, system_clock for headers
4. Add test: verify rate limit triggers at configured threshold
5. Add test: verify per-endpoint limits work independently

Build and test.
Commit: fix(security): add per-endpoint rate limiting


------- PROMPT 0.9: Phase 0 final review -------

Phase 0 Security is complete. Do a final review:

1. Run full test suite: cmake --build --preset debug && ctest --preset debug
2. Search for any remaining: mt19937, HS256 references, hardcoded passwords, unchecked sqlite3_ calls
3. List all security items and their status (DONE / REMAINING)
4. If anything remains, fix it now

Do NOT proceed to Phase 1 until ALL items pass.
Commit: chore(security): phase 0 complete, all security items verified


================================================================
PHASE 1 — DATABASE + SCHOOL MODEL (Tuần 2)
================================================================

------- PROMPT 1.1: SQLite schema -------

Read docs/TODO.md and the deployment plan for schema reference.

Create SQLite databases with WAL mode:

1. src/db/DatabaseManager.cpp: 
   - Open school.db with WAL mode and foreign keys enabled
   - Create all tables if not exist:
     schools, locations, computers, teachers, teacher_locations, active_sessions
   - Use exact schema from deployment plan Section 3
2. Open audit.db: audit_log table
3. tokens.db already handled by TokenStore

Add test: create databases → verify tables exist → verify WAL mode.
Commit: feat(db): create SQLite schema with WAL mode


------- PROMPT 1.2: Repositories -------

Implement Repository pattern. Each repo = CRUD + input validation + error handling.
Follow existing SchoolRepository.hpp/cpp pattern if it exists, otherwise create.

1. SchoolRepository: createSchool, getSchool, getAllSchools, updateSchool, deleteSchool
2. LocationRepository: create, get, getAll, getBySchool, update, delete
3. ComputerRepository: create, get, getAll, getByLocation, updateState, updateHeartbeat
4. TeacherRepository: create, get, getAll, getByUsername, update, delete, verifyPassword
5. TeacherLocationRepository: assign, unassign, getLocationsByTeacher, getTeachersByLocation

All queries MUST use prepared statements.
All return Result<T>, no exceptions.
All check sqlite3 return codes.

Build and test after EACH repository.
Commit: feat(db): implement all repositories with prepared statements


------- PROMPT 1.3: Wire to controllers -------

Replace mock data in controllers with real database queries.

1. SchoolController → SchoolRepository
2. LocationController → LocationRepository  
3. TeacherController → TeacherRepository + TeacherLocationRepository
4. ComputerController → ComputerRepository
5. Replace Hub32CoreWrapper mock with ComputerRepository for computer listing

Role-based access:
- Admin: sees all rooms, all CRUD
- Teacher: sees only assigned rooms (check teacher_locations table)
- Readonly: sees assigned rooms, no mutations

Build and test.
Commit: feat(api): wire controllers to SQLite repositories


================================================================
PHASE 2 — AGENT COMMUNICATION (Tuần 3)
================================================================

------- PROMPT 2.1: Agent registration -------

Implement agent registration and heartbeat system.

1. POST /api/v1/agents/register:
   - Agent sends: hostname, macAddress, agentVersion
   - Server creates computer record if new (by MAC), or updates if existing
   - Returns: computerId, assigned locationId (if pre-configured), commandPollInterval
   - Auth: agent registration key (shared secret, checked against config)

2. POST /api/v1/agents/heartbeat:
   - Agent sends: computerId, state, current user login (if any)
   - Server updates last_heartbeat, state in ComputerRepository
   - Returns: pending commands (if any), latest agent version (for auto-update check)

3. HeartbeatMonitor: background thread checks last_heartbeat
   - If now - last_heartbeat > kDefaultHeartbeatTimeoutMs → set state = Offline

Build and test.
Integration test: register → heartbeat → verify online → stop heartbeat → verify offline.
Commit: feat(agent): registration and heartbeat system


------- PROMPT 2.2: Command system -------

Implement command dispatch: server queues commands, agent polls and executes.

1. GET /api/v1/agents/:id/commands:
   - Agent polls for pending commands
   - Returns list of commands: { id, featureUid, action, arguments }
   - Mark commands as "dispatched"

2. POST /api/v1/agents/:id/commands/:cmdId/result:
   - Agent reports execution result: { success, errorMessage }
   - Server updates command status, logs to audit

3. Teacher sends feature command:
   - POST /api/v1/computers/:id/features/:uid → creates command in queue
   - Agent picks up on next poll

Integration test: teacher sends lock → command queued → agent polls → agent reports success.
Build and test.
Commit: feat(agent): command queue and dispatch system


================================================================
TRACK B: FRONTEND (chạy trên Claude Code instance 2, SONG SONG với Track A)
================================================================

================================================================
FE STEP 1: Project setup
================================================================

------- PROMPT FE-1: Initialize project -------

Create a new React + TypeScript project for HUB32 Teacher Dashboard.

Read docs/fe-spec.md Section 1 for setup instructions.
Read docs/fe-spec-supplement.md for utils, styles, i18n specs.

Execute:
1. npm create vite@latest hub32-dashboard -- --template react-ts
2. cd hub32-dashboard && npm install
3. npx shadcn@latest init (New York style, Zinc base, CSS variables yes)
4. npm install @tanstack/react-query axios react-router-dom zustand
5. npm install i18next react-i18next i18next-browser-languagedetector
6. npm install clsx tailwind-merge @tanstack/react-table sonner
7. npm install lucide-react date-fns
8. npm install -D msw

Create folder structure exactly as spec Section 1.2.
Create .env with VITE_API_URL=http://localhost:11081 and VITE_MOCK_API=true
Create .env.production with VITE_API_URL=https://hub32.school.example.com

Verify: npm run dev → blank page loads without errors.
Commit: chore(fe): initialize project with Vite + React + shadcn


================================================================
FE STEP 2: API types + client
================================================================

------- PROMPT FE-2: API layer -------

Create the API layer. Read docs/fe-spec.md Section 2 and Section 3.

1. Create src/api/types.ts — copy ALL types from spec Section 2 EXACTLY. Do not change any field name.
2. Create src/api/client.ts — Axios instance with JWT interceptor (spec Section 3)
3. Create API modules:
   - src/api/auth.api.ts: login(), logout(), getMe()
   - src/api/computers.api.ts: getComputers(), getComputer(), getComputerSessions()
   - src/api/schools.api.ts: CRUD schools
   - src/api/locations.api.ts: CRUD locations, getComputersByLocation()
   - src/api/teachers.api.ts: CRUD teachers, assignLocation(), removeLocation()
   - src/api/features.api.ts: getFeatures(), controlFeature(), batchFeature()
   - src/api/stream.api.ts: createTransport(), connectTransport(), produce(), consume(), getIceServers()

Each API function must have proper TypeScript types for params and return values.
Verify: npx tsc --noEmit → no type errors.
Commit: feat(fe): API types and client layer


================================================================
FE STEP 2.5: i18n + Utils + Styles
================================================================

------- PROMPT FE-2.5: Foundation layer -------

Read docs/fe-spec-supplement.md Sections 14, 15, 16, 17.

1. i18n setup:
   - Create src/i18n/index.ts (config from spec Section 14.3)
   - Create src/i18n/locales/vi.json (FULL content from spec Section 14.4)
   - Create src/i18n/locales/en.json (FULL content from spec)
   - Create src/i18n/locales/zh.json (FULL content from spec)
   - Import i18n in main.tsx: import "./i18n"

2. Utils:
   - Create src/lib/cn.ts (clsx + tailwind-merge)
   - Create src/lib/formatters.ts (all functions from spec Section 15.3)
   - Create src/lib/validators.ts (all functions from spec Section 15.4)
   - Create src/lib/keyboard.ts (useKeyboardShortcut hook + SHORTCUTS)
   - Create src/lib/clipboard.ts (copyToClipboard)
   - Create src/lib/constants.ts (all FE constants from spec Section 15.7)

3. Styles:
   - Replace src/index.css with FULL design system from spec Section 16.1
   - Verify fonts load (IBM Plex Sans + JetBrains Mono)

4. Shared components:
   - Create src/components/shared/ErrorBoundary.tsx
   - Create src/components/shared/Skeleton.tsx (shimmer animation)
   - Create src/components/shared/StatusDot.tsx (animated dots per ComputerState)
   - Create src/components/shared/LanguageSwitcher.tsx (vi/en/zh dropdown)
   - Create src/components/shared/SearchInput.tsx (debounced)
   - Create src/components/shared/ToastProvider.tsx (sonner wrapper)

Verify: npm run dev → fonts load, dark theme, no errors.
Verify: language switcher works (switch vi↔en↔zh).
Commit: feat(fe): i18n (vi/en/zh), utils, design system, shared components


================================================================
FE STEP 3: Mock API
================================================================

------- PROMPT FE-3: MSW mock server -------

Read docs/fe-spec.md Section 5.

Setup MSW (Mock Service Worker) for development without backend.

1. npx msw init public/
2. Create src/mocks/handlers.ts:
   - Mock ALL endpoints from spec Section 4
   - Generate mock data:
     * 3 locations: "Phòng Máy 1" (id: loc-1, 30 PCs), "Phòng Máy 2" (id: loc-2, 25 PCs), "Lab Tin Học" (id: loc-3, 20 PCs)
     * 30+25+20 = 75 computers with random states (60% online, 20% offline, 10% connected, 10% other)
     * 2 teacher accounts: admin/admin (role: admin), teacher1/teacher1 (role: teacher, assigned loc-1 and loc-2 only)
     * 1 school: "Trường THPT Hub32"
   - Login mock: check username/password, return fake JWT
   - Computer list: filter by locationId
   - Features: toggle state in memory
3. Create src/mocks/browser.ts: setup worker
4. Create src/mocks/data.ts: centralized mock data generators
5. In main.tsx: if VITE_MOCK_API=true, start MSW before React render

Verify: npm run dev → login with admin/admin → see mock data in network tab.
Commit: feat(fe): MSW mock API with realistic data


================================================================
FE STEP 4: Auth + Login
================================================================

------- PROMPT FE-4: Authentication -------

Read docs/fe-spec.md Section 6.1.

1. Create src/stores/auth.store.ts (Zustand):
   - State: token, user (sub, role), isAuthenticated
   - Actions: login(token), logout(), initialize() (check localStorage on mount)
   - Decode JWT payload from base64 (no library needed, use atob)

2. Create src/components/auth/LoginForm.tsx:
   - Username + Password fields (shadcn Input + Label)
   - Login button with loading state
   - Error message display
   - ALL text via t() function — no hardcoded strings
   - Call auth.api.login() → store token → redirect

3. Create src/pages/LoginPage.tsx:
   - Centered layout, HUB32 logo, LoginForm
   - If already authenticated → redirect to /dashboard

4. Create ProtectedRoute component:
   - Check auth store → redirect /login if not authenticated
   - Check token expiry

5. Setup React Router in App.tsx:
   - /login → LoginPage
   - /dashboard → ProtectedRoute → DashboardPage (placeholder)
   - /admin → ProtectedRoute (admin only) → AdminPage (placeholder)
   - * → NotFoundPage

Verify: login admin/admin → redirect dashboard. Refresh → stays logged in. Logout → redirect login.
Commit: feat(fe): auth flow with JWT, login page, protected routes


================================================================
FE STEP 5: Layout + Sidebar
================================================================

------- PROMPT FE-5: App layout -------

Read docs/fe-spec.md Section 6.2 (sidebar and header parts).

1. Create src/stores/room.store.ts (Zustand):
   - State: locations[], selectedLocationId, computers[], selectedComputerIds
   - Actions: selectLocation, toggleComputer, selectAll, deselectAll
   - Fetch locations on init (different for admin vs teacher)

2. Create src/components/layout/AppLayout.tsx:
   - shadcn Sidebar + main content area
   - Sidebar on left, header on top, main content fills rest

3. Create src/components/layout/AppSidebar.tsx:
   - Room list fetched from API
   - Admin: show ALL locations
   - Teacher: show only assigned locations
   - Each room shows: name, badge with "X/Y online" count
   - Click room → selectLocation → reload computers
   - Active room highlighted

4. Create src/components/layout/Header.tsx:
   - Left: current room name
   - Right: LanguageSwitcher, user avatar + name + role badge, logout button
   - All text via t()

5. Update DashboardPage.tsx to use AppLayout with placeholder grid

Verify: sidebar shows 3 mock rooms, clicking switches selection, header shows user info.
Commit: feat(fe): app layout with sidebar room selector


================================================================
FE STEP 6: Computer Grid
================================================================

------- PROMPT FE-6: Grid view -------

Read docs/fe-spec.md Section 6.2 (grid parts) and docs/fe-spec-supplement.md Section 16 (styles).

1. Create src/components/grid/StatusBadge.tsx:
   - StatusDot + text label
   - Color per state: online=green, offline=gray, connected=cyan, locked=red, connecting=amber pulse
   - Text via t("computer.state.online") etc.

2. Create src/components/grid/ComputerCard.tsx:
   - 16:9 aspect ratio card (class: computer-card from CSS)
   - Thumbnail area: placeholder icon (Monitor from lucide-react) — real video later
   - Bottom bar: computer name (mono font), StatusBadge
   - User login name if session active
   - Checkbox for multi-select (top-right corner)
   - Click → open ComputerDetail
   - Checkbox click → toggleComputer in room store (stop propagation)
   - Dim card if offline (computer-card--offline)
   - Blue glow border if selected (computer-card--selected)

3. Create src/components/grid/ComputerGrid.tsx:
   - Responsive CSS grid: 2 cols sm, 3 md, 4 lg, 6 xl
   - Uses room.store computers array
   - Empty state if no computers: t("grid.noComputers")
   - Auto-refresh every 5s (COMPUTER_POLL_MS)
   - Skeleton loading on first load

4. Update DashboardPage.tsx: add ComputerGrid inside AppLayout main area

Verify: select room → grid shows computers → click card shows alert (placeholder) → multi-select works.
Commit: feat(fe): responsive computer grid with status and multi-select


================================================================
FE STEP 7: Feature Toolbar
================================================================

------- PROMPT FE-7: Feature controls -------

Read docs/fe-spec.md Section 6.4.

1. Create src/components/features/FeatureToolbar.tsx:
   - Sticky bottom bar, visible only when selectedComputerIds.size > 0
   - Shows: "X máy đã chọn" (t("grid.selected", { count }))
   - Buttons: Lock, Unlock, Message, Power, Input Lock
   - Select All / Deselect All buttons
   - Icons from lucide-react: Lock, Unlock, MessageSquare, Power, Mouse

2. Create src/components/features/LockDialog.tsx:
   - Confirm dialog: t("feature.lock.confirmLock", { count })
   - On confirm: call features.api.controlFeature for each selected computer
   - Show toast on success/failure

3. Create src/components/features/MessageDialog.tsx:
   - Textarea for message text
   - Send button
   - On confirm: call feature with arguments: { text: message }
   - Show toast

4. Create src/components/features/PowerDialog.tsx:
   - Radio buttons: Shutdown / Reboot / Logoff
   - DANGEROUS confirmation: red warning text
   - On confirm: call feature with arguments: { action: "shutdown" }

5. Create src/hooks/useFeatureControl.ts:
   - Wraps feature API calls
   - Handles batch mode (multiple computers)
   - Shows loading toast during execution
   - Shows success/error toast after

ALL dialog text via t(). ALL confirmations require explicit click.

Verify: select 5 PCs → toolbar appears → lock dialog → confirm → toast "Đã khóa 5 máy".
Commit: feat(fe): feature toolbar with lock, message, power dialogs


================================================================
FE STEP 8: Computer Detail
================================================================

------- PROMPT FE-8: Fullscreen detail view -------

Read docs/fe-spec.md Section 6.3.

1. Create src/components/grid/ComputerDetail.tsx:
   - Fullscreen overlay (z-index: --z-overlay)
   - Close on ESC key (useKeyboardShortcut) and X button
   - Left: large video area (placeholder for now, 16:9 black box)
   - Right sidebar: 
     * Computer name + hostname (mono font)
     * StatusBadge
     * Session info: user login, uptime (formatUptime), client address
     * Screen resolution
     * Agent version
   - Bottom: feature control buttons for THIS single computer
   - Animate in: slide-up

2. Update ComputerCard: onClick → open ComputerDetail

Verify: click card → overlay opens → ESC closes → info displays correctly.
Commit: feat(fe): computer detail overlay with session info


================================================================
FE STEP 9: Admin Panel
================================================================

------- PROMPT FE-9: Admin CRUD -------

Read docs/fe-spec.md Section 6.5.

1. Create src/components/admin/DataTable.tsx (if not already from shared):
   - @tanstack/react-table integration
   - Sortable columns (click header to sort)
   - Pagination controls
   - Search filter (debounced SearchInput)
   - Row actions dropdown: Edit, Delete

2. Create src/components/admin/SchoolManager.tsx:
   - DataTable with columns: name, address, createdAt
   - Add School dialog (form: name, address)
   - Edit School dialog (pre-filled form)
   - Delete confirmation

3. Create src/components/admin/LocationManager.tsx:
   - DataTable with columns: name, building, floor, capacity, type, school
   - Filter by school dropdown
   - Add/Edit/Delete dialogs

4. Create src/components/admin/TeacherManager.tsx:
   - DataTable with columns: username, fullName, role, createdAt
   - Add Teacher dialog (username, password, fullName, role dropdown)
   - Edit Teacher dialog
   - Assign Rooms: click teacher → show assigned locations → add/remove checkboxes

5. Create src/components/admin/AuditLog.tsx:
   - Read-only DataTable
   - Columns: timestamp, teacher, action, target, details, IP
   - Filters: date range, action type, teacher

6. Create src/pages/AdminPage.tsx:
   - Tab navigation: Schools | Locations | Teachers | Audit
   - If role !== "admin" → redirect /dashboard with toast

ALL labels and messages via t("admin.*").

Verify: navigate /admin → CRUD operations work with mock data → tab switching works.
Commit: feat(fe): admin panel with CRUD for schools, locations, teachers


================================================================
FE STEP 10: WebRTC integration (requires backend)
================================================================

------- PROMPT FE-10: mediasoup-client -------

Read docs/fe-spec.md Section 7.

This step requires the REAL backend with mediasoup SFU running.
Skip if backend Phase 3-5 not complete yet.

1. npm install mediasoup-client

2. Create src/stores/stream.store.ts:
   - Device, recvTransport, consumers Map
   - initDevice(), createRecvTransport(), consume(), cleanup()

3. Create src/lib/mediasoup.ts:
   - Wrapper around mediasoup-client Device
   - Follow flow from spec Section 7.1 exactly

4. Create src/hooks/useMediasoup.ts:
   - Hook that manages WebRTC lifecycle for current room
   - On room change: cleanup old consumers → create new transport → consume all producers

5. Update ComputerCard: replace placeholder with <video> element bound to consumer track
6. Update ComputerDetail: switch to high simulcast layer on open, back to low on close

7. Connection state handling:
   - transport.on("connectionstatechange") → update UI
   - Reconnect on disconnect (3s delay)
   - Show stream status via t("stream.*")

Verify: (with real backend) login → select room → see live screen thumbnails → click → fullscreen stream.
Commit: feat(fe): WebRTC integration with mediasoup-client


================================================================
CHEATSHEET — TÓM TẮT THỨ TỰ
================================================================

TRACK A (Backend):
  0.1 Remove HS256
  0.2 Config fail-on-error
  0.3 TLS mandatory
  0.4 Token revocation persistence
  0.5 AuditLog SQLite errors
  0.6 Input validation
  0.7 Argon2id
  0.8 Rate limiter per-endpoint
  0.9 Phase 0 final review
  1.1 SQLite schema
  1.2 Repositories
  1.3 Wire to controllers
  2.1 Agent registration + heartbeat
  2.2 Command system

TRACK B (Frontend — SONG SONG):
  FE-1  Project setup
  FE-2  API types + client
  FE-2.5 i18n + Utils + Styles
  FE-3  Mock API (MSW)
  FE-4  Auth + Login
  FE-5  Layout + Sidebar
  FE-6  Computer Grid
  FE-7  Feature Toolbar
  FE-8  Computer Detail
  FE-9  Admin Panel
  FE-10 WebRTC (needs backend)

TRACK C (Agent — sau Phase 2 backend):
  Xem HUB32_AGENT_SPEC.md, 10 steps riêng
