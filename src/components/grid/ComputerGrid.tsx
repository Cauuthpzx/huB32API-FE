import { useTranslation } from "react-i18next";
import { useRoomStore } from "@/stores/room.store";
import { ComputerCard } from "./ComputerCard";

export function ComputerGrid() {
    const { t } = useTranslation();
    const computers = useRoomStore((s) => s.computers);
    const selectedComputerIds = useRoomStore((s) => s.selectedComputerIds);
    const isLoadingComputers = useRoomStore((s) => s.isLoadingComputers);
    const toggleComputer = useRoomStore((s) => s.toggleComputer);

    if (isLoadingComputers) {
        return (
            <div className="h-full overflow-y-auto">
                <div className="grid grid-cols-6 gap-1.5 p-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)]"
                        >
                            <div className="aspect-video w-full animate-pulse bg-zinc-800/60" />
                            <div className="flex items-center gap-2 px-2 py-1.5 border-t border-[var(--border-default)]">
                                <div className="h-2.5 w-6 animate-pulse rounded bg-zinc-800/60" />
                                <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-800/60" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (computers.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[var(--text-disabled)]">
                    {t("grid.noComputers")}
                </p>
            </div>
        );
    }

    function handleCardClick(id: string) {
        console.log("Computer detail:", id);
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-6 gap-1.5 p-2">
                {computers.map((pc) => (
                    <ComputerCard
                        key={pc.id}
                        computer={pc}
                        isSelected={selectedComputerIds.has(pc.id)}
                        onSelect={toggleComputer}
                        onClick={handleCardClick}
                    />
                ))}
            </div>
        </div>
    );
}
