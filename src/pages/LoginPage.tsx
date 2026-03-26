import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/stores/auth.store";
import { Monitor } from "lucide-react";

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-primary)]">
            {/* Subtle animated background */}
            <div className="login-bg-grid absolute inset-0" />
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: "radial-gradient(ellipse 60% 50% at 50% 40%, var(--accent-subtle), transparent)",
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-[380px] px-6">
                {/* Branding */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] shadow-lg shadow-[var(--accent-blue)]/10">
                        <Monitor size={32} className="text-[var(--accent-blue)]" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                            {t("app.name")}
                        </h1>
                        <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                            {t("app.title")}
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
                    <h2 className="mb-5 text-center text-sm font-semibold text-[var(--text-secondary)]">
                        {t("auth.login")}
                    </h2>
                    <LoginForm />
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-[10px] text-[var(--text-disabled)]">
                    HUB32 Computer Lab Management
                </p>
            </div>
        </div>
    );
}
