"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { departmentsApi } from "@/lib/api";
import type { Department } from "@/lib/types";
import { toast } from "sonner";

type ModalMode = "create" | "edit" | "delete";

export function DepartmentsPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";

  const [departments, setDepartments] = useState<Department[]>([]);
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
  const [activeDepartment, setActiveDepartment] =
    useState<Department | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    code: "",
    description: "",
  });

  const canFetch = useMemo(() => companyId.length > 0, [companyId]);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    const trimmedSearch = search.trim();
    const params = trimmedSearch
      ? { page, search: trimmedSearch }
      : { page, page_size: pageSize };

    departmentsApi
      .list(companyId, params)
      .then((response) => {
        if (!isMounted) return;
        setDepartments(response.data.data ?? []);
        setPagination({
          page: response.data.page,
          total_pages: response.data.total_pages,
          total: response.data.total,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev,
        });
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Failed to load departments");
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
    setFormValues({ name: "", code: "", description: "" });
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveDepartment(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (department: Department) => {
    setModalMode("edit");
    setActiveDepartment(department);
    setFormValues({
      name: department.name ?? "",
      code: department.code ?? "",
      description: department.description ?? "",
    });
    setIsModalOpen(true);
  };

  const openDelete = (department: Department) => {
    setModalMode("delete");
    setActiveDepartment(department);
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

    try {
      if (modalMode === "create") {
        const response = await departmentsApi.create(companyId, {
          name: formValues.name,
          code: formValues.code || undefined,
          description: formValues.description || undefined,
          status: "active",
        });
        setDepartments((prev) => [response.data, ...prev]);
        toast.success("Department created");
        closeModal();
        resetForm();
      }

      if (modalMode === "edit" && activeDepartment) {
        const response = await departmentsApi.update(activeDepartment.id, {
          name: formValues.name,
          code: formValues.code || undefined,
          description: formValues.description || undefined,
        });
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === activeDepartment.id ? response.data : dept,
          ),
        );
        toast.success("Department updated");
        closeModal();
      }

      if (modalMode === "delete" && activeDepartment) {
        await departmentsApi.delete(activeDepartment.id);
        setDepartments((prev) =>
          prev.filter((dept) => dept.id !== activeDepartment.id),
        );
        toast.success("Department deleted");
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
                  Departments
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage company department structure
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
              <h2 className="text-xl font-semibold">Department Directory</h2>
              <p className="text-sm text-muted-foreground">
                View and manage departments for this company.
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
                placeholder="Search departments"
                className="md:w-64"
              />
              <Button
                onClick={openCreate}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden border border-border/40 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                      Loading departments...
                    </td>
                  </tr>
                )}
                {!isLoading && departments.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                      No departments found yet.
                    </td>
                  </tr>
                )}
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-t border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {department.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {department.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {department.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(department)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(department)}
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
                {modalMode === "create" && "Add Department"}
                {modalMode === "edit" && "Edit Department"}
                {modalMode === "delete" && "Delete Department"}
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
                    placeholder="Engineering"
                  />
                  {!formValues.name && (
                    <FieldError errors={[{ message: "Name is required" }]} />
                  )}
                </Field>
                <Field>
                  <FieldLabel>Code</FieldLabel>
                  <Input
                    value={formValues.code}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        code: event.target.value,
                      }))
                    }
                    placeholder="ENG"
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
                    placeholder="Handles product development and engineering."
                  />
                </Field>
              </FieldGroup>
            ) : (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {activeDepartment?.name}
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
                {modalMode === "create" && "Create Department"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Department"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
