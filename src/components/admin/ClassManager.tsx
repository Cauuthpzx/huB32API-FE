import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { classesApi } from "@/api/classes.api";
import { schoolsApi } from "@/api/schools.api";
import { teachersApi } from "@/api/teachers.api";
import type { ClassResponse, SchoolResponse, TeacherResponse } from "@/api/types";

export function ClassManager() {
    const { t } = useTranslation();
    const qc = useQueryClient();

    const { data: classes = [], isLoading } = useQuery({
        queryKey: ["classes"],
        queryFn: classesApi.getAll,
    });

    const { data: schools = [] } = useQuery({
        queryKey: ["schools"],
        queryFn: schoolsApi.getAll,
    });

    const { data: teachers = [] } = useQuery({
        queryKey: ["teachers"],
        queryFn: teachersApi.getAll,
    });

    const [editItem, setEditItem] = useState<ClassResponse | null>(null);
    const [deleteItem, setDeleteItem] = useState<ClassResponse | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [name, setName] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [teacherId, setTeacherId] = useState("");

    useEffect(() => {
        if (schools.length > 0 && !schoolId) {
            setSchoolId(schools[0].id);
        }
    }, [schools, schoolId]);

    const createMut = useMutation({
        mutationFn: () => classesApi.create({ name, schoolId, teacherId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["classes"] });
            toast.success(t("app.save"));
            closeForm();
        },
        onError: () => toast.error(t("app.error")),
    });

    const updateMut = useMutation({
        mutationFn: () => classesApi.update(editItem!.id, { name, teacherId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["classes"] });
            toast.success(t("app.save"));
            closeForm();
        },
        onError: () => toast.error(t("app.error")),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => classesApi.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["classes"] });
            toast.success(t("app.delete"));
            setDeleteItem(null);
        },
        onError: () => toast.error(t("app.error")),
    });

    function openCreate() {
        setEditItem(null);
        setName("");
        setSchoolId(schools[0]?.id ?? "");
        setTeacherId("");
        setFormOpen(true);
    }

    function openEdit(c: ClassResponse) {
        setEditItem(c);
        setName(c.name);
        setSchoolId(c.schoolId);
        setTeacherId(c.teacherId);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditItem(null);
    }

    function handleSubmit() {
        if (!name.trim()) return;
        if (editItem) updateMut.mutate();
        else createMut.mutate();
    }

    function getSchoolName(sid: string): string {
        return schools.find((s: SchoolResponse) => s.id === sid)?.name ?? sid;
    }

    function getTeacherName(tid: string): string {
        if (!tid) return "\u2014";
        return teachers.find((tc: TeacherResponse) => tc.id === tid)?.fullName ?? tid;
    }

    const columns: Column<ClassResponse>[] = [
        { key: "name", header: t("admin.class.name"), sortable: true },
        {
            key: "schoolId",
            header: t("admin.tabs.schools"),
            sortable: true,
            render: (r) => getSchoolName(r.schoolId),
        },
        {
            key: "teacherId",
            header: t("admin.tabs.teachers"),
            render: (r) => getTeacherName(r.teacherId),
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
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t("admin.tabs.classes")}</h3>
                <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}>
                    <Plus size={14} /> {t("app.create")}
                </Button>
            </div>

            <DataTable columns={columns} data={classes} isLoading={isLoading} rowKey={(r) => r.id} onRowClick={openEdit} />

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{editItem ? t("admin.class.editTitle") : t("admin.class.createTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <Label>{t("admin.class.name")}</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                        </div>
                        {!editItem && (
                            <div>
                                <Label>{t("admin.tabs.schools")}</Label>
                                <select
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm text-foreground dark:bg-input/30"
                                >
                                    {schools.map((s: SchoolResponse) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <Label>{t("admin.tabs.teachers")}</Label>
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm text-foreground dark:bg-input/30"
                            >
                                <option value="">{"\u2014"}</option>
                                {teachers.map((tc: TeacherResponse) => (
                                    <option key={tc.id} value={tc.id}>{tc.fullName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeForm}>{t("app.cancel")}</Button>
                        <Button type="button" onClick={handleSubmit} disabled={!name.trim()}>{t("app.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("app.confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.class.deleteConfirm", { name: deleteItem?.name })}</AlertDialogDescription>
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
