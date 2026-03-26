import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { useRoomStore } from "@/stores/room.store";
import { Badge } from "@/components/ui/badge";
import {
    ChevronRight,
    Languages,
    LogOut,
    Monitor,
    Moon,
    PanelLeft,
    PanelLeftClose,
    Settings,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_CYCLE = ["vi", "en", "zh"] as const;
const LANG_LABELS: Record<string, string> = { vi: "Tiếng Việt", en: "English", zh: "中文" };

export function AppSidebar() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const selectLocation = useRoomStore((s) => s.selectLocation);
    const computers = useRoomStore((s) => s.computers);
    const sidebarPinned = useRoomStore((s) => s.sidebarPinned);
    const togglePin = useRoomStore((s) => s.togglePin);

    const [hoverOpen, setHoverOpen] = useState(false);
    const isVisible = sidebarPinned || hoverOpen;

    const handleSelectRoom = useCallback(
        async (id: string) => {
            await selectLocation(id);
            if (!sidebarPinned && window.innerWidth < 768) {
                setHoverOpen(false);
            }
        },
        [selectLocation, sidebarPinned],
    );

    const onlineCount = (locationId: string) => {
        if (locationId !== selectedLocationId) return null;
        const online = computers.filter((c) => c.state !== "offline").length;
        return `${online}/${computers.length}`;
    };

    return (
        <>
            {/* Hover trigger zone — only when not pinned and not visible */}
            {!isVisible && (
                <div
                    className="fixed left-0 top-0 z-[var(--z-overlay)] h-full w-10"
                    onMouseEnter={() => setHoverOpen(true)}
                />
            )}

            {/* Arrow toggle — only when not pinned */}
            {!sidebarPinned && (
                <button
                    onClick={() => setHoverOpen((o) => !o)}
                    className={cn(
                        "fixed top-1/2 z-[var(--z-overlay)] -translate-y-1/2",
                        "flex h-20 w-5 items-center justify-center",
                        "rounded-r-md border border-l-0",
                        "bg-[#141416] border-[#2A2A2E]",
                        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                        "transition-all duration-200",
                        isVisible ? "left-[220px]" : "left-0",
                    )}
                >
                    <ChevronRight
                        className={cn(
                            "size-4 transition-transform duration-200",
                            isVisible && "rotate-180",
                        )}
                    />
                </button>
            )}

            {/* Backdrop — only for hover mode */}
            {hoverOpen && !sidebarPinned && (
                <div
                    className="fixed inset-0 z-[calc(var(--z-overlay)-1)]"
                    onClick={() => setHoverOpen(false)}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-full w-[220px]",
                    sidebarPinned ? "z-[var(--z-sticky)]" : "z-[var(--z-overlay)]",
                    "bg-[var(--bg-secondary)] border-r border-[var(--border-default)]",
                    "flex flex-col",
                    "transition-transform duration-200 ease-out",
                    isVisible ? "translate-x-0" : "-translate-x-[220px]",
                )}
                onMouseLeave={() => {
                    if (!sidebarPinned) setHoverOpen(false);
                }}
            >
                {/* ---- TOP: Logo + Pin (48px, aligns with header) ---- */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1C1C1F] px-4">
                    <span className="font-mono text-sm font-bold text-blue-500">
                        HUB32
                    </span>
                    <button
                        onClick={togglePin}
                        title={sidebarPinned ? t("sidebar.unpin") : t("sidebar.pin")}
                        className={cn(
                            "flex size-7 items-center justify-center rounded-md transition-colors",
                            sidebarPinned
                                ? "bg-blue-500/15 text-blue-500"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800",
                        )}
                    >
                        {sidebarPinned ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
                    </button>
                </div>

                {/* ---- MIDDLE: spacer + rooms (flex:1, scrollable) ---- */}
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {/* Spacer pushes rooms down */}
                    <div className="flex-1" />

                    {/* Room list */}
                    <div className="px-2 pb-2">
                        <p className="px-2 py-1 text-xs font-medium uppercase text-[var(--text-tertiary)]">
                            {t("sidebar.rooms")}
                        </p>
                        {locations.length === 0 ? (
                            <p className="px-2 py-4 text-sm text-[var(--text-disabled)]">
                                {t("sidebar.noRooms")}
                            </p>
                        ) : (
                            locations.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelectRoom(loc.id)}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                                        "transition-colors duration-100",
                                        loc.id === selectedLocationId
                                            ? "bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                                    )}
                                >
                                    <Monitor className="size-4 shrink-0" />
                                    <span className="min-w-0 flex-1 truncate">{loc.name}</span>
                                    {onlineCount(loc.id) && (
                                        <Badge variant="secondary" className="text-xs">
                                            {onlineCount(loc.id)}
                                        </Badge>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Small spacer below rooms */}
                    <div className="h-4 shrink-0" />
                </div>

                {/* ---- BOTTOM: Account + 3 action columns ---- */}
                <div className="shrink-0">
                    {/* Row 1: Account */}
                    <div className="flex items-center gap-2.5 border-t border-zinc-800 px-3 py-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                            {(user?.sub ?? "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                {user?.sub}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                                {t("header.role." + (user?.role ?? "teacher"))}
                            </p>
                        </div>
                        <button
                            onClick={() => setHoverOpen(false)}
                            className="flex size-7 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        >
                            <Settings size={14} />
                        </button>
                        <button
                            onClick={logout}
                            className="flex size-7 items-center justify-center rounded-md border border-red-900/50 text-red-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>

                    {/* Row 2: Quick actions */}
                    <div
                        className="grid border-t border-zinc-800"
                        style={{ gridTemplateColumns: user?.role === "admin" ? "1fr 1fr 1fr" : "1fr 1fr" }}
                    >
                        <button
                            onClick={() => {
                                const idx = LANG_CYCLE.indexOf(i18n.language as typeof LANG_CYCLE[number]);
                                const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
                                i18n.changeLanguage(next);
                            }}
                            className="flex flex-col items-center gap-1 py-2.5 text-zinc-500 hover:text-zinc-300 transition-colors border-r border-zinc-800"
                        >
                            <Languages size={16} />
                            <span className="text-[10px]">
                                {LANG_LABELS[i18n.language] ?? t("header.language")}
                            </span>
                        </button>

                        <button
                            className={cn(
                                "flex flex-col items-center gap-1 py-2.5 text-zinc-500 hover:text-zinc-300 transition-colors",
                                user?.role === "admin" && "border-r border-zinc-800",
                            )}
                        >
                            <Moon size={16} />
                            <span className="text-[10px]">{t("header.settings")}</span>
                        </button>

                        {user?.role === "admin" && (
                            <button
                                onClick={() => { setHoverOpen(false); navigate("/admin"); }}
                                className="flex flex-col items-center gap-1 py-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <Shield size={16} />
                                <span className="text-[10px]">{t("sidebar.admin")}</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
