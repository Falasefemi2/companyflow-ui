"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Layers3, Pencil, Plus, Trash2 } from "lucide-react";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { levelsApi } from "@/lib/api";
import type { Level } from "@/lib/types";
import { toast } from "sonner";
import { useResponsiveModal } from "@/hooks/use-responsive-modal";

type ModalMode = "create" | "edit" | "delete";

export function LevelsPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";
  const { isMobile, mounted } = useResponsiveModal();

  const [levels, setLevels] = useState<Level[]>([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    hierarchy_level: "",
    min_salary: "",
    max_salary: "",
    description: "",
  });

  const canFetch = useMemo(() => companyId.length > 0, [companyId]);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    let isMounted = true;

    const fetchLevels = async () => {
      setIsLoading(true);
      try {
        const response = await levelsApi.list(companyId, {
          page,
          page_size: pageSize,
          search: search || undefined,
        });

        if (!isMounted) return;

        setLevels(response.data.data ?? []);
        setPagination({
          page: response.data.page,
          total_pages: response.data.total_pages,
          total: response.data.total,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev,
        });
      } catch (error: unknown) {
        if (!isMounted) return;

        const errorMessage =
          error instanceof Error ? error.message : "Failed to load levels";
        toast.error(errorMessage);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchLevels();

    return () => {
      isMounted = false;
    };
  }, [companyId, canFetch, page, pageSize, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetForm = () => {
    setFormValues({
      name: "",
      hierarchy_level: "",
      min_salary: "",
      max_salary: "",
      description: "",
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveLevel(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (level: Level) => {
    setModalMode("edit");
    setActiveLevel(level);
    setFormValues({
      name: level.name ?? "",
      hierarchy_level:
        typeof level.hierarchy_level === "number"
          ? String(level.hierarchy_level)
          : "",
      min_salary:
        typeof level.min_salary === "number" ? String(level.min_salary) : "",
      max_salary:
        typeof level.max_salary === "number" ? String(level.max_salary) : "",
      description: level.description ?? "",
    });
    setIsModalOpen(true);
  };

  const openDelete = (level: Level) => {
    setModalMode("delete");
    setActiveLevel(level);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Missing company ID. Add ?company_id=... to the URL.");
      return;
    }

    const payload = {
      name: formValues.name,
      hierarchy_level: formValues.hierarchy_level
        ? Number(formValues.hierarchy_level)
        : undefined,
      min_salary: formValues.min_salary
        ? Number(formValues.min_salary)
        : undefined,
      max_salary: formValues.max_salary
        ? Number(formValues.max_salary)
        : undefined,
      description: formValues.description || undefined,
    };

    try {
      if (modalMode === "create") {
        const response = await levelsApi.create(companyId, payload);
        setLevels((prev) => [response.data, ...prev]);
        toast.success("Level created");
        closeModal();
        resetForm();
      }

      if (modalMode === "edit" && activeLevel) {
        const response = await levelsApi.update(activeLevel.id, payload);
        setLevels((prev) =>
          prev.map((item) =>
            item.id === activeLevel.id ? response.data : item,
          ),
        );
        toast.success("Level updated");
        closeModal();
      }

      if (modalMode === "delete" && activeLevel) {
        await levelsApi.delete(activeLevel.id);
        setLevels((prev) => prev.filter((item) => item.id !== activeLevel.id));
        toast.success("Level deleted");
        closeModal();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Action failed";
      toast.error(errorMessage);
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
              <div className="w-8 h-8 rounded-lg bg-linear-to-br` from-primary to-accent flex items-center justify-center">
                <Layers3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Levels
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage growth levels and compensation bands
                </p>
                {!companyId && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                    Provide a company ID via `?company_id=...` or
                    `localStorage.cf_company_id` to load data.
                  </p>
                )}
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
                <h2 className="text-xl font-semibold">Level Directory</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage levels for this company.
                </p>
                {!companyId && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                    Provide a company ID via `?company_id=...` or
                    `localStorage.cf_company_id` to load data.
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search levels"
                  className="md:w-64"
                />
                <Button
                  onClick={openCreate}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Hierarchy Level</TableHead>
                    <TableHead>Min Salary</TableHead>
                    <TableHead>Max Salary</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading levels...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && levels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No levels found yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell className="font-medium">
                        {level.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {level.hierarchy_level ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {level.min_salary ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {level.max_salary ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {level.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(level)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDelete(level)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
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
                Page {pagination.page} of {pagination.total_pages} ·{" "}
                {pagination.total} total
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
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(pagination.total_pages, prev + 1),
                    )
                  }
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
              <DialogTitle>
                {modalMode === "create" && "Add Level"}
                {modalMode === "edit" && "Edit Level"}
                {modalMode === "delete" && "Delete Level"}
              </DialogTitle>
              <DialogDescription>
                {modalMode === "delete"
                  ? "This action cannot be undone."
                  : "Fill in the details below."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {modalMode !== "delete" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="L1"
                    />
                    {!formValues.name && (
                      <FieldError errors={[{ message: "Name is required" }]} />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Hierarchy Level</FieldLabel>
                    <Input
                      value={formValues.hierarchy_level}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          hierarchy_level: event.target.value,
                        }))
                      }
                      placeholder="1"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Min Salary</FieldLabel>
                    <Input
                      value={formValues.min_salary}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          min_salary: event.target.value,
                        }))
                      }
                      placeholder="80000"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Max Salary</FieldLabel>
                    <Input
                      value={formValues.max_salary}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          max_salary: event.target.value,
                        }))
                      }
                      placeholder="150000"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={formValues.description}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Entry-level role with core responsibilities."
                    />
                  </Field>
                </FieldGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {activeLevel?.name}
                  </span>
                  ?
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={modalMode === "delete" ? "destructive" : "default"}
                onClick={handleSubmit}
                disabled={
                  modalMode !== "delete" && (!formValues.name || !companyId)
                }
              >
                {modalMode === "create" && "Create Level"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Level"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isModalOpen && mounted} onOpenChange={setIsModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {modalMode === "create" && "Add Level"}
                {modalMode === "edit" && "Edit Level"}
                {modalMode === "delete" && "Delete Level"}
              </DrawerTitle>
              <DrawerDescription>
                {modalMode === "delete"
                  ? "This action cannot be undone."
                  : "Fill in the details below."}
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 py-4 space-y-4">
              {modalMode !== "delete" ? (
                <FieldGroup>
                  <Field>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      value={formValues.name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Senior"
                    />
                    {!formValues.name && (
                      <FieldError errors={[{ message: "Name is required" }]} />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Hierarchy Level</FieldLabel>
                    <Input
                      value={formValues.hierarchy_level}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          hierarchy_level: event.target.value,
                        }))
                      }
                      placeholder="5"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Min Salary</FieldLabel>
                    <Input
                      value={formValues.min_salary}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          min_salary: event.target.value,
                        }))
                      }
                      placeholder="100000"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Max Salary</FieldLabel>
                    <Input
                      value={formValues.max_salary}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          max_salary: event.target.value,
                        }))
                      }
                      placeholder="150000"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                      value={formValues.description}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Senior-level role with leadership responsibilities."
                    />
                  </Field>
                </FieldGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {activeLevel?.name}
                  </span>
                  ?
                </p>
              )}
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                variant={modalMode === "delete" ? "destructive" : "default"}
                onClick={handleSubmit}
                disabled={
                  modalMode !== "delete" && (!formValues.name || !companyId)
                }
              >
                {modalMode === "create" && "Create Level"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Level"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
