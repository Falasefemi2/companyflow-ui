"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { levelsApi } from "@/lib/api";
import type { Level } from "@/lib/types";
import { toast } from "sonner";

type ModalMode = "create" | "edit" | "delete";

export function LevelsPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";

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
    setIsLoading(true);
    levelsApi
      .list(companyId, {
        page,
        page_size: pageSize,
        search: search || undefined,
      })
      .then((response) => {
        if (!isMounted) return;
        setLevels(response.data.data ?? []);
        setPagination({
          page: response.data.page,
          total_pages: response.data.total_pages,
          total: response.data.total,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev,
        });
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Failed to load levels");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

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
    } catch (error: any) {
      toast.error(error?.message ?? "Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

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
              <div className="w-8 h-8 rounded-lg bg-linear-to-br`from-primary to-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Levels
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage growth levels and compensation bands
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Level Directory</h2>
              <p className="text-sm text-muted-foreground">
                View and manage levels for this company.
              </p>
              {!companyId && (
                <p className="text-xs text-amber-600 mt-2">
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

          <div className="mt-6 overflow-hidden border border-border/40 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Hierarchy Level</th>
                  <th className="px-4 py-3 font-medium">Max Salary</th>
                  <th className="px-4 py-3 font-medium">Min Salary</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      Loading levels...
                    </td>
                  </tr>
                )}
                {!isLoading && levels.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      No levels found yet.
                    </td>
                  </tr>
                )}
                {levels.map((level) => (
                  <tr
                    key={level.id}
                    className="border-t border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{level.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {level.hierarchy_level ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {level.max_salary ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {level.min_salary ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {level.description || "—"}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="space-y-1 mb-4">
              <h3 className="text-lg font-semibold">
                {modalMode === "create" && "Add Level"}
                {modalMode === "edit" && "Edit Level"}
                {modalMode === "delete" && "Delete Level"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {modalMode === "delete"
                  ? "This action cannot be undone."
                  : "Fill in the details below."}
              </p>
            </div>

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

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeModal}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
