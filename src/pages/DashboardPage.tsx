import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRoomStore } from "@/stores/room.store";
import { Loader2 } from "lucide-react";

export function DashboardPage() {
    const { t } = useTranslation();
    const fetchLocations = useRoomStore((s) => s.fetchLocations);
    const isLoadingLocations = useRoomStore((s) => s.isLoadingLocations);
    const isLoadingComputers = useRoomStore((s) => s.isLoadingComputers);
    const computers = useRoomStore((s) => s.computers);

    useEffect(() => {
        fetchLocations("school-1");
    }, [fetchLocations]);

    return (
        <AppLayout>
            <div className="flex h-full items-center justify-center">
                {isLoadingLocations || isLoadingComputers ? (
                    <Loader2 className="size-6 animate-spin text-zinc-600" />
                ) : computers.length === 0 ? (
                    <p className="text-sm text-[var(--text-disabled)]">
                        {t("grid.noComputers")}
                    </p>
                ) : (
                    <p className="text-sm text-[var(--text-tertiary)]">
                        {t("grid.computerCount_other", { count: computers.length })}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
