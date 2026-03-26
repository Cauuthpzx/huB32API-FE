import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/shared/Spinner";
import { Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const mutation = useMutation({
        mutationFn: () =>
            authApi.login({
                method: "logon",
                username,
                password,
            }),
        onSuccess: (data) => {
            login(data.token);
            navigate("/dashboard", { replace: true });
        },
        onError: () => {
            setError(t("auth.error.invalidCredentials"));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        mutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-medium text-[var(--text-tertiary)]">
                    {t("auth.username")}
                </label>
                <div className="relative">
                    <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
                    />
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t("auth.username")}
                        autoComplete="username"
                        autoFocus
                        required
                        className={cn(
                            "h-10 w-full rounded-lg border bg-[var(--bg-primary)] pl-9 pr-3 text-sm text-[var(--text-primary)]",
                            "placeholder:text-[var(--text-disabled)]",
                            "border-[var(--border-default)] focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]",
                            "outline-none transition-all",
                        )}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-[var(--text-tertiary)]">
                    {t("auth.password")}
                </label>
                <div className="relative">
                    <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
                    />
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("auth.password")}
                        autoComplete="current-password"
                        required
                        className={cn(
                            "h-10 w-full rounded-lg border bg-[var(--bg-primary)] pl-9 pr-3 text-sm text-[var(--text-primary)]",
                            "placeholder:text-[var(--text-disabled)]",
                            "border-[var(--border-default)] focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)]",
                            "outline-none transition-all",
                        )}
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-[var(--danger-subtle)] px-3 py-2 text-xs text-[var(--danger)]">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                    "flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all",
                    "bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]",
                    mutation.isPending && "opacity-70 pointer-events-none",
                )}
            >
                {mutation.isPending ? (
                    <>
                        <Spinner size={16} />
                        {t("auth.loggingIn")}
                    </>
                ) : (
                    t("auth.loginButton")
                )}
            </button>
        </form>
    );
}
