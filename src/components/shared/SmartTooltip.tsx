import {
    useState,
    useRef,
    useCallback,
    useEffect,
    type ReactNode,
    type RefCallback,
} from "react";
import { createPortal } from "react-dom";

type Position = "auto" | "top" | "bottom" | "left" | "right";

interface SmartTooltipProps {
    content: ReactNode;
    children: ReactNode;
    delay?: number;
    position?: Position;
    interactive?: boolean;
}

interface TooltipPos {
    top: number;
    left: number;
    placement: "top" | "bottom" | "left" | "right";
}

const ARROW_SIZE = 6;
const GAP = 4;

function computePosition(
    triggerRect: DOMRect,
    tooltipEl: HTMLDivElement,
    preferred: Position,
): TooltipPos {
    const tw = tooltipEl.offsetWidth;
    const th = tooltipEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceTop = triggerRect.top;
    const spaceBottom = vh - triggerRect.bottom;
    const spaceRight = vw - triggerRect.right;

    let placement: "top" | "bottom" | "left" | "right";

    if (preferred !== "auto") {
        placement = preferred;
    } else {
        if (spaceTop >= th + ARROW_SIZE + GAP) {
            placement = "top";
        } else if (spaceBottom >= th + ARROW_SIZE + GAP) {
            placement = "bottom";
        } else if (spaceRight >= tw + ARROW_SIZE + GAP) {
            placement = "right";
        } else {
            placement = "left";
        }
    }

    let top = 0;
    let left = 0;
    const cx = triggerRect.left + triggerRect.width / 2;
    const cy = triggerRect.top + triggerRect.height / 2;

    switch (placement) {
        case "top":
            top = triggerRect.top - th - ARROW_SIZE - GAP;
            left = cx - tw / 2;
            break;
        case "bottom":
            top = triggerRect.bottom + ARROW_SIZE + GAP;
            left = cx - tw / 2;
            break;
        case "left":
            top = cy - th / 2;
            left = triggerRect.left - tw - ARROW_SIZE - GAP;
            break;
        case "right":
            top = cy - th / 2;
            left = triggerRect.right + ARROW_SIZE + GAP;
            break;
    }

    left = Math.max(4, Math.min(left, vw - tw - 4));
    top = Math.max(4, Math.min(top, vh - th - 4));

    return { top, left, placement };
}

function Arrow({ placement }: { placement: "top" | "bottom" | "left" | "right" }) {
    const s = ARROW_SIZE;
    const base: React.CSSProperties = { position: "absolute", width: 0, height: 0 };

    const outer: Record<string, React.CSSProperties> = {
        top: { ...base, bottom: -s, left: "50%", transform: "translateX(-50%)", borderLeft: `${s}px solid transparent`, borderRight: `${s}px solid transparent`, borderTop: `${s}px solid var(--border-strong)` },
        bottom: { ...base, top: -s, left: "50%", transform: "translateX(-50%)", borderLeft: `${s}px solid transparent`, borderRight: `${s}px solid transparent`, borderBottom: `${s}px solid var(--border-strong)` },
        left: { ...base, right: -s, top: "50%", transform: "translateY(-50%)", borderTop: `${s}px solid transparent`, borderBottom: `${s}px solid transparent`, borderLeft: `${s}px solid var(--border-strong)` },
        right: { ...base, left: -s, top: "50%", transform: "translateY(-50%)", borderTop: `${s}px solid transparent`, borderBottom: `${s}px solid transparent`, borderRight: `${s}px solid var(--border-strong)` },
    };

    const inner: Record<string, React.CSSProperties> = {
        top: { position: "absolute", bottom: 1, left: -s, width: 0, height: 0, borderLeft: `${s}px solid transparent`, borderRight: `${s}px solid transparent`, borderTop: `${s}px solid var(--bg-elevated)` },
        bottom: { position: "absolute", top: 1, left: -s, width: 0, height: 0, borderLeft: `${s}px solid transparent`, borderRight: `${s}px solid transparent`, borderBottom: `${s}px solid var(--bg-elevated)` },
        left: { position: "absolute", right: 1, top: -s, width: 0, height: 0, borderTop: `${s}px solid transparent`, borderBottom: `${s}px solid transparent`, borderLeft: `${s}px solid var(--bg-elevated)` },
        right: { position: "absolute", left: 1, top: -s, width: 0, height: 0, borderTop: `${s}px solid transparent`, borderBottom: `${s}px solid transparent`, borderRight: `${s}px solid var(--bg-elevated)` },
    };

    return <div style={outer[placement]}><div style={inner[placement]} /></div>;
}

