import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolManager } from "@/components/admin/SchoolManager";
import { LocationManager } from "@/components/admin/LocationManager";
import { TeacherManager } from "@/components/admin/TeacherManager";
import { AuditLog } from "@/components/admin/AuditLog";

export function AdminPage() {
    const { t } = useTranslation();

    return (
        <AppLayout>
            <div className="h-full overflow-y-auto p-4">
                <h1 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                    {t("admin.title")}
                </h1>

                <Tabs defaultValue="schools">
                    <TabsList>
                        <TabsTrigger value="schools">{t("admin.tabs.schools")}</TabsTrigger>
                        <TabsTrigger value="locations">{t("admin.tabs.locations")}</TabsTrigger>
                        <TabsTrigger value="teachers">{t("admin.tabs.teachers")}</TabsTrigger>
                        <TabsTrigger value="audit">{t("admin.tabs.audit")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schools" className="mt-4">
                        <SchoolManager />
                    </TabsContent>
                    <TabsContent value="locations" className="mt-4">
                        <LocationManager />
                    </TabsContent>
                    <TabsContent value="teachers" className="mt-4">
                        <TeacherManager />
                    </TabsContent>
                    <TabsContent value="audit" className="mt-4">
                        <AuditLog />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
