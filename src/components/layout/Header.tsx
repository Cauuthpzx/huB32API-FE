import { useTranslation } from "react-i18next";
import { useRoomStore } from "@/stores/room.store";
import { Monitor } from "lucide-react";

export function Header() {
    const { t } = useTranslation();
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const computers = useRoomStore((s) => s.computers);

    const selectedLocation = locations.find((l) => l.id === selectedLocationId);
    const total = computers.length;
    const online = computers.filter((c) => c.state !== "offline").length;

    return (
        <header className="flex h-12 shrink-0 items-center border-b-2 border-[var(--border-default)] bg-[#111113] px-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {selectedLocation?.name ?? t("sidebar.allRooms")}
            </h2>

            {selectedLocation && (
                <>
                    <span className="mx-2 text-[#3F3F46]">|</span>
                    <Monitor size={14} className="text-zinc-500" />
                    <span className="ml-1.5 text-[13px] text-zinc-400">
                        {total}
                    </span>
                    <span className="mx-2 text-[#3F3F46]">|</span>
                    <span className="text-[13px] text-[#22C55E]">
                        <span className="font-medium">{online}</span>
                        {" online"}
                    </span>
                </>
            )}
        </header>
    );
}
