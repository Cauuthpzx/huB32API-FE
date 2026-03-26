import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Lock,
    Unlock,
    MessageSquare,
    MousePointerBan,
    Monitor,
    Power,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoomStore } from "@/stores/room.store";
import { LockDialog } from "./LockDialog";
import { MessageDialog } from "./MessageDialog";
import { PowerDialog } from "./PowerDialog";

type DialogType = "lock" | "unlock" | "message" | "power" | null;

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
            <div className="flex h-12 shrink-0 items-center gap-2 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-3">
                {/* Selection info */}
                <span className="text-xs shrink-0">
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
                </span>

                {/* Select all / Deselect */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={selectAll}
                >
                    {t("grid.selectAll")}
                </Button>
                {hasSelection && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={deselectAll}
                    >
                        {t("grid.deselectAll")}
                    </Button>
                )}

                {/* Separator */}
                <div className="h-6 w-px bg-[var(--border-default)] shrink-0" />

                {/* Feature buttons */}
                <Button
                    variant="default"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={!hasSelection}
                    onClick={() => setOpenDialog("lock")}
                >
                    <Lock size={14} />
                    {t("feature.lock.lock")}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={!hasSelection}
                    onClick={() => setOpenDialog("unlock")}
                >
                    <Unlock size={14} />
                    {t("feature.lock.unlock")}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={!hasSelection}
                    onClick={() => setOpenDialog("message")}
                >
                    <MessageSquare size={14} />
                    {t("feature.message.title")}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    disabled={!hasSelection}
                >
                    <MousePointerBan size={14} />
                    {t("feature.inputLock.title")}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                    disabled={!hasSelection}
                >
                    <Monitor size={14} />
                    {t("feature.demo.title")}
                </Button>

                {/* Separator */}
                <div className="h-6 w-px bg-[var(--border-default)] shrink-0" />

                {/* Power buttons */}
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    disabled={!hasSelection}
                    onClick={() => setOpenDialog("power")}
                >
                    <Power size={14} />
                    {t("feature.power.shutdown")}
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    disabled={!hasSelection}
                    onClick={() => setOpenDialog("power")}
                >
                    <RotateCcw size={14} />
                    {t("feature.power.reboot")}
                </Button>
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
