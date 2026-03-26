import { useEffect, useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    ChevronLeft,
    ChevronRight,
    Lock,
    Monitor,
    Power,
    Unlock,
    X,
    User,
    Wifi,
    Clock,
    ScreenShare,
    Cpu,
    HardDrive,
    Activity,
    MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeartbeatLine } from "@/components/shared/HeartbeatLine";
import { SmartTooltip } from "@/components/shared/SmartTooltip";
import { LockDialog } from "@/components/features/LockDialog";
import { PowerDialog } from "@/components/features/PowerDialog";
import { useRoomStore } from "@/stores/room.store";
import type { ComputerDto } from "@/api/types";
import { cn } from "@/lib/utils";

interface ComputerDetailProps {
    computer: ComputerDto;
}

export function ComputerDetail({ computer }: ComputerDetailProps) {
    const { t } = useTranslation();
    const computers = useRoomStore((s) => s.computers);
    const openDetail = useRoomStore((s) => s.openDetail);
    const closeDetail = useRoomStore((s) => s.closeDetail);
    const stripRef = useRef<HTMLDivElement>(null);

    const [dialog, setDialog] = useState<"lock" | "unlock" | "power" | null>(null);

    const currentIndex = computers.findIndex((c) => c.id === computer.id);

    const navigatePrev = useCallback(() => {
        if (currentIndex > 0) openDetail(computers[currentIndex - 1].id);
    }, [currentIndex, computers, openDetail]);

    const navigateNext = useCallback(() => {
        if (currentIndex < computers.length - 1) openDetail(computers[currentIndex + 1].id);
    }, [currentIndex, computers, openDetail]);

    const scrollStrip = useCallback((dir: "left" | "right") => {
        stripRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }, []);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") closeDetail();
            else if (e.key === "ArrowLeft") navigatePrev();
            else if (e.key === "ArrowRight") navigateNext();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [closeDetail, navigatePrev, navigateNext]);

    // Auto-scroll strip to show active computer
    useEffect(() => {
        const strip = stripRef.current;
        if (!strip) return;
        const active = strip.querySelector("[data-active='true']") as HTMLElement | null;
        if (active) {
            active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [computer.id]);

    const isOnline = computer.state !== "offline";
    const pcNum = computer.id.replace("pc-", "");

    return (
        <>
            <div className="fixed inset-0 z-50 flex flex-col animate-fade-in bg-black/95">
                {/* ---- Top Bar ---- */}
                <div className="flex h-10 shrink-0 items-center justify-between px-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <HeartbeatLine state={computer.state} width={28} height={10} />
                        <span className="font-mono text-sm font-bold text-white">
                            {computer.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {t(`computer.state.${computer.state}`)}
                        </span>
                    </div>
                    <button
                        type="button"
                        aria-label={t("app.close")}
                        onClick={closeDetail}
                        className="flex size-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ---- Middle: Video (left) + Info Panel (right) ---- */}
                <div className="flex flex-1 min-h-0">
                    {/* Video area — left */}
                    <div className="flex flex-1 items-center justify-center p-3 min-w-0">
                        <div className="relative aspect-video h-full max-h-full max-w-full rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                            <Monitor size={56} className="text-zinc-800" />
                            <span className="absolute bottom-3 left-3 text-xs text-zinc-600">
                                {t("stream.noStream")}
                            </span>
                        </div>
                    </div>

                    {/* Info panel — right */}
                    <div className="w-[280px] shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-950/60 p-4 scrollbar-hidden">
                        {/* Computer name */}
                        <div className="mb-4">
                            <h2 className="font-mono text-base font-bold text-white">
                                {computer.name}
                            </h2>
                            <p className="font-mono text-xs text-zinc-500">
                                {computer.hostname}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="mb-4 flex items-center gap-2">
                            <HeartbeatLine state={computer.state} width={32} height={12} />
                            <span className="text-sm text-zinc-400">
                                {t(`computer.state.${computer.state}`)}
                            </span>
                        </div>

                        <div className="mb-4 h-px bg-zinc-800" />

                        {/* Info rows */}
                        <div className="mb-4 space-y-2.5">
                            <InfoRow icon={<User size={13} />} label={t("computer.info.user")} value={isOnline ? `student${pcNum}` : "—"} />
                            <InfoRow icon={<Monitor size={13} />} label={t("computer.info.hostname")} value={computer.hostname} />
                            <InfoRow icon={<Wifi size={13} />} label={t("computer.info.ipAddress")} value={isOnline ? `192.168.1.${100 + parseInt(pcNum, 10)}` : "—"} />
                            <InfoRow icon={<ScreenShare size={13} />} label={t("computer.info.resolution")} value={isOnline ? "1920x1080" : "—"} />
                            <InfoRow icon={<Clock size={13} />} label={t("computer.info.uptime")} value={isOnline ? `${Math.floor(Math.random() * 120)} ${t("time.minutes")}` : "—"} />
                            <InfoRow icon={<Cpu size={13} />} label={t("computer.info.agentVersion")} value="1.0.0" />
                            <InfoRow icon={<HardDrive size={13} />} label={t("computer.info.session")} value={isOnline ? "Active" : "—"} />
                            <InfoRow icon={<Activity size={13} />} label={t("computer.info.lastSeen")} value={isOnline ? t("time.justNow") : "—"} />
                        </div>

                        <div className="mb-4 h-px bg-zinc-800" />

                        {/* Actions */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium uppercase text-zinc-600">
                                {t("feature.toolbar")}
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                                <ActionBtn
                                    icon={<Lock size={14} />}
                                    label={t("feature.lock.lock")}
                                    disabled={!isOnline}
                                    onClick={() => setDialog("lock")}
                                />
                                <ActionBtn
                                    icon={<Unlock size={14} />}
                                    label={t("feature.lock.unlock")}
                                    disabled={!isOnline}
                                    onClick={() => setDialog("unlock")}
                                />
                                <ActionBtn
                                    icon={<MessageSquare size={14} />}
                                    label={t("feature.message.title")}
                                    disabled={!isOnline}
                                    onClick={() => {}}
                                />
                                <ActionBtn
                                    icon={<Power size={14} />}
                                    label={t("feature.power.title")}
                                    disabled={!isOnline}
                                    onClick={() => setDialog("power")}
                                    variant="danger"
                                />
                            </div>
                        </div>

                        {/* Navigation hint */}
                        <div className="mt-4 text-center text-[10px] text-zinc-700">
                            {t("detail.navHint")}
                        </div>
                    </div>
                </div>

                {/* ---- Bottom Computer Strip with arrows ---- */}
                <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/80">
                    <div className="flex items-center">
                        {/* Prev arrow */}
                        <button
                            type="button"
                            onClick={() => scrollStrip("left")}
                            className="flex size-10 shrink-0 items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Scrollable strip */}
                        <div
                            ref={stripRef}
                            className="flex flex-1 items-center gap-2 overflow-x-auto px-2 py-2 scrollbar-hidden"
                        >
                            {computers.map((pc) => {
                                const isActive = pc.id === computer.id;
                                const pcOnline = pc.state !== "offline";
                                return (
                                    <button
                                        type="button"
                                        key={pc.id}
                                        data-active={isActive}
                                        onClick={() => openDetail(pc.id)}
                                        className={cn(
                                            "group relative shrink-0 overflow-hidden rounded-md transition-all",
                                            "w-[160px]",
                                            isActive
                                                ? "ring-2 ring-[var(--accent-blue)] shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                                                : "ring-1 ring-zinc-700 hover:ring-zinc-500 opacity-50 hover:opacity-100",
                                        )}
                                    >
                                        {/* 16:9 thumbnail */}
                                        <div className="aspect-video w-full bg-zinc-900 flex items-center justify-center">
                                            <Monitor size={22} className={pcOnline ? "text-zinc-600" : "text-zinc-800"} />
                                        </div>

                                        {/* Name bar */}
                                        <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-1">
                                            <div
                                                className={cn(
                                                    "size-2 shrink-0 rounded-full",
                                                    pcOnline ? "bg-emerald-500" : "bg-zinc-600",
                                                )}
                                            />
                                            <span className="truncate text-[11px] font-mono text-zinc-400">
                                                {pc.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next arrow */}
                        <button
                            type="button"
                            onClick={() => scrollStrip("right")}
                            className="flex size-10 shrink-0 items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <LockDialog
                open={dialog === "lock" || dialog === "unlock"}
                onOpenChange={(v) => !v && setDialog(null)}
                computerIds={[computer.id]}
                mode={dialog === "unlock" ? "unlock" : "lock"}
            />
            <PowerDialog
                open={dialog === "power"}
                onOpenChange={(v) => !v && setDialog(null)}
                computerIds={[computer.id]}
            />
        </>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-600">{icon}</span>
            <span className="text-zinc-500 min-w-0 flex-1">{label}</span>
            <span className="font-mono text-xs text-zinc-300 text-right">{value}</span>
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    disabled,
    onClick,
    variant = "default",
}: {
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
    onClick: () => void;
    variant?: "default" | "danger";
}) {
    return (
        <SmartTooltip content={label} position="top">
            <button
                type="button"
                disabled={disabled}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                    variant === "danger"
                        ? "text-red-400 bg-red-600/10 hover:bg-red-600/20"
                        : "text-zinc-300 bg-white/5 hover:bg-white/10",
                    disabled && "opacity-30 cursor-not-allowed",
                )}
            >
                {icon}
                <span className="truncate">{label}</span>
            </button>
        </SmartTooltip>
    );
}
