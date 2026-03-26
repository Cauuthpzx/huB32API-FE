import { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Monitor, Power, Unlock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeartbeatLine } from "@/components/shared/HeartbeatLine";
import { SmartTooltip } from "@/components/shared/SmartTooltip";
import { LockDialog } from "@/components/features/LockDialog";
import { PowerDialog } from "@/components/features/PowerDialog";
import { useRoomStore } from "@/stores/room.store";
import type { ComputerDto } from "@/api/types";

interface ComputerDetailProps {
    computer: ComputerDto;
}

export function ComputerDetail({ computer }: ComputerDetailProps) {
    const { t } = useTranslation();
    const computers = useRoomStore((s) => s.computers);
    const openDetail = useRoomStore((s) => s.openDetail);
    const closeDetail = useRoomStore((s) => s.closeDetail);

    const [dialog, setDialog] = useState<"lock" | "unlock" | "power" | null>(null);

    const currentIndex = computers.findIndex((c) => c.id === computer.id);

    const navigatePrev = useCallback(() => {
        if (currentIndex > 0) openDetail(computers[currentIndex - 1].id);
    }, [currentIndex, computers, openDetail]);

    const navigateNext = useCallback(() => {
        if (currentIndex < computers.length - 1) openDetail(computers[currentIndex + 1].id);
    }, [currentIndex, computers, openDetail]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") closeDetail();
            else if (e.key === "ArrowLeft") navigatePrev();
            else if (e.key === "ArrowRight") navigateNext();
        }
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [closeDetail, navigatePrev, navigateNext]);

    // Mock session data (will come from API later)
    const isOnline = computer.state !== "offline";

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex animate-fade-in"
                onClick={(e) => { if (e.target === e.currentTarget) closeDetail(); }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/90" />

                {/* Content */}
                <div className="relative flex h-full w-full flex-col lg:flex-row">
                    {/* Close button */}
                    <SmartTooltip content={t("app.close")} position="left">
                        <button
                            type="button"
                            aria-label={t("app.close")}
                            onClick={closeDetail}
                            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </SmartTooltip>

                    {/* Navigation arrows */}
                    {currentIndex > 0 && (
                        <SmartTooltip content={t("app.back")} position="right">
                            <button
                                type="button"
                                aria-label={t("app.back")}
                                onClick={navigatePrev}
                                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors lg:left-4"
                            >
                                <span className="text-lg">&larr;</span>
                            </button>
                        </SmartTooltip>
                    )}
                    {currentIndex < computers.length - 1 && (
                        <SmartTooltip content={t("app.next")} position="left">
                            <button
                                type="button"
                                onClick={navigateNext}
                                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors lg:right-[calc(320px+16px)]"
                            >
                                <span className="text-lg">&rarr;</span>
                            </button>
                        </SmartTooltip>
                    )}

                    {/* Left: Video area */}
                    <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
                        <div className="relative aspect-video w-full max-w-4xl rounded-lg bg-black flex items-center justify-center">
                            <Monitor size={64} className="text-zinc-800" />
                            <span className="absolute bottom-3 left-3 text-xs text-zinc-600">
                                {t("stream.noStream")}
                            </span>
                        </div>
                    </div>

                    {/* Right: Info panel */}
                    <div className="w-full shrink-0 overflow-y-auto border-t border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 lg:w-80 lg:border-l lg:border-t-0">
                        {/* Computer name */}
                        <div className="mb-4">
                            <h2 className="font-mono text-lg font-bold text-[var(--text-primary)]">
                                {computer.name}
                            </h2>
                            <p className="font-mono text-sm text-[var(--text-tertiary)]">
                                {computer.hostname}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="mb-4 flex items-center gap-2">
                            <HeartbeatLine state={computer.state} width={32} height={12} />
                            <span className="text-sm text-[var(--text-secondary)]">
                                {t(`computer.state.${computer.state}`)}
                            </span>
                        </div>

                        <div className="mb-4 h-px bg-[var(--border-default)]" />

                        {/* Info rows */}
                        <div className="mb-4 space-y-2">
                            <InfoRow label={t("computer.info.hostname")} value={computer.hostname} />
                            <InfoRow
                                label={t("computer.info.user")}
                                value={isOnline ? `student${computer.id.replace("pc-", "")}` : "—"}
                            />
                            <InfoRow
                                label={t("computer.info.ipAddress")}
                                value={isOnline ? `192.168.1.${100 + parseInt(computer.id.replace("pc-", ""), 10)}` : "—"}
                            />
                            <InfoRow
                                label={t("computer.info.uptime")}
                                value={isOnline ? `${Math.floor(Math.random() * 120)} ${t("time.minutes")}` : "—"}
                            />
                            <InfoRow
                                label={t("computer.info.resolution")}
                                value={isOnline ? "1920x1080" : "—"}
                            />
                            <InfoRow
                                label={t("computer.info.agentVersion")}
                                value="1.0.0"
                            />
                        </div>

                        <div className="mb-4 h-px bg-[var(--border-default)]" />

                        {/* Actions for this PC */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium uppercase text-[var(--text-tertiary)]">
                                {t("feature.toolbar")}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <SmartTooltip content={t("feature.lock.lock")} position="top">
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs"
                                        disabled={!isOnline}
                                        onClick={() => setDialog("lock")}
                                    >
                                        <Lock size={14} />
                                        {t("feature.lock.lock")}
                                    </Button>
                                </SmartTooltip>
                                <SmartTooltip content={t("feature.lock.unlock")} position="top">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs"
                                        disabled={!isOnline}
                                        onClick={() => setDialog("unlock")}
                                    >
                                        <Unlock size={14} />
                                        {t("feature.lock.unlock")}
                                    </Button>
                                </SmartTooltip>
                                <SmartTooltip content={t("feature.power.title")} position="top">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 gap-1.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                        disabled={!isOnline}
                                        onClick={() => setDialog("power")}
                                    >
                                        <Power size={14} />
                                        {t("feature.power.title")}
                                    </Button>
                                </SmartTooltip>
                            </div>
                        </div>

                        {/* Navigation hint */}
                        <div className="mt-6 text-center text-[10px] text-[var(--text-disabled)]">
                            {t("detail.navHint")}
                        </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-tertiary)]">{label}</span>
            <span className="font-mono text-[var(--text-primary)]">{value}</span>
        </div>
    );
}
