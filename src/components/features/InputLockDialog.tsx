import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { featuresApi } from "@/api/features.api";
import { FeatureUids } from "@/api/types";

interface InputLockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    computerIds: string[];
    mode: "lock" | "unlock";
}

export function InputLockDialog({ open, onOpenChange, computerIds, mode }: InputLockDialogProps) {
    const { t } = useTranslation();
    const [isPending, setIsPending] = useState(false);
    const count = computerIds.length;

    async function handleConfirm(): Promise<void> {
        setIsPending(true);
        try {
            await featuresApi.batch({
                computerIds,
                featureUid: FeatureUids.InputLock,
                operation: mode === "lock" ? "start" : "stop",
                arguments: {},
            });
            toast.success(
                mode === "lock"
                    ? t("feature.inputLock.lockSuccess", { count })
                    : t("feature.inputLock.unlockSuccess", { count })
            );
            onOpenChange(false);
        } catch {
            toast.error(t("app.error"));
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "lock" ? t("feature.inputLock.lock") : t("feature.inputLock.unlock")}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    {mode === "lock"
                        ? t("feature.inputLock.confirmLock", { count })
                        : t("feature.inputLock.confirmUnlock", { count })}
                </p>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {t("app.cancel")}
                    </Button>
                    <Button onClick={handleConfirm} disabled={isPending}>
                        {t("app.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
