export type ThemeName = "dark" | "sunrise" | "ocean" | "light" | "teal" | "coral" | "midnight" | "forest" | "rose";

interface ThemeColors {
    "--bg-primary": string;
    "--bg-secondary": string;
    "--bg-tertiary": string;
    "--bg-hover": string;
    "--bg-elevated": string;
    "--bg-active": string;
    "--text-primary": string;
    "--text-secondary": string;
    "--text-tertiary": string;
    "--text-disabled": string;
    "--border-default": string;
    "--border-subtle": string;
    "--border-strong": string;
    "--accent-blue": string;
    "--accent-blue-hover": string;
    "--accent-subtle": string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
    dark: {
        "--bg-primary": "#09090B",
        "--bg-secondary": "#111113",
        "--bg-tertiary": "#1C1C1F",
        "--bg-hover": "#2A2A2E",
        "--bg-elevated": "#18181B",
        "--bg-active": "#333338",
        "--text-primary": "#FAFAFA",
        "--text-secondary": "#A1A1AA",
        "--text-tertiary": "#71717A",
        "--text-disabled": "#4A4A52",
        "--border-default": "#27272A",
        "--border-subtle": "#1F1F23",
        "--border-strong": "#3A3A40",
        "--accent-blue": "#3B82F6",
        "--accent-blue-hover": "#2563EB",
        "--accent-subtle": "rgba(59, 130, 246, 0.15)",
    },
    sunrise: {
        "--bg-primary": "#FAF9F7",
        "--bg-secondary": "#F5F0EB",
        "--bg-tertiary": "#EDE5DB",
        "--bg-hover": "#E5DDD3",
        "--bg-elevated": "#FFFFFF",
        "--bg-active": "#DDD4C8",
        "--text-primary": "#1A1A1A",
        "--text-secondary": "#6B6459",
        "--text-tertiary": "#9C9489",
        "--text-disabled": "#BDB5AA",
        "--border-default": "#E5DDD3",
        "--border-subtle": "#EDE5DB",
        "--border-strong": "#D5CCC0",
        "--accent-blue": "#C96442",
        "--accent-blue-hover": "#B5553A",
        "--accent-subtle": "rgba(201, 100, 66, 0.15)",
    },
    ocean: {
        "--bg-primary": "#F0F5FA",
        "--bg-secondary": "#E8EFF7",
        "--bg-tertiary": "#D6E3F0",
        "--bg-hover": "#C8D8E8",
        "--bg-elevated": "#FFFFFF",
        "--bg-active": "#B8CCE0",
        "--text-primary": "#1A2A3A",
        "--text-secondary": "#5A7A9A",
        "--text-tertiary": "#8BA4BC",
        "--text-disabled": "#A8BCCF",
        "--border-default": "#C8D8E8",
        "--border-subtle": "#D6E3F0",
        "--border-strong": "#B0C4D8",
        "--accent-blue": "#1E6BB8",
        "--accent-blue-hover": "#185A9C",
        "--accent-subtle": "rgba(30, 107, 184, 0.15)",
    },
    light: {
        "--bg-primary": "#FFFFFF",
        "--bg-secondary": "#F4F4F5",
        "--bg-tertiary": "#E4E4E7",
        "--bg-hover": "#D4D4D8",
        "--bg-elevated": "#FFFFFF",
        "--bg-active": "#C4C4C8",
        "--text-primary": "#09090B",
        "--text-secondary": "#71717A",
        "--text-tertiary": "#A1A1AA",
        "--text-disabled": "#C4C4C8",
        "--border-default": "#E4E4E7",
        "--border-subtle": "#ECECEF",
        "--border-strong": "#D4D4D8",
        "--accent-blue": "#3B82F6",
        "--accent-blue-hover": "#2563EB",
        "--accent-subtle": "rgba(59, 130, 246, 0.15)",
    },
    teal: {
        "--bg-primary": "#0B1215",
        "--bg-secondary": "#0F1A1E",
        "--bg-tertiary": "#152429",
        "--bg-hover": "#1C2E34",
        "--bg-elevated": "#132025",
        "--bg-active": "#243A42",
        "--text-primary": "#E8F5F2",
        "--text-secondary": "#8AB4AA",
        "--text-tertiary": "#5E8D82",
        "--text-disabled": "#3D6058",
        "--border-default": "#1E3338",
        "--border-subtle": "#172A2F",
        "--border-strong": "#2A4048",
        "--accent-blue": "#3CC8B4",
        "--accent-blue-hover": "#2FB8A4",
        "--accent-subtle": "rgba(60, 200, 180, 0.15)",
    },
    coral: {
        "--bg-primary": "#FFF5F5",
        "--bg-secondary": "#FFF0F0",
        "--bg-tertiary": "#FFE4E4",
        "--bg-hover": "#FFD6D6",
        "--bg-elevated": "#FFFFFF",
        "--bg-active": "#FFC8C8",
        "--text-primary": "#2D1515",
        "--text-secondary": "#8B5555",
        "--text-tertiary": "#B08080",
        "--text-disabled": "#D0A8A8",
        "--border-default": "#F0D0D0",
        "--border-subtle": "#F5DEDE",
        "--border-strong": "#E0B8B8",
        "--accent-blue": "#E06868",
        "--accent-blue-hover": "#D05555",
        "--accent-subtle": "rgba(224, 104, 104, 0.12)",
    },
    midnight: {
        "--bg-primary": "#0A0E1A",
        "--bg-secondary": "#111827",
        "--bg-tertiary": "#1E293B",
        "--bg-hover": "#283548",
        "--bg-elevated": "#152032",
        "--bg-active": "#334155",
        "--text-primary": "#F1F5F9",
        "--text-secondary": "#94A3B8",
        "--text-tertiary": "#64748B",
        "--text-disabled": "#475569",
        "--border-default": "#1E293B",
        "--border-subtle": "#172033",
        "--border-strong": "#334155",
        "--accent-blue": "#818CF8",
        "--accent-blue-hover": "#6366F1",
        "--accent-subtle": "rgba(129, 140, 248, 0.15)",
    },
    forest: {
        "--bg-primary": "#FAFFFE",
        "--bg-secondary": "#F2FAF8",
        "--bg-tertiary": "#E6F4F0",
        "--bg-hover": "#D8EDE8",
        "--bg-elevated": "#FFFFFF",
        "--bg-active": "#CCE8E0",
        "--text-primary": "#1A2E28",
        "--text-secondary": "#5A7A70",
        "--text-tertiary": "#8AA8A0",
        "--text-disabled": "#B0C8C0",
        "--border-default": "#D8EDE8",
        "--border-subtle": "#E6F4F0",
        "--border-strong": "#C0DED6",
        "--accent-blue": "#16BAAA",
        "--accent-blue-hover": "#129E90",
        "--accent-subtle": "rgba(22, 186, 170, 0.12)",
    },
    rose: {
        "--bg-primary": "#0E0C0B",
        "--bg-secondary": "#171412",
        "--bg-tertiary": "#221E1B",
        "--bg-hover": "#2D2824",
        "--bg-elevated": "#1C1816",
        "--bg-active": "#38322E",
        "--text-primary": "#F5F0ED",
        "--text-secondary": "#B0A298",
        "--text-tertiary": "#847668",
        "--text-disabled": "#5C5048",
        "--border-default": "#282220",
        "--border-subtle": "#201C1A",
        "--border-strong": "#383230",
        "--accent-blue": "#F56040",
        "--accent-blue-hover": "#E04830",
        "--accent-subtle": "rgba(245, 96, 64, 0.12)",
    },
};

export const THEME_NAMES: ThemeName[] = ["dark", "midnight", "forest", "teal", "rose", "coral", "sunrise", "ocean", "light"];

export function applyTheme(theme: ThemeName): void {
    const colors = THEMES[theme];
    const root = document.documentElement;
    for (const [key, value] of Object.entries(colors)) {
        root.style.setProperty(key, value);
    }
}
