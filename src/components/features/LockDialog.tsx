import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { featuresApi } from "@/api/features.api";
import { FeatureUids } from "@/api/types";

interface LockDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    computerIds: string[];
    mode: "lock" | "unlock";
}

export function LockDialog({ open, onOpenChange, computerIds, mode }: LockDialogProps) {
    const { t } = useTranslation();
    const [isPending, setIsPending] = useState(false);
    const count = computerIds.length;

    async function handleConfirm() {
        setIsPending(true);
        try {
            await featuresApi.batch({
                computerIds,
                featureUid: FeatureUids.ScreenLock,
                operation: mode === "lock" ? "start" : "stop",
                arguments: {},
            });
            toast.success(
                mode === "lock"
                    ? t("feature.lock.success", { count })
                    : t("feature.lock.unlockSuccess", { count }),
            );
            onOpenChange(false);
        } catch {
            toast.error(t("app.error"));
        } finally {
            setIsPending(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("feature.lock.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {mode === "lock"
                            ? t("feature.lock.confirmLock", { count })
                            : t("feature.lock.confirmUnlock", { count })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        {t("app.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                        {mode === "lock" ? t("feature.lock.lock") : t("feature.lock.unlock")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
