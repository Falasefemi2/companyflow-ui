"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
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
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { departmentsApi, designationsApi, levelsApi } from "@/lib/api";
import type { Department, Designation, Level } from "@/lib/types";
import { toast } from "sonner";

type ModalMode = "create" | "edit" | "delete";

export function DesignationsPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";

  const [designations, setDesignations] = useState<Designation[]>([]);
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
  const [levels, setLevels] = useState<Level[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [activeDesignation, setActiveDesignation] =
    useState<Designation | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    level_id: "",
    department_id: "",
  });

  const canFetch = useMemo(() => companyId.length > 0, [companyId]);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    designationsApi
      .list(companyId, {
        page,
        page_size: pageSize,
        search: search || undefined,
      })
      .then((response) => {
        if (!isMounted) return;
        setDesignations(response.data.data ?? []);
        setPagination({
          page: response.data.page,
          total_pages: response.data.total_pages,
          total: response.data.total,
          has_next: response.data.has_next,
          has_prev: response.data.has_prev,
        });
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Failed to load designations");
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

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    let isMounted = true;
    setIsMetaLoading(true);

    Promise.all([
      levelsApi.list(companyId, { page: 1, page_size: 200 }),
      departmentsApi.list(companyId, { page: 1, page_size: 200 }),
    ])
      .then(([levelsResponse, departmentsResponse]) => {
        if (!isMounted) return;
        setLevels(levelsResponse.data.data ?? []);
        setDepartments(departmentsResponse.data.data ?? []);
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Failed to load departments or levels");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsMetaLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, canFetch]);

  const levelLookup = useMemo(() => {
    return new Map(levels.map((level) => [level.id, level]));
  }, [levels]);

  const departmentLookup = useMemo(() => {
    return new Map(departments.map((dept) => [dept.id, dept]));
  }, [departments]);

  const resetForm = () => {
    setFormValues({
      name: "",
      description: "",
      level_id: "",
      department_id: "",
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveDesignation(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (designation: Designation) => {
    setModalMode("edit");
    setActiveDesignation(designation);
    setFormValues({
      name: designation.name ?? "",
      description: designation.description ?? "",
      level_id: designation.level_id ?? "",
      department_id: designation.department_id ?? "",
    });
    setIsModalOpen(true);
  };

  const openDelete = (designation: Designation) => {
    setModalMode("delete");
    setActiveDesignation(designation);
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
        const response = await designationsApi.create(companyId, {
          name: formValues.name,
          description: formValues.description || undefined,
          level_id: formValues.level_id || undefined,
          department_id: formValues.department_id || undefined,
          status: "active",
        });
        setDesignations((prev) => [response.data, ...prev]);
        toast.success("Designation created");
        closeModal();
        resetForm();
      }

      if (modalMode === "edit" && activeDesignation) {
        const response = await designationsApi.update(activeDesignation.id, {
          name: formValues.name,
          description: formValues.description || undefined,
          level_id: formValues.level_id || undefined,
          department_id: formValues.department_id || undefined,
        });
        setDesignations((prev) =>
          prev.map((item) =>
            item.id === activeDesignation.id ? response.data : item,
          ),
        );
        toast.success("Designation updated");
        closeModal();
      }

      if (modalMode === "delete" && activeDesignation) {
        await designationsApi.delete(activeDesignation.id);
        setDesignations((prev) =>
          prev.filter((item) => item.id !== activeDesignation.id),
        );
        toast.success("Designation deleted");
        closeModal();
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Action failed");
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Designations
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage roles and titles across the company
                </p>
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
                <h2 className="text-xl font-semibold">Designation Directory</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage designations for this company.
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
                  placeholder="Search designations"
                  className="md:w-64"
                />
                <Button
                  onClick={openCreate}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Designation
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading designations...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && designations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No designations found yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {designations.map((designation) => (
                    <TableRow key={designation.id}>
                      <TableCell className="font-medium">
                        {designation.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {designation.description || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {designation.level_id
                          ? levelLookup.get(designation.level_id)?.name ??
                            designation.level_id
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {designation.department_id
                          ? departmentLookup.get(designation.department_id)?.name ??
                            designation.department_id
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(designation)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDelete(designation)}
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

      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {modalMode === "create" && "Add Designation"}
              {modalMode === "edit" && "Edit Designation"}
              {modalMode === "delete" && "Delete Designation"}
            </DrawerTitle>
            <DrawerDescription>
              {modalMode === "delete"
                ? "This action cannot be undone."
                : "Fill in the details below."}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody>
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
                    placeholder="Software Engineer"
                  />
                  {!formValues.name && (
                    <FieldError errors={[{ message: "Name is required" }]} />
                  )}
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
                    placeholder="Handles backend services and APIs."
                  />
                </Field>
                <Field>
                  <FieldLabel>Level</FieldLabel>
                  <Select
                    value={formValues.level_id}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        level_id: event.target.value,
                      }))
                    }
                    disabled={isMetaLoading || !companyId}
                  >
                    <option value="">Select level</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <Select
                    value={formValues.department_id}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        department_id: event.target.value,
                      }))
                    }
                    disabled={isMetaLoading || !companyId}
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FieldGroup>
            ) : (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {activeDesignation?.name}
                </span>
                ?
              </p>
            )}
          </DrawerBody>

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
              {modalMode === "create" && "Create Designation"}
              {modalMode === "edit" && "Save Changes"}
              {modalMode === "delete" && "Delete Designation"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
