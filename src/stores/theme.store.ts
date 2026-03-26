import { create } from "zustand";
import type { ThemeName } from "@/lib/themes";
import { applyTheme } from "@/lib/themes";

const THEME_KEY = "hub32_theme";

interface ThemeState {
    currentTheme: ThemeName;
    setTheme: (theme: ThemeName) => void;
}

function initTheme(): ThemeName {
    const stored = localStorage.getItem(THEME_KEY) as ThemeName | null;
    const theme = stored ?? "dark";
    applyTheme(theme);
    return theme;
}

export const useThemeStore = create<ThemeState>(() => {
    const currentTheme = initTheme();
    return {
        currentTheme,
        setTheme: (theme: ThemeName) => {
            applyTheme(theme);
            localStorage.setItem(THEME_KEY, theme);
            useThemeStore.setState({ currentTheme: theme });
        },
    };
});
