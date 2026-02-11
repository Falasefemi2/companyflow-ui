"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ClipboardCheck, Plus } from "lucide-react";
import { approvalWorkflowsApi, departmentsApi } from "@/lib/api";
import type { ApprovalWorkflowType, Department } from "@/lib/types";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const WORKFLOW_TYPES: ApprovalWorkflowType[] = ["leave", "memo", "expense"];

export function ApprovalWorkflowsPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const queryCompanyId = searchParams.get("company_id");
  const [storedCompanyId, setStoredCompanyId] = React.useState("");

  const [workflowTypeFilter, setWorkflowTypeFilter] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("");
  const [onlyActiveFilter, setOnlyActiveFilter] = React.useState(true);

  const [departmentId, setDepartmentId] = React.useState("");
  const [workflowType, setWorkflowType] = React.useState<ApprovalWorkflowType>(
    "memo",
  );
  const [isActive, setIsActive] = React.useState(true);
  const [stepsInput, setStepsInput] = React.useState("1");

  React.useEffect(() => {
    const companyId = window.localStorage.getItem("cf_company_id");
    if (companyId) {
      setStoredCompanyId(companyId);
    }
  }, []);

  const companyId = queryCompanyId || storedCompanyId;

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: () => departmentsApi.list(companyId, { page: 1, page_size: 1000 }),
    enabled: !!companyId,
  });

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: [
      "approvalWorkflows",
      workflowTypeFilter,
      departmentFilter,
      onlyActiveFilter,
    ],
    queryFn: () =>
      approvalWorkflowsApi.list({
        ...(workflowTypeFilter && {
          workflowType: workflowTypeFilter as ApprovalWorkflowType,
        }),
        ...(departmentFilter && { departmentId: departmentFilter }),
        onlyActive: onlyActiveFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: approvalWorkflowsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvalWorkflows"] });
      toast.success("Approval workflow created");
      setWorkflowType("memo");
      setIsActive(true);
      setDepartmentId("");
      setStepsInput("1");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create");
    },
  });

  const departmentsMap = React.useMemo(() => {
    const list = departmentsData?.data?.data ?? [];
    return list.reduce(
      (acc, department) => {
        acc[department.id] = department;
        return acc;
      },
      {} as Record<string, Department>,
    );
  }, [departmentsData]);

  const handleCreate = () => {
    if (!companyId) {
      toast.error(
        "Missing company ID. Add ?company_id=... or set localStorage.cf_company_id",
      );
      return;
    }

    if (!departmentId) {
      toast.error("Department is required");
      return;
    }

    const parsedSteps = stepsInput
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (parsedSteps.length === 0) {
      toast.error("Add at least one valid step (example: 1,2,3)");
      return;
    }

    createMutation.mutate({
      companyId,
      departmentId,
      isActive,
      steps: parsedSteps,
      workflowType,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-16 left-10 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Approval Workflows
              </h1>
              <p className="text-sm text-muted-foreground">
                Configure who approves leave, memo, and expense requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-border/50 bg-card/90 p-5 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Workflow Directory</h2>
              <p className="text-sm text-muted-foreground">
                Filter active workflows by type and department.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field>
                <FieldLabel>Workflow Type</FieldLabel>
                <Select
                  value={workflowTypeFilter}
                  onChange={(event) => setWorkflowTypeFilter(event.target.value)}
                >
                  <option value="">All types</option>
                  {WORKFLOW_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <FieldLabel>Department</FieldLabel>
                <Select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option value="">All departments</option>
                  {(departmentsData?.data?.data ?? []).map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name ?? department.id}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <div className="flex h-9 items-center justify-between rounded-md border border-border px-3">
                  <span className="text-sm">Only active</span>
                  <Switch
                    checked={onlyActiveFilter}
                    onCheckedChange={setOnlyActiveFilter}
                  />
                </div>
              </Field>
            </div>

            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Workflow Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center">
                        Loading workflows...
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && workflows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center">
                        No workflows found.
                      </TableCell>
                    </TableRow>
                  )}

                  {workflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium capitalize">
                        {workflow.workflowType ?? "-"}
                      </TableCell>
                      <TableCell>
                        {workflow.departmentId
                          ? (departmentsMap[workflow.departmentId]?.name ??
                            workflow.departmentId)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {workflow.steps?.length
                          ? workflow.steps.join(" -> ")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            workflow.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {workflow.isActive ? "active" : "inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="border border-border/50 bg-card/90 p-5 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Create Workflow</h2>
              <p className="text-sm text-muted-foreground">
                Add a new approval chain for a workflow type.
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>Department</FieldLabel>
                <Select
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                >
                  <option value="">Select department</option>
                  {(departmentsData?.data?.data ?? []).map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name ?? department.id}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <FieldLabel>Workflow Type</FieldLabel>
                <Select
                  value={workflowType}
                  onChange={(event) =>
                    setWorkflowType(event.target.value as ApprovalWorkflowType)
                  }
                >
                  {WORKFLOW_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field>
                <FieldLabel>Steps</FieldLabel>
                <Input
                  value={stepsInput}
                  onChange={(event) => setStepsInput(event.target.value)}
                  placeholder="1,2,3"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated approver levels. Example: `1,2`.
                </p>
              </Field>

              <Field>
                <div className="flex h-9 items-center justify-between rounded-md border border-border px-3">
                  <span className="text-sm">Active workflow</span>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </Field>
            </FieldGroup>

            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Creating..." : "Create Workflow"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ApprovalWorkflowsPage;
