import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ComputerGrid } from "@/components/grid/ComputerGrid";
import { useRoomStore } from "@/stores/room.store";

export function DashboardPage() {
    const fetchLocations = useRoomStore((s) => s.fetchLocations);

    useEffect(() => {
        fetchLocations("school-1");
    }, [fetchLocations]);

    return (
        <AppLayout>
            <ComputerGrid />
        </AppLayout>
    );
}
