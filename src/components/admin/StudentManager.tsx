import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SmartTooltip } from "@/components/shared/SmartTooltip";
import { DataTable, type Column } from "./DataTable";
import { studentsApi } from "@/api/students.api";
import { classesApi } from "@/api/classes.api";
import type { StudentResponse, ClassResponse } from "@/api/types";

export function StudentManager() {
    const { t } = useTranslation();
    const qc = useQueryClient();

    const { data: classes = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: classesApi.getAll,
    });

    const [selectedClassId, setSelectedClassId] = useState("");

    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes, selectedClassId]);

    const { data: students = [], isLoading } = useQuery({
        queryKey: ["students", selectedClassId],
        queryFn: () => studentsApi.getByClass(selectedClassId),
        enabled: !!selectedClassId,
    });

    const [editItem, setEditItem] = useState<StudentResponse | null>(null);
    const [deleteItem, setDeleteItem] = useState<StudentResponse | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const createMut = useMutation({
        mutationFn: () =>
            studentsApi.create({ classId: selectedClassId, fullName, username, password }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
            toast.success(t("app.save"));
            closeForm();
        },
        onError: () => toast.error(t("app.error")),
    });

    const updateMut = useMutation({
        mutationFn: () => studentsApi.update(editItem!.id, { fullName, password }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
            toast.success(t("app.save"));
            closeForm();
        },
        onError: () => toast.error(t("app.error")),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => studentsApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
            toast.success(t("app.delete"));
            setDeleteItem(null);
        },
        onError: () => toast.error(t("app.error")),
    });

    const resetMut = useMutation({
        mutationFn: (id: string) => studentsApi.resetMachine(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students", selectedClassId] });
            toast.success(t("admin.student.machineReset"));
        },
        onError: () => toast.error(t("app.error")),
    });

    function openCreate() {
        setEditItem(null);
        setFullName("");
        setUsername("");
        setPassword("");
        setFormOpen(true);
    }

    function openEdit(s: StudentResponse) {
        setEditItem(s);
        setFullName(s.fullName);
        setUsername(s.username);
        setPassword("");
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditItem(null);
    }

    function handleSubmit() {
        if (!fullName.trim() || !username.trim()) return;
        if (editItem) {
            updateMut.mutate();
        } else {
            if (!password.trim()) return;
            createMut.mutate();
        }
    }

    const columns: Column<StudentResponse>[] = [
        { key: "username", header: t("admin.student.username"), sortable: true },
        { key: "fullName", header: t("admin.student.fullName"), sortable: true },
        {
            key: "isActivated",
            header: t("admin.student.activated"),
            render: (r) => (
                <span className={r.isActivated ? "text-emerald-400" : "text-muted-foreground"}>
                    {r.isActivated ? t("app.yes") : t("app.no")}
                </span>
            ),
        },
        {
            key: "_actions",
            header: "",
            render: (r) => (
                <div className="flex gap-1">
                    {r.isActivated && (
                        <SmartTooltip content={t("admin.student.resetMachine")} position="top">
                            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); resetMut.mutate(r.id); }}>
                                <RotateCcw size={14} />
                            </Button>
                        </SmartTooltip>
                    )}
                    <SmartTooltip content={t("app.edit")} position="top">
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                            <Pencil size={14} />
                        </Button>
                    </SmartTooltip>
                    <SmartTooltip content={t("app.delete")} position="top">
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive/80" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}>
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
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{t("admin.tabs.students")}</h3>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs text-foreground dark:bg-input/30"
                    >
                        {classes.map((c: ClassResponse) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate} disabled={!selectedClassId}>
                    <Plus size={14} /> {t("app.create")}
                </Button>
            </div>

            <DataTable columns={columns} data={students} isLoading={isLoading} rowKey={(r) => r.id} onRowClick={openEdit} />

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{editItem ? t("admin.student.editTitle") : t("admin.student.createTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>{t("admin.student.fullName")}</Label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus />
                        </div>
                        {!editItem && (
                            <div>
                                <Label>{t("admin.student.username")}</Label>
                                <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                        )}
                        <div>
                            <Label>
                                {t("admin.student.password")}
                                {editItem ? ` (${t("admin.student.leaveBlank")})` : ""}
                            </Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeForm}>{t("app.cancel")}</Button>
                        <Button type="button" onClick={handleSubmit} disabled={!fullName.trim()}>{t("app.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("app.confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.student.deleteConfirm", { name: deleteItem?.fullName })}</AlertDialogDescription>
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
