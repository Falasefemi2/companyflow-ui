"use client";

import React, { useEffect, useState } from "react";
import { leaveTypesApi } from "@/lib/api";
import { LeaveType } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "./ui/drawer";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useResponsiveModal } from "@/hooks/use-responsive-modal";

type ModalMode = "create" | "edit" | "delete";

export function LeaveTypesPage() {
    const searchParams = useSearchParams();
    const queryCompanyId = searchParams.get("company_id");
    const storedCompanyId =
        typeof window !== "undefined"
            ? window.localStorage.getItem("cf_company_id")
            : null;
    const companyId = queryCompanyId || storedCompanyId || "";
    const { isMobile, mounted } = useResponsiveModal();

    const [items, setItems] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [pagination, setPagination] = useState({
        page: 1,
        total_pages: 1,
        total: 0,
        has_next: false,
        has_prev: false,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>("create");
    const [active, setActive] = useState<LeaveType | null>(null);

    const [formValues, setFormValues] = useState({
        name: "",
        code: "",
        description: "",
        daysAllowed: 0,
        isPaid: true,
        carryForwardAllowed: false,
        maxCarryForwardDays: 0,
        colorCode: "",
        requiresDocumentation: false,
        status: "active",
    });

    useEffect(() => {
        if (!companyId) return;
        let mounted = true;
        const fetch = async () => {
            setIsLoading(true);
            try {
                const res = await leaveTypesApi.list(companyId, { page, page_size: pageSize, search: search || undefined });
                if (!mounted) return;
                setItems(res.data.data ?? []);
                setPagination({
                    page: res.data.page,
                    total_pages: res.data.total_pages,
                    total: res.data.total,
                    has_next: res.data.has_next,
                    has_prev: res.data.has_prev,
                });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to load leave types";
                toast.error(msg);
            } finally {
                if (!mounted) return;
                setIsLoading(false);
            }
        };
        fetch();
        return () => {
            mounted = false;
        };
    }, [companyId, search, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => setFormValues((v) => ({ ...v })), [active]);

    const openCreate = () => {
        setModalMode("create");
        setActive(null);
        setFormValues({
            name: "",
            code: "",
            description: "",
            daysAllowed: 0,
            isPaid: true,
            carryForwardAllowed: false,
            maxCarryForwardDays: 0,
            colorCode: "",
            requiresDocumentation: false,
            status: "active",
        });
        setIsModalOpen(true);
    };

    const openEdit = (item: LeaveType) => {
        setModalMode("edit");
        setActive(item);
        setFormValues({
            name: item.name ?? "",
            code: item.code ?? "",
            description: item.description ?? "",
            daysAllowed: item.daysAllowed ?? 0,
            isPaid: item.isPaid ?? true,
            carryForwardAllowed: item.carryForwardAllowed ?? false,
            maxCarryForwardDays: item.maxCarryForwardDays ?? 0,
            colorCode: item.colorCode ?? "",
            requiresDocumentation: item.requiresDocumentation ?? false,
            status: item.status ?? "active",
        });
        setIsModalOpen(true);
    };

    const openDelete = (item: LeaveType) => {
        setModalMode("delete");
        setActive(item);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async () => {
        if (!companyId) {
            toast.error("Missing company ID. Add ?company_id=... or set localStorage.cf_company_id");
            return;
        }

        try {
            if (modalMode === "create") {
                const res = await leaveTypesApi.create(companyId, {
                    name: formValues.name,
                    code: formValues.code || undefined,
                    description: formValues.description || undefined,
                    daysAllowed: formValues.daysAllowed || undefined,
                    isPaid: formValues.isPaid,
                    carryForwardAllowed: formValues.carryForwardAllowed,
                    maxCarryForwardDays: formValues.maxCarryForwardDays || undefined,
                    colorCode: formValues.colorCode || undefined,
                    requiresDocumentation: formValues.requiresDocumentation,
                    status: formValues.status || undefined,
                });
                setItems((prev) => [res.data, ...prev]);
                toast.success("Leave type created");
                closeModal();
            }

            if (modalMode === "edit" && active) {
                const res = await leaveTypesApi.update(active.id, {
                    name: formValues.name,
                    code: formValues.code || undefined,
                    description: formValues.description || undefined,
                    daysAllowed: formValues.daysAllowed || undefined,
                    isPaid: formValues.isPaid,
                    carryForwardAllowed: formValues.carryForwardAllowed,
                    maxCarryForwardDays: formValues.maxCarryForwardDays || undefined,
                    colorCode: formValues.colorCode || undefined,
                    requiresDocumentation: formValues.requiresDocumentation,
                    status: formValues.status || undefined,
                });
                setItems((prev) => prev.map((it) => (it.id === active.id ? res.data : it)));
                toast.success("Leave type updated");
                closeModal();
            }

            if (modalMode === "delete" && active) {
                await leaveTypesApi.delete(active.id);
                setItems((prev) => prev.filter((it) => it.id !== active.id));
                toast.success("Leave type deleted");
                closeModal();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Action failed";
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen bg-background dark:bg-background">
            <div className="relative z-10">
                <div className="border-b border-border/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
                                aria-label="Back to dashboard"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-balance">Leave Types</h1>
                                <p className="text-sm text-muted-foreground">Manage leave categories for this company.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="border border-border/50 bg-card">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Leave Types</h2>
                                <p className="text-sm text-muted-foreground">Create and manage leave categories.</p>
                                {!companyId && (
                                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                                        Provide a company ID via `?company_id=...` or `localStorage.cf_company_id` to load data.
                                    </p>
                                )}
                            </div>
                            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leave types" className="md:w-64" />
                                <Button onClick={openCreate} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10">
                                    <Plus className="w-4 h-4 mr-2" /> Add Leave Type
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-border/50 rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Requires Doc</TableHead>
                                        <TableHead>Carry Forward</TableHead>
                                        <TableHead>Max CF</TableHead>
                                        <TableHead>Color</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">No leave types found.</TableCell>
                                        </TableRow>
                                    )}
                                    {items.map((it) => (
                                        <TableRow key={it.id}>
                                            <TableCell className="font-medium">{it.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.code || "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.daysAllowed ?? "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.isPaid ? "Yes" : "No"}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.requiresDocumentation ? "Yes" : "No"}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.carryForwardAllowed ? "Yes" : "No"}</TableCell>
                                            <TableCell className="text-muted-foreground">{it.maxCarryForwardDays ?? "—"}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {it.colorCode ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: it.colorCode }} />
                                                        <span>{it.colorCode}</span>
                                                    </div>
                                                ) : (
                                                    "—"
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{it.description ? (it.description.length > 60 ? it.description.slice(0, 60) + "…" : it.description) : "—"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(it)}>
                                                        <Pencil className="w-4 h-4 mr-1" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => openDelete(it)}>
                                                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                Page {pagination.page} of {pagination.total_pages} · {pagination.total} total
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={!pagination.has_prev}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                                    disabled={!pagination.has_next}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {mounted && !isMobile ? (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{modalMode === "create" ? "Add Leave Type" : modalMode === "edit" ? "Edit Leave Type" : "Delete Leave Type"}</DialogTitle>
                            <DialogDescription>
                                {modalMode === "delete" ? "This action cannot be undone." : "Fill in the details below."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {modalMode !== "delete" ? (
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Name</FieldLabel>
                                        <Input value={formValues.name} onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))} placeholder="Sick Leave" />
                                        {!formValues.name && <FieldError errors={[{ message: "Name is required" }]} />}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Code</FieldLabel>
                                        <Input value={formValues.code} onChange={(e) => setFormValues((prev) => ({ ...prev, code: e.target.value }))} placeholder="SL" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Days Allowed</FieldLabel>
                                        <Input type="number" value={String(formValues.daysAllowed)} onChange={(e) => setFormValues((prev) => ({ ...prev, daysAllowed: Number(e.target.value) }))} />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea value={formValues.description} onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))} />
                                    </Field>
                                </FieldGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-semibold text-foreground">{active?.name}</span>?</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant={modalMode === "delete" ? "destructive" : "default"} onClick={handleSubmit} disabled={modalMode !== "delete" && (!formValues.name || !companyId)}>
                                {modalMode === "create" && "Create"}
                                {modalMode === "edit" && "Save Changes"}
                                {modalMode === "delete" && "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <Drawer open={isModalOpen && mounted} onOpenChange={setIsModalOpen}>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{modalMode === "create" ? "Add Leave Type" : modalMode === "edit" ? "Edit Leave Type" : "Delete Leave Type"}</DrawerTitle>
                        </DrawerHeader>
                        <div className="px-4 py-4 space-y-4">
                            {modalMode !== "delete" ? (
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Name</FieldLabel>
                                        <Input value={formValues.name} onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))} placeholder="Sick Leave" />
                                        {!formValues.name && <FieldError errors={[{ message: "Name is required" }]} />}
                                    </Field>
                                    <Field>
                                        <FieldLabel>Code</FieldLabel>
                                        <Input value={formValues.code} onChange={(e) => setFormValues((prev) => ({ ...prev, code: e.target.value }))} placeholder="SL" />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Days Allowed</FieldLabel>
                                        <Input type="number" value={String(formValues.daysAllowed)} onChange={(e) => setFormValues((prev) => ({ ...prev, daysAllowed: Number(e.target.value) }))} />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea value={formValues.description} onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))} />
                                    </Field>
                                </FieldGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground">Are you sure you want to delete <span className="font-semibold text-foreground">{active?.name}</span>?</p>
                            )}
                        </div>

                        <DrawerFooter>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant={modalMode === "delete" ? "destructive" : "default"} onClick={handleSubmit} disabled={modalMode !== "delete" && (!formValues.name || !companyId)}>
                                {modalMode === "create" && "Create"}
                                {modalMode === "edit" && "Save Changes"}
                                {modalMode === "delete" && "Delete"}
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            )}
        </div>
    );
}

export default LeaveTypesPage;
