import { useTranslation } from "react-i18next";
import { DataTable, type Column } from "./DataTable";

// Mock audit data (will come from API later)
interface AuditEntry {
    id: string;
    timestamp: number;
    teacher: string;
    action: string;
    target: string;
    ipAddress: string;
}

const MOCK_AUDIT: AuditEntry[] = [
    { id: "1", timestamp: Date.now() / 1000 - 120, teacher: "admin", action: "lock", target: "PM1-PC01, PM1-PC02", ipAddress: "192.168.1.10" },
    { id: "2", timestamp: Date.now() / 1000 - 300, teacher: "admin", action: "message", target: "PM1-PC01..PM1-PC24", ipAddress: "192.168.1.10" },
    { id: "3", timestamp: Date.now() / 1000 - 600, teacher: "teacher1", action: "unlock", target: "PM1-PC05", ipAddress: "192.168.1.11" },
    { id: "4", timestamp: Date.now() / 1000 - 1800, teacher: "admin", action: "power.shutdown", target: "Lab-PC01..Lab-PC16", ipAddress: "192.168.1.10" },
    { id: "5", timestamp: Date.now() / 1000 - 3600, teacher: "teacher1", action: "lock", target: "PM2-PC01..PM2-PC20", ipAddress: "192.168.1.11" },
];

export function AuditLog() {
    const { t } = useTranslation();

    const columns: Column<AuditEntry>[] = [
        {
            key: "timestamp",
            header: t("admin.audit.timestamp"),
            sortable: true,
            render: (r) => new Date(r.timestamp * 1000).toLocaleString(),
        },
        { key: "teacher", header: t("admin.audit.teacher"), sortable: true },
        { key: "action", header: t("admin.audit.action"), sortable: true },
        { key: "target", header: t("admin.audit.target") },
        { key: "ipAddress", header: t("admin.audit.ipAddress") },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">{t("admin.tabs.audit")}</h3>
            <DataTable columns={columns} data={MOCK_AUDIT} rowKey={(r) => r.id} />
        </div>
    );
}
