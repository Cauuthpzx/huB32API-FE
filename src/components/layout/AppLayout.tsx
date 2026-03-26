import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex h-screen flex-col bg-[var(--bg-primary)]">
            {/* Header */}
            <Header />

            {/* Main content — full width */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>

            {/* Bottom control bar — placeholder */}
            <div className="h-[52px] shrink-0 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]" />

            {/* Sidebar overlay from left */}
            <AppSidebar />
        </div>
    );
}
