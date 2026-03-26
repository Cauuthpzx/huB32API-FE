import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardPage() {
    const { t } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)]">
            <h1 className="text-2xl font-semibold text-foreground">
                {t("app.name")} — {t("app.title")}
            </h1>
            <p className="text-muted-foreground">
                {t("header.role." + (user?.role ?? "teacher"))} — {user?.sub}
            </p>
            <Button variant="outline" onClick={logout}>
                <LogOut />
                {t("auth.logout")}
            </Button>
        </div>
    );
}
