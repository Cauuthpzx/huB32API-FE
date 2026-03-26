import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useRoomStore } from "@/stores/room.store";

const SIDEBAR_W = 240;

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const sidebarPinned = useRoomStore((s) => s.sidebarPinned);

    return (
        <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
            {/* Sidebar overlay/pinned from left */}
            <AppSidebar />

            {/* Content wrapper — pushes right when sidebar pinned */}
            <div
                className="flex flex-1 flex-col transition-[margin-left] duration-200 ease-out"
                style={{ marginLeft: sidebarPinned ? SIDEBAR_W : 0 }}
            >
                {/* Header */}
                <Header />

                {/* Main content — full width */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>

                {/* Bottom control bar — placeholder */}
                <div className="h-[52px] shrink-0 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]" />
            </div>
        </div>
    );
}
