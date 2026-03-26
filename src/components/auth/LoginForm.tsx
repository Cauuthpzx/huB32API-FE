import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";

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
            <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("auth.username")}
                    autoComplete="username"
                    autoFocus
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password")}
                    autoComplete="current-password"
                    required
                />
            </div>

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={mutation.isPending}
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="animate-spin" />
                        {t("auth.loggingIn")}
                    </>
                ) : (
                    t("auth.loginButton")
                )}
            </Button>
        </form>
    );
}
