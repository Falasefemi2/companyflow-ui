"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Trash2, Users2 } from "lucide-react";
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
import {
  departmentsApi,
  designationsApi,
  employeesApi,
  levelsApi,
  roleApi,
} from "@/lib/api";
import {
  Role,
  type Department,
  type Designation,
  type Employee,
  type Level,
} from "@/lib/types";
import { toast } from "sonner";
import { useResponsiveModal } from "@/hooks/use-responsive-modal";

type ModalMode = "create" | "edit" | "delete";

type EmployeeFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_code: string;
  employment_type: NonNullable<Employee["employment_type"]>;
  status: NonNullable<Employee["status"]>;
  department_id: string;
  designation_id: string;
  level_id: string;
  manager_id: string;
  role_id: string;
  gender: string;
  hire_date: string;
  date_of_birth: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  profile_image_url: string;
  password: string;
};

const employmentOptions: Employee["employment_type"][] = [
  "full_time",
  "part_time",
  "contract",
  "intern",
];

const statusOptions: Employee["status"][] = [
  "active",
  "inactive",
  "on_leave",
  "terminated",
  "probation",
];

export function EmployeesPage() {
  const searchParams = useSearchParams();
  const queryCompanyId = searchParams.get("company_id");
  const storedCompanyId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_company_id")
      : null;
  const companyId = queryCompanyId || storedCompanyId || "";
  const { isMobile, mounted } = useResponsiveModal();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
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
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [formValues, setFormValues] = useState<EmployeeFormValues>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_code: "",
    employment_type: "full_time",
    status: "active",
    department_id: "",
    designation_id: "",
    level_id: "",
    manager_id: "",
    role_id: "",
    gender: "",
    hire_date: "",
    date_of_birth: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    profile_image_url: "",
    password: "",
  });

  const canFetch = useMemo(() => companyId.length > 0, [companyId]);

  useEffect(() => {
    if (!canFetch) return;

    let isMounted = true;

    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const trimmedSearch = search.trim();
        const params = trimmedSearch
          ? { page, search: trimmedSearch }
          : { page, page_size: pageSize };

        const response = await employeesApi.list(companyId, params);

        if (!isMounted) return;

        setEmployees(response.data.data ?? []);
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
          error instanceof Error ? error.message : "Failed to load employees";
        toast.error(errorMessage);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [companyId, canFetch, page, pageSize, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!canFetch) return;

    let isMounted = true;

    const fetchMetadata = async () => {
      setIsMetaLoading(true);
      try {
        const [
          levelsResponse,
          departmentsResponse,
          designationsResponse,
          roleResponse,
        ] = await Promise.all([
          levelsApi.list(companyId, { page: 1, page_size: 200 }),
          departmentsApi.list(companyId, { page: 1, page_size: 200 }),
          designationsApi.list(companyId, { page: 1, page_size: 200 }),
          roleApi.list(companyId, { page: 1, page_size: 200 }),
        ]);

        if (!isMounted) return;

        setLevels(levelsResponse.data.data ?? []);
        setDepartments(departmentsResponse.data.data ?? []);
        setDesignations(designationsResponse.data.data ?? []);
        setRoles(roleResponse.data.data ?? []);
      } catch (error: unknown) {
        if (!isMounted) return;

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load employee metadata";
        toast.error(errorMessage);
      } finally {
        if (!isMounted) return;
        setIsMetaLoading(false);
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [companyId, canFetch]);

  const levelLookup = useMemo(
    () => new Map(levels.map((level) => [level.id, level])),
    [levels],
  );
  const departmentLookup = useMemo(
    () => new Map(departments.map((dept) => [dept.id, dept])),
    [departments],
  );
  const designationLookup = useMemo(
    () => new Map(designations.map((item) => [item.id, item])),
    [designations],
  );
  const roleLookup = useMemo(
    () => new Map(roles.map((item) => [item.id, item])),
    [roles],
  );

  const resetForm = () => {
    setFormValues({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_code: "",
      employment_type: "full_time",
      status: "active",
      department_id: "",
      designation_id: "",
      level_id: "",
      manager_id: "",
      role_id: "",
      gender: "",
      hire_date: "",
      date_of_birth: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      profile_image_url: "",
      password: "",
    });
  };

  const openCreate = () => {
    setModalMode("create");
    setActiveEmployee(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setModalMode("edit");
    setActiveEmployee(employee);
    setFormValues({
      first_name: employee.first_name ?? "",
      last_name: employee.last_name ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      employee_code: employee.employee_code ?? "",
      employment_type: employee.employment_type ?? "full_time",
      status: employee.status ?? "active",
      department_id: employee.department_id ?? "",
      designation_id: employee.designation_id ?? "",
      level_id: employee.level_id ?? "",
      manager_id: employee.manager_id ?? "",
      role_id: employee.role_id ?? "",
      gender: employee.gender ?? "",
      hire_date: employee.hire_date ?? "",
      date_of_birth: employee.date_of_birth ?? "",
      address: employee.address ?? "",
      emergency_contact_name: employee.emergency_contact_name ?? "",
      emergency_contact_phone: employee.emergency_contact_phone ?? "",
      profile_image_url: employee.profile_image_url ?? "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const openDelete = (employee: Employee) => {
    setModalMode("delete");
    setActiveEmployee(employee);
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
        const response = await employeesApi.create(companyId, {
          ...formValues,
          status: formValues.status || undefined,
          employment_type: formValues.employment_type || undefined,
          department_id: formValues.department_id || undefined,
          designation_id: formValues.designation_id || undefined,
          level_id: formValues.level_id || undefined,
          manager_id: formValues.manager_id || undefined,
          role_id: formValues.role_id || undefined,
          gender: formValues.gender || undefined,
          hire_date: formValues.hire_date || undefined,
          date_of_birth: formValues.date_of_birth || undefined,
          address: formValues.address || undefined,
          emergency_contact_name:
            formValues.emergency_contact_name || undefined,
          emergency_contact_phone:
            formValues.emergency_contact_phone || undefined,
          profile_image_url: formValues.profile_image_url || undefined,
          password: formValues.password || undefined,
        });
        setEmployees((prev) => [response.data, ...prev]);
        toast.success("Employee created");
        closeModal();
        resetForm();
      }

      if (modalMode === "edit" && activeEmployee) {
        const response = await employeesApi.update(activeEmployee.id, {
          ...formValues,
          status: formValues.status || undefined,
          employment_type: formValues.employment_type || undefined,
          department_id: formValues.department_id || undefined,
          designation_id: formValues.designation_id || undefined,
          level_id: formValues.level_id || undefined,
          manager_id: formValues.manager_id || undefined,
          role_id: formValues.role_id || undefined,
          gender: formValues.gender || undefined,
          hire_date: formValues.hire_date || undefined,
          date_of_birth: formValues.date_of_birth || undefined,
          address: formValues.address || undefined,
          emergency_contact_name:
            formValues.emergency_contact_name || undefined,
          emergency_contact_phone:
            formValues.emergency_contact_phone || undefined,
          profile_image_url: formValues.profile_image_url || undefined,
          password: formValues.password || undefined,
        });
        setEmployees((prev) =>
          prev.map((item) =>
            item.id === activeEmployee.id ? response.data : item,
          ),
        );
        toast.success("Employee updated");
        closeModal();
      }

      if (modalMode === "delete" && activeEmployee) {
        await employeesApi.delete(activeEmployee.id);
        setEmployees((prev) =>
          prev.filter((item) => item.id !== activeEmployee.id),
        );
        toast.success("Employee deleted");
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
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <Users2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Employees
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage employee profiles across the company
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
                <h2 className="text-xl font-semibold">Employee Directory</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage employees for this company.
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
                  placeholder="Search employees"
                  className="md:w-64"
                />
                <Button
                  onClick={openCreate}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading employees...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No employees found yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.first_name || employee.last_name
                          ? `${employee.first_name ?? ""} ${
                              employee.last_name ?? ""
                            }`.trim()
                          : employee.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.department_id
                          ? (departmentLookup.get(employee.department_id)
                              ?.name ?? employee.department_id)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.designation_id
                          ? (designationLookup.get(employee.designation_id)
                              ?.name ?? employee.designation_id)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.level_id
                          ? (levelLookup.get(employee.level_id)?.name ??
                            employee.level_id)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(employee)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDelete(employee)}
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
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {modalMode === "create" && "Add Employee"}
                {modalMode === "edit" && "Edit Employee"}
                {modalMode === "delete" && "Delete Employee"}
              </DialogTitle>
              <DialogDescription>
                {modalMode === "delete"
                  ? "This action cannot be undone."
                  : "Fill in the details below."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
              {modalMode !== "delete" ? (
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>First Name</FieldLabel>
                    <Input
                      value={formValues.first_name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          first_name: event.target.value,
                        }))
                      }
                      placeholder="Femi"
                    />
                    {!formValues.first_name && (
                      <FieldError
                        errors={[{ message: "First name is required" }]}
                      />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Last Name</FieldLabel>
                    <Input
                      value={formValues.last_name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          last_name: event.target.value,
                        }))
                      }
                      placeholder="Falase"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      type="email"
                      value={formValues.email}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="name@company.com"
                    />
                    {!formValues.email && (
                      <FieldError errors={[{ message: "Email is required" }]} />
                    )}
                  </Field>
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input
                      value={formValues.phone}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+234..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Employee Code</FieldLabel>
                    <Input
                      value={formValues.employee_code}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          employee_code: event.target.value,
                        }))
                      }
                      placeholder="EMP-001"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Employment Type</FieldLabel>
                    <Select
                      value={formValues.employment_type}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          employment_type: event.target.value as NonNullable<
                            Employee["employment_type"]
                          >,
                        }))
                      }
                    >
                      {employmentOptions.map((option) => (
                        <option key={option} value={option}>
                          {option?.replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={formValues.status}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          status: event.target.value as NonNullable<
                            Employee["status"]
                          >,
                        }))
                      }
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option?.replace("_", " ")}
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
                  <Field>
                    <FieldLabel>Designation</FieldLabel>
                    <Select
                      value={formValues.designation_id}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          designation_id: event.target.value,
                        }))
                      }
                      disabled={isMetaLoading || !companyId}
                    >
                      <option value="">Select designation</option>
                      {designations.map((designation) => (
                        <option key={designation.id} value={designation.id}>
                          {designation.name}
                        </option>
                      ))}
                    </Select>
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
                    <FieldLabel>Manager</FieldLabel>
                    <Select
                      value={formValues.manager_id}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          manager_id: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select manager</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Role</FieldLabel>
                    <Select
                      value={formValues.role_id}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          role_id: event.target.value,
                        }))
                      }
                      disabled={isMetaLoading || !companyId}
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Gender</FieldLabel>
                    <Input
                      value={formValues.gender}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          gender: event.target.value,
                        }))
                      }
                      placeholder="Male / Female"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Hire Date</FieldLabel>
                    <Input
                      type="date"
                      value={formValues.hire_date}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          hire_date: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Date of Birth</FieldLabel>
                    <Input
                      type="date"
                      value={formValues.date_of_birth}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          date_of_birth: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Address</FieldLabel>
                    <Textarea
                      value={formValues.address}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          address: event.target.value,
                        }))
                      }
                      placeholder="Employee address"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Emergency Contact Name</FieldLabel>
                    <Input
                      value={formValues.emergency_contact_name}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          emergency_contact_name: event.target.value,
                        }))
                      }
                      placeholder="Contact name"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Emergency Contact Phone</FieldLabel>
                    <Input
                      value={formValues.emergency_contact_phone}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          emergency_contact_phone: event.target.value,
                        }))
                      }
                      placeholder="+234..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Profile Image URL</FieldLabel>
                    <Input
                      value={formValues.profile_image_url}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          profile_image_url: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      type="password"
                      value={formValues.password}
                      onChange={(event) =>
                        setFormValues((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Set password"
                    />
                  </Field>
                </FieldGroup>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    {activeEmployee?.first_name ?? ""}{" "}
                    {activeEmployee?.last_name ?? ""}
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
                  modalMode !== "delete" &&
                  (!formValues.first_name || !formValues.email || !companyId)
                }
              >
                {modalMode === "create" && "Create Employee"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Employee"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isModalOpen && mounted} onOpenChange={setIsModalOpen}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader>
              <DrawerTitle>
                {modalMode === "create" && "Add Employee"}
                {modalMode === "edit" && "Edit Employee"}
                {modalMode === "delete" && "Delete Employee"}
              </DrawerTitle>
              <DrawerDescription>
                {modalMode === "delete"
                  ? "This action cannot be undone."
                  : "Fill in the details below."}
              </DrawerDescription>
            </DrawerHeader>

            <div className="overflow-y-auto flex-1 px-4">
              <div className="space-y-4">
                {modalMode !== "delete" ? (
                  <FieldGroup className="grid grid-cols-1 gap-4">
                    <Field>
                      <FieldLabel>First Name</FieldLabel>
                      <Input
                        value={formValues.first_name}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            first_name: event.target.value,
                          }))
                        }
                        placeholder="Femi"
                      />
                      {!formValues.first_name && (
                        <FieldError
                          errors={[{ message: "First name is required" }]}
                        />
                      )}
                    </Field>
                    <Field>
                      <FieldLabel>Last Name</FieldLabel>
                      <Input
                        value={formValues.last_name}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            last_name: event.target.value,
                          }))
                        }
                        placeholder="Falase"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={formValues.email}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="name@company.com"
                      />
                      {!formValues.email && (
                        <FieldError
                          errors={[{ message: "Email is required" }]}
                        />
                      )}
                    </Field>
                    <Field>
                      <FieldLabel>Phone</FieldLabel>
                      <Input
                        value={formValues.phone}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="+234..."
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Employee Code</FieldLabel>
                      <Input
                        value={formValues.employee_code}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            employee_code: event.target.value,
                          }))
                        }
                        placeholder="EMP-001"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Employment Type</FieldLabel>
                      <Select
                        value={formValues.employment_type}
                        onChange={(event) => {
                          const value = event.target.value as NonNullable<
                            Employee["employment_type"]
                          >;
                          setFormValues((prev) => ({
                            ...prev,
                            employment_type: value,
                          }));
                        }}
                      >
                        <option value="">Select type</option>
                        {employmentOptions.map((option) => (
                          <option key={option} value={option}>
                            {option?.replace("_", " ")}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>Status</FieldLabel>
                      <Select
                        value={formValues.status}
                        onChange={(event) => {
                          const value = event.target.value as NonNullable<
                            Employee["status"]
                          >;
                          setFormValues((prev) => ({
                            ...prev,
                            status: value,
                          }));
                        }}
                      >
                        <option value="">Select status</option>
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option?.replace("_", " ")}
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
                    <Field>
                      <FieldLabel>Designation</FieldLabel>
                      <Select
                        value={formValues.designation_id}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            designation_id: event.target.value,
                          }))
                        }
                        disabled={isMetaLoading || !companyId}
                      >
                        <option value="">Select designation</option>
                        {designations.map((designation) => (
                          <option key={designation.id} value={designation.id}>
                            {designation.name}
                          </option>
                        ))}
                      </Select>
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
                      <FieldLabel>Manager</FieldLabel>
                      <Select
                        value={formValues.manager_id}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            manager_id: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select manager</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Role</FieldLabel>
                      <Select
                        value={formValues.role_id}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            role_id: event.target.value,
                          }))
                        }
                        disabled={isMetaLoading || !companyId}
                      >
                        <option value="">Select role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Gender</FieldLabel>
                      <Input
                        value={formValues.gender}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            gender: event.target.value,
                          }))
                        }
                        placeholder="Male / Female"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Hire Date</FieldLabel>
                      <Input
                        type="date"
                        value={formValues.hire_date}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            hire_date: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Date of Birth</FieldLabel>
                      <Input
                        type="date"
                        value={formValues.date_of_birth}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            date_of_birth: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Address</FieldLabel>
                      <Textarea
                        value={formValues.address}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            address: event.target.value,
                          }))
                        }
                        placeholder="Employee address"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Emergency Contact Name</FieldLabel>
                      <Input
                        value={formValues.emergency_contact_name}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            emergency_contact_name: event.target.value,
                          }))
                        }
                        placeholder="Contact name"
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Emergency Contact Phone</FieldLabel>
                      <Input
                        value={formValues.emergency_contact_phone}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            emergency_contact_phone: event.target.value,
                          }))
                        }
                        placeholder="+234..."
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Profile Image URL</FieldLabel>
                      <Input
                        value={formValues.profile_image_url}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            profile_image_url: event.target.value,
                          }))
                        }
                        placeholder="https://..."
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Password</FieldLabel>
                      <Input
                        type="password"
                        value={formValues.password}
                        onChange={(event) =>
                          setFormValues((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Set password"
                      />
                    </Field>
                  </FieldGroup>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-foreground">
                      {activeEmployee?.first_name ?? ""}{" "}
                      {activeEmployee?.last_name ?? ""}
                    </span>
                    ?
                  </p>
                )}
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
              <Button
                variant={modalMode === "delete" ? "destructive" : "default"}
                onClick={handleSubmit}
                disabled={
                  modalMode !== "delete" &&
                  (!formValues.first_name || !formValues.email || !companyId)
                }
              >
                {modalMode === "create" && "Create Employee"}
                {modalMode === "edit" && "Save Changes"}
                {modalMode === "delete" && "Delete Employee"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
