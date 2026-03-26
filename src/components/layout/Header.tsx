import { useTranslation } from "react-i18next";
import { useRoomStore } from "@/stores/room.store";
import { HeartbeatLine } from "@/components/shared/HeartbeatLine";
import { Monitor, Search } from "lucide-react";

export function Header() {
    const { t } = useTranslation();
    const isLoadingLocations = useRoomStore((s) => s.isLoadingLocations);
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const computers = useRoomStore((s) => s.computers);

    const selectedLocation = locations.find((l) => l.id === selectedLocationId);
    const total = computers.length;
    const online = computers.filter((c) => c.state !== "offline").length;

    return (
        <header className="relative flex h-12 shrink-0 items-center border-b border-[#1C1C1F] bg-[#111113] px-4">
            {/* Left: room stats */}
            <div className="flex shrink-0 items-center">
                {isLoadingLocations ? (
                    <div className="h-4 w-48 animate-pulse rounded bg-zinc-800/60" />
                ) : (
                    <>
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
                                <HeartbeatLine state="online" />
                                <span className="ml-1.5 text-[13px] text-[#22C55E]">
                                    <span className="font-medium">{online}</span>
                                    {" online"}
                                </span>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Center: search — absolute center of entire header */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] px-4">
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        type="text"
                        placeholder={t("app.search")}
                        className="h-8 w-full rounded-md border border-[#27272A] bg-[#18181B] pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-zinc-600 focus:border-[#3B82F6] focus:outline-none"
                    />
                </div>
            </div>
        </header>
    );
}
