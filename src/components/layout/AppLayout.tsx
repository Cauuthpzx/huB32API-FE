import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { FeatureToolbar } from "@/components/features/FeatureToolbar";
import { useRoomStore } from "@/stores/room.store";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const sidebarPinned = useRoomStore((s) => s.sidebarPinned);

    return (
        <div className="flex h-screen overflow-hidden flex-col bg-[var(--bg-primary)]">
            {/* Sidebar overlay/pinned from left */}
            <AppSidebar />

            {/* Content wrapper — pushes right when sidebar pinned */}
            <div
                className="flex flex-1 flex-col overflow-hidden transition-[margin-left] duration-200 ease-out"
                style={{ marginLeft: sidebarPinned ? 220 : 0 }}
            >
                <Header />

                <main className="flex-1 overflow-hidden">
                    {children}
                </main>

                <FeatureToolbar />
            </div>
        </div>
    );
}
