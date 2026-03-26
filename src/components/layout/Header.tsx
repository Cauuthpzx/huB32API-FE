import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useRoomStore } from "@/stores/room.store";
import { useAuthStore } from "@/stores/auth.store";
import { Monitor, User, Settings, Shield, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const computers = useRoomStore((s) => s.computers);
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const selectedLocation = locations.find((l) => l.id === selectedLocationId);
    const total = computers.length;
    const online = computers.filter((c) => c.state !== "offline").length;

    // ---- Account dropdown ----
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!accountOpen) return;
        const handler = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [accountOpen]);

    return (
        <header className="flex h-12 shrink-0 items-center justify-between border-b-2 border-[var(--border-default)] bg-[#111113] px-4">
            {/* Left: room name | Monitor total | online */}
            <div className="flex items-center">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectedLocation?.name ?? t("sidebar.allRooms")}
                </h2>

                {selectedLocation && (
                    <>
                        <span className="mx-2 text-[#3F3F46]">|</span>
                        <Monitor size={14} className="text-zinc-500" />
                        <span className="ml-1.5 text-[13px] text-zinc-400">
                            {total}
                        </span>
                        <span className="mx-2 text-[#3F3F46]">|</span>
                        <span className="text-[13px] text-[#22C55E]">
                            <span className="font-medium">{online}</span>
                            {" online"}
                        </span>
                    </>
                )}
            </div>

            {/* Right: account */}
            <div ref={accountRef} className="relative">
                <button
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    onMouseEnter={() => setAccountOpen(true)}
                    onClick={() => setAccountOpen((o) => !o)}
                >
                    <div className="flex size-6 items-center justify-center rounded-full bg-[var(--bg-hover)]">
                        <User size={13} className="text-[var(--text-tertiary)]" />
                    </div>
                    <span className="text-xs">{user?.sub}</span>
                </button>

                {accountOpen && (
                    <div
                        className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] py-1 shadow-lg"
                        onMouseLeave={() => setAccountOpen(false)}
                    >
                        <button
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                            onClick={() => { setAccountOpen(false); }}
                        >
                            <Settings size={13} />
                            {t("header.settings")}
                        </button>

                        {user?.role === "admin" && (
                            <button
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                onClick={() => { setAccountOpen(false); navigate("/admin"); }}
                            >
                                <Shield size={13} />
                                {t("sidebar.admin")}
                            </button>
                        )}

                        <Separator className="my-1" />

                        <button
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-subtle)]"
                            onClick={() => { setAccountOpen(false); logout(); }}
                        >
                            <LogOut size={13} />
                            {t("auth.logout")}
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
