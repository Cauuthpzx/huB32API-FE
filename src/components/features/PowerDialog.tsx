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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { featuresApi } from "@/api/features.api";
import { FeatureUids } from "@/api/types";

type PowerAction = "shutdown" | "reboot" | "logoff";

interface PowerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    computerIds: string[];
}

export function PowerDialog({ open, onOpenChange, computerIds }: PowerDialogProps) {
    const { t } = useTranslation();
    const [action, setAction] = useState<PowerAction>("shutdown");
    const [isPending, setIsPending] = useState(false);
    const count = computerIds.length;

    const confirmMessages: Record<PowerAction, string> = {
        shutdown: t("feature.power.confirmShutdown", { count }),
        reboot: t("feature.power.confirmReboot", { count }),
        logoff: t("feature.power.confirmLogoff", { count }),
    };

    async function handleConfirm() {
        setIsPending(true);
        try {
            const featureUid =
                action === "reboot" ? FeatureUids.Reboot : FeatureUids.PowerDown;
            await featuresApi.batch({
                computerIds,
                featureUid,
                operation: "start",
                arguments: { action },
            });
            toast.success(
                t("feature.power.success", {
                    action: t(`feature.power.${action}`),
                    count,
                }),
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
                    <AlertDialogTitle>{t("feature.power.title")}</AlertDialogTitle>
                    <AlertDialogDescription className="text-destructive font-medium">
                        {confirmMessages[action]}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <RadioGroup
                    value={action}
                    onValueChange={(v) => setAction(v as PowerAction)}
                    className="space-y-2"
                >
                    {(["shutdown", "reboot", "logoff"] as const).map((a) => (
                        <div key={a} className="flex items-center space-x-2">
                            <RadioGroupItem value={a} id={`power-${a}`} />
                            <Label htmlFor={`power-${a}`}>
                                {t(`feature.power.${a}`)}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        {t("app.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {t("app.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
