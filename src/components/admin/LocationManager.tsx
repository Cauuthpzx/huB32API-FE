import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type Column } from "./DataTable";
import { locationsApi } from "@/api/locations.api";
import { schoolsApi } from "@/api/schools.api";
import type { LocationResponse } from "@/api/types";

export function LocationManager() {
    const { t } = useTranslation();
    const qc = useQueryClient();

    const { data: schools = [] } = useQuery({ queryKey: ["schools"], queryFn: schoolsApi.getAll });
    const [schoolFilter, setSchoolFilter] = useState("school-1");

    const { data: locations = [], isLoading } = useQuery({
        queryKey: ["locations", schoolFilter],
        queryFn: () => locationsApi.getBySchool(schoolFilter),
        enabled: !!schoolFilter,
    });

    const [editItem, setEditItem] = useState<LocationResponse | null>(null);
    const [deleteItem, setDeleteItem] = useState<LocationResponse | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState({ name: "", building: "", floor: "1", capacity: "24", type: "classroom" });

    const createMut = useMutation({
        mutationFn: () => locationsApi.create(schoolFilter, { name: form.name, building: form.building, floor: Number(form.floor), capacity: Number(form.capacity), type: form.type }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["locations"] }); toast.success(t("app.save")); closeForm(); },
        onError: () => toast.error(t("app.error")),
    });

    const updateMut = useMutation({
        mutationFn: () => locationsApi.update(editItem!.id, { name: form.name, building: form.building, floor: Number(form.floor), capacity: Number(form.capacity), type: form.type }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["locations"] }); toast.success(t("app.save")); closeForm(); },
        onError: () => toast.error(t("app.error")),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => locationsApi.remove(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["locations"] }); toast.success(t("app.delete")); setDeleteItem(null); },
        onError: () => toast.error(t("app.error")),
    });

    function openCreate() {
        setEditItem(null);
        setForm({ name: "", building: "", floor: "1", capacity: "24", type: "classroom" });
        setFormOpen(true);
    }

    function openEdit(loc: LocationResponse) {
        setEditItem(loc);
        setForm({ name: loc.name, building: loc.building, floor: String(loc.floor), capacity: String(loc.capacity), type: loc.type });
        setFormOpen(true);
    }

    function closeForm() { setFormOpen(false); setEditItem(null); }

    function handleSubmit() {
        if (editItem) updateMut.mutate();
        else createMut.mutate();
    }

    const columns: Column<LocationResponse>[] = [
        { key: "name", header: t("admin.location.name"), sortable: true },
        { key: "building", header: t("admin.location.building"), sortable: true },
        { key: "floor", header: t("admin.location.floor"), sortable: true },
        { key: "capacity", header: t("admin.location.capacity"), sortable: true },
        {
            key: "type",
            header: t("admin.location.type"),
            render: (r) => t(`admin.location.types.${r.type}`),
        },
        {
            key: "_actions",
            header: "",
            render: (r) => (
                <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                        <Pencil size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={(e) => { e.stopPropagation(); setDeleteItem(r); }}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{t("admin.tabs.locations")}</h3>
                    {schools.length > 1 && (
                        <select
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                            className="h-8 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs text-[var(--text-primary)]"
                        >
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreate}>
                    <Plus size={14} /> {t("app.create")}
                </Button>
            </div>

            <DataTable columns={columns} data={locations} isLoading={isLoading} rowKey={(r) => r.id} onRowClick={openEdit} />

            {/* Form Dialog */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editItem ? t("admin.location.editTitle") : t("admin.location.createTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label>{t("admin.location.name")}</Label>
                            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
                        </div>
                        <div>
                            <Label>{t("admin.location.building")}</Label>
                            <Input value={form.building} onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} />
                        </div>
                        <div>
                            <Label>{t("admin.location.floor")}</Label>
                            <Input type="number" value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} />
                        </div>
                        <div>
                            <Label>{t("admin.location.capacity")}</Label>
                            <Input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
                        </div>
                        <div>
                            <Label>{t("admin.location.type")}</Label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                                className="h-9 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-sm text-[var(--text-primary)]"
                            >
                                <option value="classroom">{t("admin.location.types.classroom")}</option>
                                <option value="lab">{t("admin.location.types.lab")}</option>
                                <option value="office">{t("admin.location.types.office")}</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={closeForm}>{t("app.cancel")}</Button>
                        <Button type="button" onClick={handleSubmit} disabled={!form.name.trim()}>{t("app.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("app.confirm")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("admin.location.deleteConfirm", { name: deleteItem?.name })}</AlertDialogDescription>
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
