"use client";

import { roleApi } from "@/lib/api";
import { Role } from "@/lib/types";
import { ArrowLeft, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type ModalMode = "create" | "edit" | "delete";

export function RolesPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";

  const [roles, setRoles] = useState<Role[]>([]);
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

  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    permissions_cache: string[];
  }>({
    name: "",
    description: "",
    permissions_cache: [],
  });

  useEffect(() => {
    if (!companyId) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      roleApi.list(companyId, {
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
    ])
      .then(([rolesResponse]) => {
        if (!isMounted) return;

        setRoles(rolesResponse.data.data ?? []);
        setPagination({
          page: rolesResponse.data.page,
          total_pages: rolesResponse.data.total_pages,
          total: rolesResponse.data.total,
          has_next: rolesResponse.data.has_next,
          has_prev: rolesResponse.data.has_prev,
        });
      })
      .catch((error: any) => {
        toast.error(error?.message ?? "Failed to load roles");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId, page, pageSize, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const roleLookup = useMemo(() => {
    return new Map(roles.map((role) => [role.id, role]));
  }, [roles]);

  const resetForm = () => {
    setFormValues({
      name: "",
      description: "",
      permissions_cache: [],
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveRole(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setModalMode("edit");
    setActiveRole(role);
    setFormValues({
      name: role.name ?? "",
      description: role.description ?? "",
      permissions_cache: role.permission_cache ?? [],
    });
    setIsModalOpen(true);
  };

  const openDelete = (role: Role) => {
    setModalMode("delete");
    setActiveRole(role);
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
        const response = await roleApi.create(companyId, {
          name: formValues.name,
          description: formValues.description || "",
          permissions_cache: formValues.permissions_cache,
        });
        setRoles((prev) => [response.data, ...prev]);
        toast.success("Role created");
        closeModal();
        resetForm();
      }

      if (modalMode === "edit" && activeRole) {
        const response = await roleApi.update(activeRole.id, {
          name: formValues.name,
          description: formValues.description || undefined,
          permission_cache: formValues.permissions_cache,
        });
        setRoles((prev) =>
          prev.map((item) =>
            item.id === activeRole.id ? response.data : item,
          ),
        );
        toast.success("Role updated");
        closeModal();
      }

      if (modalMode === "delete" && activeRole) {
        await roleApi.delete(activeRole.id);
        setRoles((prev) => prev.filter((item) => item.id !== activeRole.id));
        toast.success("Role deleted");
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
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Roles
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage roles and permissions across the company
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
              <h2 className="text-xl font-semibold">Roles Directory</h2>
              <p className="text-sm text-muted-foreground">
                View and manage roles for this company.
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
                placeholder="Search roles"
                className="md:w-64"
              />
              <Button
                onClick={openCreate}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-hidden border border-border/40 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Permissions</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                      Loading roles...
                    </td>
                  </tr>
                )}
                {!isLoading && roles.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={4}>
                      No roles found yet.
                    </td>
                  </tr>
                )}
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-t border-border/20 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{role.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {role.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {role.permission_cache &&
                        role.permission_cache.length > 0
                          ? role.permission_cache
                              .slice(0, 2)
                              .map((perm, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-1 text-xs font-medium"
                                >
                                  {perm}
                                </span>
                              ))
                          : "—"}
                        {role.permission_cache &&
                          role.permission_cache.length > 2 && (
                            <span className="inline-flex items-center rounded-full bg-secondary/50 px-2 py-1 text-xs font-medium">
                              +{role.permission_cache.length - 2}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(role)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDelete(role)}
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
                  setPage((prev) => Math.min(pagination.total_pages, prev + 1))
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
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="space-y-1 mb-4">
              <h3 className="text-lg font-semibold">
                {modalMode === "create" && "Add Role"}
                {modalMode === "edit" && "Edit Role"}
                {modalMode === "delete" && "Delete Role"}
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
                    placeholder="Administrator"
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
                    placeholder="Full system access and management capabilities."
                  />
                </Field>
                <Field>
                  <FieldLabel>Permissions</FieldLabel>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-border/40 rounded-lg p-3">
                    {/* Add your permissions list here - checkbox options */}
                    <div className="text-sm text-muted-foreground">
                      {formValues.permissions_cache.length === 0
                        ? "No permissions selected"
                        : `${formValues.permissions_cache.length} permission(s) selected`}
                    </div>
                  </div>
                </Field>
              </FieldGroup>
            ) : (
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {activeRole?.name}
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
                {modalMode === "create" && "Create Role"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Role"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
