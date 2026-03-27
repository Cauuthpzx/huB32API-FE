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

// Demo mode uses a custom featureUid for screen broadcast
const kDemoFeatureUid = "7b6e9e0c-2a8f-4b93-a8a5-8c3a1e49b635";

interface DemoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    computerIds: string[];
}

export function DemoDialog({ open, onOpenChange, computerIds }: DemoDialogProps) {
    const { t } = useTranslation();
    const [isPending, setIsPending] = useState(false);
    const count = computerIds.length;

    async function handleStart(): Promise<void> {
        setIsPending(true);
        try {
            await featuresApi.batch({
                computerIds,
                featureUid: kDemoFeatureUid,
                operation: "start",
                arguments: {},
            });
            toast.success(t("feature.demo.broadcasting", { count }));
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
                    <DialogTitle>{t("feature.demo.title")}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    {t("feature.demo.start")} — {count} {count === 1 ? "computer" : "computers"}
                </p>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {t("app.cancel")}
                    </Button>
                    <Button onClick={handleStart} disabled={isPending}>
                        {t("feature.demo.start")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
