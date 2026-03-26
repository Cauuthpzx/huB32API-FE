import type { ComputerState } from "@/api/types";

interface HeartbeatLineProps {
    state: ComputerState;
    width?: number;
    height?: number;
}

const CONFIG: Record<string, { color: string; zigzag: boolean; duration: string }> = {
    online:        { color: "#22C55E", zigzag: true,  duration: "1.5s" },
    connected:     { color: "#06B6D4", zigzag: true,  duration: "1.2s" },
    connecting:    { color: "#F59E0B", zigzag: true,  duration: "1s"   },
    disconnecting: { color: "#F59E0B", zigzag: true,  duration: "2s"   },
    offline:       { color: "#3F3F46", zigzag: false, duration: "0s"   },
    locked:        { color: "#EF4444", zigzag: false, duration: "0s"   },
    unknown:       { color: "#3F3F46", zigzag: false, duration: "0s"   },
};

export function HeartbeatLine({ state, width = 32, height = 14 }: HeartbeatLineProps) {
    const { color, zigzag, duration } = CONFIG[state] ?? CONFIG.unknown;
    const mid = height / 2;
    const top = 1;
    const bot = height - 1;

    // Sharp zigzag: flat — V — V — flat (peaks near edges for more amplitude)
    const zigzagPoints = zigzag
        ? [
              `0,${mid}`,
              `${width * 0.12},${mid}`,
              `${width * 0.22},${top}`,
              `${width * 0.32},${bot}`,
              `${width * 0.42},${top}`,
              `${width * 0.52},${bot}`,
              `${width * 0.62},${top}`,
              `${width * 0.72},${mid}`,
              `${width},${mid}`,
          ].join(" ")
        : `0,${mid} ${width},${mid}`;

    const pathLength = zigzag ? width * 2.8 : width;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            className="shrink-0"
        >
            <polyline
                points={zigzagPoints}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={zigzag ? pathLength : undefined}
                strokeDashoffset={zigzag ? pathLength : undefined}
            >
                {zigzag && (
                    <animate
                        attributeName="stroke-dashoffset"
                        from={String(pathLength)}
                        to="0"
                        dur={duration}
                        repeatCount="indefinite"
                    />
                )}
            </polyline>
        </svg>
    );
}
