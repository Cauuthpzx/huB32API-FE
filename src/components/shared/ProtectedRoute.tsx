import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
    requiredRole?: string;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const ADMIN_ROLES = ["admin", "owner"];
    if (requiredRole === "admin" && !ADMIN_ROLES.includes(user?.role ?? "")) {
        return <Navigate to="/dashboard" replace />;
    } else if (requiredRole && requiredRole !== "admin" && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
