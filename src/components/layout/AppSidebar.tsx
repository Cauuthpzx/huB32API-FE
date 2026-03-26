import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { useRoomStore } from "@/stores/room.store";
import type { LocationResponse } from "@/api/types";
import { useThemeStore } from "@/stores/theme.store";
import { THEMES, THEME_NAMES, type ThemeName } from "@/lib/themes";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    ChevronRight,
    Languages,
    LogOut,
    Monitor,
    Palette,
    PanelLeft,
    PanelLeftClose,
    Settings,
    Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartTooltip } from "@/components/shared/SmartTooltip";

const LANG_CYCLE = ["vi", "en", "zh"] as const;
const LANG_LABELS: Record<string, string> = { vi: "Tiếng Việt", en: "English", zh: "中文" };

export function AppSidebar() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const isLoadingLocations = useRoomStore((s) => s.isLoadingLocations);
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
            // If on admin page, navigate back to dashboard
            if (location.pathname === "/admin") {
                navigate("/dashboard");
            }
            if (!sidebarPinned && window.innerWidth < 768) {
                setHoverOpen(false);
            }
        },
        [selectLocation, sidebarPinned, location.pathname, navigate],
    );

    const roomBadge = (loc: LocationResponse) => {
        if (loc.id === selectedLocationId && Array.isArray(computers) && computers.length > 0) {
            const online = computers.filter((c) => c.state !== "offline").length;
            return `${online}/${computers.length}`;
        }
        // Show capacity for non-selected rooms
        return String(loc.capacity);
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
                <SmartTooltip content={isVisible ? t("tooltip.closeSidebar") : t("tooltip.openSidebar")} position="right">
                    <button
                        type="button"
                        aria-label={isVisible ? t("tooltip.closeSidebar") : t("tooltip.openSidebar")}
                        onClick={() => setHoverOpen((o) => !o)}
                        className={cn(
                            "fixed top-1/2 z-[var(--z-overlay)] -translate-y-1/2",
                            "flex h-20 w-5 items-center justify-center",
                            "rounded-r-md border border-l-0",
                            "bg-[var(--bg-secondary)] border-[var(--border-default)]",
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
                </SmartTooltip>
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
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--bg-tertiary)] px-4">
                    <span className="font-mono text-sm font-bold text-[var(--accent-blue)]">
                        HUB32
                    </span>
                    <SmartTooltip content={sidebarPinned ? t("tooltip.unpin") : t("tooltip.pin")} position="bottom">
                        <button
                            type="button"
                            aria-label={sidebarPinned ? t("tooltip.unpin") : t("tooltip.pin")}
                            onClick={togglePin}
                            className={cn(
                                "flex size-7 items-center justify-center rounded-md transition-colors",
                                sidebarPinned
                                    ? "bg-[var(--accent-subtle)] text-[var(--accent-blue)]"
                                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                            )}
                        >
                            {sidebarPinned ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
                        </button>
                    </SmartTooltip>
                </div>

                {/* ---- MIDDLE: rooms right below logo (flex:1, scrollable) ---- */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                        <p className="px-2 py-1 text-xs font-medium uppercase text-[var(--text-tertiary)]">
                            {t("sidebar.rooms")}
                        </p>
                        {isLoadingLocations ? (
                            <div className="space-y-2 px-2 py-2">
                                <div className="h-8 animate-pulse rounded-md bg-[var(--bg-tertiary)]" />
                                <div className="h-8 animate-pulse rounded-md bg-[var(--bg-tertiary)]/80" />
                                <div className="h-8 animate-pulse rounded-md bg-[var(--bg-tertiary)]/60" />
                            </div>
                        ) : locations.length === 0 ? (
                            <p className="px-2 py-4 text-sm text-[var(--text-disabled)]">
                                {t("sidebar.noRooms")}
                            </p>
                        ) : (
                            locations.map((loc) => (
                                <button
                                    type="button"
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
                                    <Badge variant="secondary" className="text-xs">
                                        {roomBadge(loc)}
                                    </Badge>
                                </button>
                            ))
                        )}
                </div>

                {/* ---- BOTTOM: Account + 3 action columns ---- */}
                <div className="shrink-0">
                    {/* Row 1: Account */}
                    <div className="flex items-center gap-2.5 border-t border-[var(--border-default)] px-3 py-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)] text-xs font-semibold text-white">
                            {(user?.sub ?? "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                {user?.sub}
                            </p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">
                                {t("header.role." + (user?.role ?? "teacher"))}
                            </p>
                        </div>
                        <SmartTooltip content={t("tooltip.settings")} position="top">
                            <button
                                type="button"
                                aria-label={t("tooltip.settings")}
                                onClick={() => setHoverOpen(false)}
                                className="flex size-7 items-center justify-center rounded-md border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                <Settings size={14} />
                            </button>
                        </SmartTooltip>
                        <SmartTooltip content={t("tooltip.logout")} position="top">
                            <button
                                type="button"
                                aria-label={t("tooltip.logout")}
                                onClick={logout}
                                className="flex size-7 items-center justify-center rounded-md border border-red-900/50 text-red-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            >
                                <LogOut size={14} />
                            </button>
                        </SmartTooltip>
                    </div>

                    {/* Row 2: Quick actions — h-12 matches toolbar height */}
                    <div
                        className="grid h-12 border-t border-[var(--border-default)]"
                        style={{ gridTemplateColumns: user?.role === "admin" ? "1fr 1fr 1fr" : "1fr 1fr" }}
                    >
                        <SmartTooltip content={t("header.language")} position="top">
                            <button
                                type="button"
                                aria-label={t("header.language")}
                                onClick={() => {
                                    const idx = LANG_CYCLE.indexOf(i18n.language as typeof LANG_CYCLE[number]);
                                    const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
                                    i18n.changeLanguage(next);
                                }}
                                className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors border-r border-[var(--border-default)]"
                            >
                                <Languages size={16} />
                                <span className="text-[10px]">
                                    {LANG_LABELS[i18n.language] ?? t("header.language")}
                                </span>
                            </button>
                        </SmartTooltip>

                        <ThemePicker isAdmin={user?.role === "admin"} />

                        {user?.role === "admin" && (
                            <SmartTooltip content={t("sidebar.admin")} position="top">
                                <button
                                    type="button"
                                    aria-label={t("sidebar.admin")}
                                    onClick={() => { setHoverOpen(false); navigate("/admin"); }}
                                    className="flex flex-col items-center justify-center gap-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <Shield size={16} />
                                    <span className="text-[10px]">{t("sidebar.admin")}</span>
                                </button>
                            </SmartTooltip>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

function ThemePickerContent({ onSelect }: { onSelect?: () => void }) {
    const { t } = useTranslation();
    const currentTheme = useThemeStore((s) => s.currentTheme);
    const setTheme = useThemeStore((s) => s.setTheme);

    return (
        <div className="grid grid-cols-3 gap-1.5" style={{ padding: 4 }}>
            {THEME_NAMES.map((name) => {
                const colors = THEMES[name];
                const isActive = currentTheme === name;
                return (
                    <button
                        type="button"
                        key={name}
                        onClick={() => { setTheme(name as ThemeName); onSelect?.(); }}
                        className={cn(
                            "flex flex-col items-center gap-1 rounded-lg p-2 text-[10px] transition-all",
                            isActive
                                ? "ring-2 ring-[var(--accent-blue)] shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                : "hover:bg-[var(--bg-hover)] hover:scale-105",
                        )}
                    >
                        <div
                            className="size-8 rounded-md shadow-md"
                            style={{
                                background: `linear-gradient(135deg, ${colors["--bg-primary"]} 40%, ${colors["--accent-blue"]} 100%)`,
                                border: `2px solid ${colors["--accent-blue"]}`,
                                boxShadow: `0 2px 8px ${colors["--accent-blue"]}40`,
                            }}
                        />
                        <span className="whitespace-nowrap font-medium">{t(`theme.${name}`)}</span>
                    </button>
                );
            })}
        </div>
    );
}

function ThemePicker({ isAdmin }: { isAdmin?: boolean }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex flex-col items-center justify-center gap-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors",
                        isAdmin && "border-r border-[var(--border-default)]",
                    )}
                >
                    <Palette size={16} />
                    <span className="text-[10px]">{t("sidebar.theme")}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="center" className="w-auto p-2">
                <ThemePickerContent onSelect={() => setOpen(false)} />
            </PopoverContent>
        </Popover>
    );
}
