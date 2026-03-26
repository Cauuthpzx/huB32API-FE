import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { useRoomStore } from "@/stores/room.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ChevronRight,
    LogOut,
    Monitor,
    User,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/utils";

export function AppSidebar() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const selectLocation = useRoomStore((s) => s.selectLocation);
    const computers = useRoomStore((s) => s.computers);

    const [isOpen, setIsOpen] = useState(false);

    const handleSelectRoom = useCallback(
        async (id: string) => {
            await selectLocation(id);
            if (window.innerWidth < 768) {
                setIsOpen(false);
            }
        },
        [selectLocation],
    );

    const onlineCount = (locationId: string) => {
        if (locationId !== selectedLocationId) return null;
        const online = computers.filter((c) => c.state !== "offline").length;
        return `${online}/${computers.length}`;
    };

    return (
        <>
            {/* Bug 1 fix: Wide invisible hover zone (40px) along left edge */}
            {!isOpen && (
                <div
                    className="fixed left-0 top-0 z-[var(--z-overlay)] h-full w-10"
                    onMouseEnter={() => setIsOpen(true)}
                />
            )}

            {/* Bug 2 fix: Tall vertical trigger bar (80px × 20px), centered left edge */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className={cn(
                    "fixed top-1/2 z-[var(--z-overlay)] -translate-y-1/2",
                    "flex h-20 w-5 items-center justify-center",
                    "rounded-r-md border border-l-0",
                    "bg-[#141416] border-[#2A2A2E]",
                    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
                    "transition-all duration-200",
                    isOpen ? "left-[220px]" : "left-0",
                )}
            >
                <ChevronRight
                    className={cn(
                        "size-4 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {/* Backdrop — click to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[calc(var(--z-overlay)-1)]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-[var(--z-overlay)] h-full w-[220px]",
                    "bg-[var(--bg-secondary)] border-r border-[var(--border-default)]",
                    "flex flex-col",
                    "transition-transform duration-200 ease-out",
                    isOpen ? "translate-x-0" : "-translate-x-[220px]",
                )}
                onMouseLeave={() => setIsOpen(false)}
            >
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-hover)]">
                        <User className="size-4 text-[var(--text-secondary)]" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {user?.sub}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            {t("header.role." + (user?.role ?? "teacher"))}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Room list */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
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

                <Separator />

                {/* Bottom actions */}
                <div className="space-y-1 px-2 py-2">
                    <LanguageSwitcher />
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-[var(--text-secondary)]"
                        onClick={logout}
                    >
                        <LogOut className="size-4" />
                        {t("auth.logout")}
                    </Button>
                </div>
            </aside>
        </>
    );
}
