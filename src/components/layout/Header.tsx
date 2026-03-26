import { useTranslation } from "react-i18next";
import { useRoomStore } from "@/stores/room.store";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Header() {
    const { t } = useTranslation();
    const locations = useRoomStore((s) => s.locations);
    const selectedLocationId = useRoomStore((s) => s.selectedLocationId);
    const computers = useRoomStore((s) => s.computers);

    const selectedLocation = locations.find((l) => l.id === selectedLocationId);
    const total = computers.length;
    const online = computers.filter((c) => c.state !== "offline").length;
    const offline = total - online;

    return (
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-4">
            {/* Left: room name + stats */}
            <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectedLocation?.name ?? t("sidebar.allRooms")}
                </h2>
                {selectedLocation && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <span>
                            {t("grid.computerCount_other", { count: total })}
                        </span>
                        <span className="text-[var(--success)]">
                            {t("sidebar.online", { count: online })}
                        </span>
                        <span>
                            {t("sidebar.offline", { count: offline })}
                        </span>
                    </div>
                )}
            </div>

            {/* Right: search */}
            <div className="relative w-56">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <Input
                    placeholder={t("app.search")}
                    className="h-8 pl-8 text-xs"
                    disabled
                />
            </div>
        </header>
    );
}
