import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SmartTooltip } from "@/components/shared/SmartTooltip";
import { DataTable, type Column } from "./DataTable";
import { teachersApi } from "@/api/teachers.api";
import type { TeacherResponse } from "@/api/types";

export function TeacherManager() {
    const { t } = useTranslation();
    const qc = useQueryClient();

    const { data: teachers = [], isLoading } = useQuery({
        queryKey: ["teachers"],
        queryFn: teachersApi.getAll,
    });

    const [editItem, setEditItem] = useState<TeacherResponse | null>(null);
    const [deleteItem, setDeleteItem] = useState<TeacherResponse | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "teacher" });

    const createMut = useMutation({
        mutationFn: () => teachersApi.create({ username: form.username, password: form.password, fullName: form.fullName, role: form.role }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); toast.success(t("app.save")); closeForm(); },
        onError: () => toast.error(t("app.error")),
    });

    const updateMut = useMutation({
        mutationFn: () => teachersApi.update(editItem!.id, { username: form.username, password: "", fullName: form.fullName, role: form.role }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); toast.success(t("app.save")); closeForm(); },
        onError: () => toast.error(t("app.error")),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => teachersApi.remove(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); toast.success(t("app.delete")); setDeleteItem(null); },
        onError: () => toast.error(t("app.error")),
    });

    function openCreate() {
        setEditItem(null);
        setForm({ username: "", password: "", fullName: "", role: "teacher" });
        setFormOpen(true);
    }

    function openEdit(teacher: TeacherResponse) {
        setEditItem(teacher);
        setForm({ username: teacher.username, password: "", fullName: teacher.fullName, role: teacher.role });
        setFormOpen(true);
    }

    function closeForm() { setFormOpen(false); setEditItem(null); }

    function handleSubmit() {
        if (editItem) updateMut.mutate();
        else createMut.mutate();
    }

    const roleBadge = (role: string) => {
        const variant = role === "admin" ? "default" : "secondary";
        return <Badge variant={variant}>{t(`header.role.${role}`)}</Badge>;
    };

    const columns: Column<TeacherResponse>[] = [
        { key: "username", header: t("admin.teacher.username"), sortable: true },
        { key: "fullName", header: t("admin.teacher.fullName"), sortable: true },
        { key: "role", header: t("admin.teacher.role"), render: (r) => roleBadge(r.role), sortable: true },
        {
            key: "createdAt",
            header: t("admin.audit.timestamp"),
            sortable: true,
            render: (r) => new Date(r.createdAt * 1000).toLocaleDateString(),
        },
        {
            key: "_actions",
            header: "",
            render: (r) => (
                <div className="flex gap-1">
                    <SmartTooltip content={t("app.edit")} position="top">
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                            <Pencil size={14} />
                        </Button>
                    </SmartTooltip>
                    <SmartTooltip content={t("app.delete")} position="top">
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}>
                            <Trash2 size={14} />
                        </Button>
                    </SmartTooltip>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t("admin.tabs.teachers")}</h3>
                <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}>
                    <Plus size={14} /> {t("app.create")}
                </Button>
            </div>

            <DataTable columns={columns} data={teachers} isLoading={isLoading} rowKey={(r) => r.id} onRowClick={openEdit} />

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editItem ? t("admin.teacher.editTitle") : t("admin.teacher.createTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>{t("admin.teacher.username")}</Label>
                            <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} disabled={!!editItem} autoFocus />
                        </div>
                        {!editItem && (
                            <div>
                                <Label>{t("admin.teacher.password")}</Label>
                                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                            </div>
                        )}
                        <div>
                            <Label>{t("admin.teacher.fullName")}</Label>
                            <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                        </div>
                        <div>
                            <Label>{t("admin.teacher.role")}</Label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                                className="h-9 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)]"
                            >
                                <option value="admin">{t("header.role.admin")}</option>
                                <option value="teacher">{t("header.role.teacher")}</option>
                                <option value="readonly">{t("header.role.readonly")}</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeForm}>{t("app.cancel")}</Button>
                        <Button type="button" onClick={handleSubmit} disabled={!form.fullName.trim() || (!editItem && !form.username.trim())}>{t("app.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("app.confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.teacher.deleteConfirm", { name: deleteItem?.fullName })}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive" onClick={() => deleteItem && deleteMut.mutate(deleteItem.id)}>{t("app.delete")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