const TRANSLATE_MAP = {
    top: "translateY(4px)",
    bottom: "translateY(-4px)",
    left: "translateX(4px)",
    right: "translateX(-4px)",
};

export function SmartTooltip({
    content,
    children,
    delay = 100,
    position = "auto",
    interactive = false,
}: SmartTooltipProps) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState<TooltipPos | null>(null);
    const [animating, setAnimating] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const show = useCallback(() => {
        timerRef.current = setTimeout(() => {
            setVisible(true);
            setAnimating(true);
        }, delay);
    }, [delay]);

    const hide = useCallback(() => {
        clearTimeout(timerRef.current);
        setAnimating(false);
        setTimeout(() => setVisible(false), 100);
    }, []);

    const hideDelayed = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(hide, 150);
    }, [hide]);

    // Attach native DOM listeners to the first child element
    const showRef = useRef(show);
    const hideRef = useRef(interactive ? hideDelayed : hide);
    showRef.current = show;
    hideRef.current = interactive ? hideDelayed : hide;

    const setTriggerRef: RefCallback<HTMLElement> = useCallback((node) => {
        // Cleanup old listeners
        if (triggerRef.current) {
            triggerRef.current.removeEventListener("mouseenter", handleEnter);
            triggerRef.current.removeEventListener("mouseleave", handleLeave);
        }
        triggerRef.current = node;
        if (node) {
            node.addEventListener("mouseenter", handleEnter);
            node.addEventListener("mouseleave", handleLeave);
        }
    }, []);

    function handleEnter() { showRef.current(); }
    function handleLeave() { hideRef.current(); }

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
            if (triggerRef.current) {
                triggerRef.current.removeEventListener("mouseenter", handleEnter);
                triggerRef.current.removeEventListener("mouseleave", handleLeave);
            }
        };
    }, []);

    useEffect(() => {
        if (visible && triggerRef.current && tooltipRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos(computePosition(rect, tooltipRef.current, position));
        }
    }, [visible, position]);

    return (
        <>
            <span ref={setTriggerRef} style={{ display: "contents" }}>
                {children}
            </span>
            {visible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        onMouseEnter={interactive ? () => clearTimeout(timerRef.current) : undefined}
                        onMouseLeave={interactive ? hide : undefined}
                        style={{
                            position: "fixed",
                            top: pos?.top ?? -9999,
                            left: pos?.left ?? -9999,
                            zIndex: 9999,
                            maxWidth: interactive ? 320 : 240,
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid var(--border-strong)",
                            background: "var(--bg-elevated)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
                            color: "var(--text-primary)",
                            fontSize: 12,
                            lineHeight: 1.4,
                            wordWrap: "break-word",
                            pointerEvents: interactive ? "auto" : "none",
                            opacity: animating ? 1 : 0,
                            transform: animating
                                ? "translate(0)"
                                : pos
                                  ? TRANSLATE_MAP[pos.placement]
                                  : "translateY(4px)",
                            transition: animating
                                ? "opacity 150ms ease-out, transform 150ms ease-out"
                                : "opacity 100ms ease-in, transform 100ms ease-in",
                        }}
                    >
                        {content}
                        {pos && <Arrow placement={pos.placement} />}
                    </div>,
                    document.body,
                )}
        </>
    );
}
