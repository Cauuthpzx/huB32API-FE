import { useTranslation } from "react-i18next";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeartbeatLine } from "@/components/shared/HeartbeatLine";
import type { ComputerDto } from "@/api/types";

interface ComputerCardProps {
    computer: ComputerDto;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onClick: (id: string) => void;
}

export function ComputerCard({ computer, isSelected, onSelect, onClick }: ComputerCardProps) {
    const { t } = useTranslation();
    const isOffline = computer.state === "offline";

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-lg border bg-[var(--bg-elevated)] transition-all duration-150 cursor-pointer",
                isSelected
                    ? "border-[var(--accent-blue)] shadow-[0_0_8px_rgba(59,130,246,0.35)]"
                    : "border-[var(--border-default)] hover:border-[var(--border-strong)]",
                isOffline && "opacity-40"
            )}
            onClick={() => onClick(computer.id)}
        >
            {/* Checkbox — top-right, visible on hover or when selected */}
            <div
                className={cn(
                    "absolute right-1.5 top-1.5 z-10 transition-opacity duration-100",
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
            >
                <button
                    type="button"
                    aria-label={isSelected ? t("grid.deselectAll") : t("grid.selectAll")}
                    className={cn(
                        "flex size-5 items-center justify-center rounded border transition-colors",
                        isSelected
                            ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]"
                            : "border-[var(--text-disabled)] bg-[var(--border-default)] hover:border-[var(--text-tertiary)]"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(computer.id);
                    }}
                >
                    {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2.5 6L5 8.5L9.5 4"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {/* Screen area — 16:9 */}
            <div className="relative aspect-video w-full bg-[var(--bg-primary)] flex items-center justify-center">
                <Monitor size={28} className="text-zinc-700" />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center gap-2 px-2 py-1.5 border-t border-[var(--border-default)]">
                <HeartbeatLine state={computer.state} width={24} height={10} />
                <span className="truncate text-[11px] font-mono text-[var(--text-secondary)]">
                    {computer.name}
                </span>
                {computer.hostname && (
                    <span className="ml-auto truncate text-[10px] text-zinc-600">
                        {computer.hostname}
                    </span>
                )}
            </div>
        </div>
    );
}
