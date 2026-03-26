import { useEffect } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

export function useKeyboardShortcut(
    key: string,
    handler: KeyHandler,
    deps: unknown[] = [],
) {
    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            )
                return;
            if (e.key === key) handler(e);
        };
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export const SHORTCUTS = {
    ESCAPE: "Escape",
    SELECT_ALL: "a",
    LOCK: "l",
    REFRESH: "r",
    SEARCH: "/",
} as const;
