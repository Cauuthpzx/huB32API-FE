import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useRoomStore } from "@/stores/room.store";

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
                style={{ marginLeft: sidebarPinned ? 220 : 0 }}
            >
                <Header />

                <main className="flex-1 overflow-auto">
                    {children}
                </main>

                <div className="h-[52px] shrink-0 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]" />
            </div>
        </div>
    );
}
