import type { TFunction } from "i18next";

export function formatRelativeTime(timestamp: number, t: TFunction): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return t("time.justNow");
    if (diff < 3600)
        return t("time.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400)
        return t("time.hoursAgo", { count: Math.floor(diff / 3600) });
    return t("time.daysAgo", { count: Math.floor(diff / 86400) });
}

export function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export function formatDateTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
}

export function formatNumber(n: number): string {
    return n.toLocaleString();
}

export function formatBitrate(kbps: number): string {
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} Mbps`;
    return `${kbps} kbps`;
}

export function formatIp(ip: string, maxLen = 15): string {
    return ip.length > maxLen ? ip.slice(0, maxLen) + "\u2026" : ip;
}
