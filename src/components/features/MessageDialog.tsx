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
import { Textarea } from "@/components/ui/textarea";
import { featuresApi } from "@/api/features.api";
import { FeatureUids } from "@/api/types";

interface MessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    computerIds: string[];
}

const MAX_MESSAGE_LENGTH = 500;

export function MessageDialog({ open, onOpenChange, computerIds }: MessageDialogProps) {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const [isPending, setIsPending] = useState(false);
    const count = computerIds.length;

    async function handleSend() {
        if (!message.trim()) return;
        setIsPending(true);
        try {
            await featuresApi.batch({
                computerIds,
                featureUid: FeatureUids.Message,
                operation: "start",
                arguments: { text: message.trim() },
            });
            toast.success(t("feature.message.success", { count }));
            setMessage("");
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
                    <DialogTitle>{t("feature.message.title")}</DialogTitle>
                </DialogHeader>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    placeholder={t("feature.message.placeholder")}
                    rows={4}
                    autoFocus
                />
                <p className="text-xs text-muted-foreground text-right">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                </p>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        {t("app.cancel")}
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isPending || !message.trim()}
                    >
                        {t("feature.message.send")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
