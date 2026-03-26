import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: number;
    className?: string;
}

const COLORS = [
    "#3B82F6", // blue (top)
    "#8B5CF6", // purple (top-right)
    "#EC4899", // pink (right)
    "#F59E0B", // amber (bottom-right)
    "#22C55E", // green (bottom)
    "#06B6D4", // cyan (bottom-left)
    "#EF4444", // red (left)
    "#F97316", // orange (top-left)
];

export function Spinner({ size = 48, className }: SpinnerProps) {
    const center = size / 2;
    const radius = size * 0.35; // distance from center to dots

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className={cn("shrink-0", className)}
        >
            {COLORS.map((color, i) => {
                const angle = (i * Math.PI * 2) / 8 - Math.PI / 2; // start from top
                const cx = center + radius * Math.cos(angle);
                const cy = center + radius * Math.sin(angle);
                const delay = `${(i * 0.15).toFixed(2)}s`;

                return (
                    <circle key={i} cx={cx} cy={cy} r={2} fill={color}>
                        <animate
                            attributeName="r"
                            values="2;5;2"
                            dur="1.2s"
                            begin={delay}
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="0.6;1;0.6"
                            dur="1.2s"
                            begin={delay}
                            repeatCount="indefinite"
                        />
                    </circle>
                );
            })}
        </svg>
    );
}
