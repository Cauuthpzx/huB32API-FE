import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isLoading = useAuthStore((s) => s.isLoading);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
            <div className="w-full max-w-sm space-y-6 px-4">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {t("app.name")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("app.title")}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("auth.login")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
