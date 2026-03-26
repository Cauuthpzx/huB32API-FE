import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    CheckSquare,
    XSquare,
    Lock,
    Unlock,
    MessageSquare,
    MousePointerBan,
    MonitorPlay,
    Power,
    RotateCcw,
} from "lucide-react";
import { useRoomStore } from "@/stores/room.store";
import { SmartTooltip } from "@/components/shared/SmartTooltip";
import { LockDialog } from "./LockDialog";
import { MessageDialog } from "./MessageDialog";
import { PowerDialog } from "./PowerDialog";
import { cn } from "@/lib/utils";

type DialogType = "lock" | "unlock" | "message" | "power" | null;

function animateClick(e: React.MouseEvent<HTMLButtonElement>, callback: () => void) {
    const btn = e.currentTarget;
    btn.classList.remove("btn-click-anim");
    void btn.offsetWidth;
    btn.classList.add("btn-click-anim");
    setTimeout(() => btn.classList.remove("btn-click-anim"), 300);
    callback();
}

interface ToolbarBtnProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "accent" | "success" | "danger";
}

function ToolbarBtn({ icon, label, onClick, disabled, variant = "default" }: ToolbarBtnProps) {
    const styles = {
        default: "border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        accent: "border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white hover:opacity-90",
        success: "border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/20",
        danger: "border-red-600/50 text-red-400 hover:bg-red-600/20",
    };

    return (
        <SmartTooltip content={label} position="top">
            <button
                type="button"
                disabled={disabled}
                onClick={(e) => animateClick(e, onClick)}
                className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors active:scale-95",
                    styles[variant],
                    disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                )}
            >
                {icon}
            </button>
        </SmartTooltip>
    );
}

export function FeatureToolbar() {
    const { t } = useTranslation();
    const selectedComputerIds = useRoomStore((s) => s.selectedComputerIds);
    const selectAll = useRoomStore((s) => s.selectAll);
    const deselectAll = useRoomStore((s) => s.deselectAll);

    const [openDialog, setOpenDialog] = useState<DialogType>(null);

    const count = selectedComputerIds.size;
    const hasSelection = count > 0;
    const ids = Array.from(selectedComputerIds);

    return (
        <>
            <div className="flex h-12 shrink-0 items-center border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-3">
                {/* Left: selection info */}
                <div className="min-w-[140px] shrink-0 text-xs">
                    {hasSelection ? (
                        <>
                            <span className="font-medium text-[var(--accent-blue)]">{count}</span>
                            <span className="text-[var(--text-secondary)]">
                                {" "}{t("grid.selected", { count }).replace(String(count), "").trim()}
                            </span>
                        </>
                    ) : (
                        <span className="text-[var(--text-disabled)]">
                            {t("feature.selectToControl")}
                        </span>
                    )}
                </div>

                {/* Center: icon buttons */}
                <div className="flex flex-1 items-center justify-center gap-1.5 overflow-x-auto">
                    <ToolbarBtn icon={<CheckSquare size={20} />} label={t("grid.selectAll")} onClick={selectAll} />
                    <ToolbarBtn icon={<XSquare size={20} />} label={t("grid.deselectAll")} onClick={deselectAll} disabled={!hasSelection} />

                    <div className="mx-1 h-6 w-px shrink-0 bg-[var(--border-default)]" />

                    <ToolbarBtn icon={<Lock size={20} />} label={t("feature.lock.title")} onClick={() => setOpenDialog("lock")} disabled={!hasSelection} variant="accent" />
                    <ToolbarBtn icon={<Unlock size={20} />} label={t("feature.lock.unlock")} onClick={() => setOpenDialog("unlock")} disabled={!hasSelection} />
                    <ToolbarBtn icon={<MessageSquare size={20} />} label={t("feature.message.title")} onClick={() => setOpenDialog("message")} disabled={!hasSelection} />
                    <ToolbarBtn icon={<MousePointerBan size={20} />} label={t("feature.inputLock.title")} onClick={() => {}} disabled={!hasSelection} />
                    <ToolbarBtn icon={<MonitorPlay size={20} />} label={t("feature.demo.title")} onClick={() => {}} disabled={!hasSelection} variant="success" />

                    <div className="mx-1 h-6 w-px shrink-0 bg-[var(--border-default)]" />

                    <ToolbarBtn icon={<Power size={20} />} label={t("feature.power.shutdown")} onClick={() => setOpenDialog("power")} disabled={!hasSelection} variant="danger" />
                    <ToolbarBtn icon={<RotateCcw size={20} />} label={t("feature.power.reboot")} onClick={() => setOpenDialog("power")} disabled={!hasSelection} variant="danger" />
                </div>

                {/* Right: spacer for centering */}
                <div className="min-w-[140px] shrink-0" />
            </div>

            {/* Dialogs */}
            <LockDialog
                open={openDialog === "lock" || openDialog === "unlock"}
                onOpenChange={(v) => !v && setOpenDialog(null)}
                computerIds={ids}
                mode={openDialog === "unlock" ? "unlock" : "lock"}
            />
            <MessageDialog
                open={openDialog === "message"}
                onOpenChange={(v) => !v && setOpenDialog(null)}
                computerIds={ids}
            />
            <PowerDialog
                open={openDialog === "power"}
                onOpenChange={(v) => !v && setOpenDialog(null)}
                computerIds={ids}
            />
        </>
    );
}
