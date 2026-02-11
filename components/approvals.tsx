"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, X } from "lucide-react";
import { leaveRequestsApi, employeesApi, leaveTypesApi, memosApi } from "@/lib/api";
import { LeaveRequest, Employee, Memo } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type ApprovalTab = "leave" | "memo";

export function ApprovalsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<ApprovalTab>("leave");
  const [companyId, setCompanyId] = React.useState<string>("");

  const [leavePage, setLeavePage] = React.useState(1);
  const [leavePageSize] = React.useState(10);
  const [leaveStatusFilter, setLeaveStatusFilter] = React.useState<string>("");
  const [leaveEmployeeIdFilter, setLeaveEmployeeIdFilter] = React.useState<string>("");
  const [selectedLeaveRequest, setSelectedLeaveRequest] = React.useState<LeaveRequest | null>(null);
  const [leaveActionType, setLeaveActionType] = React.useState<"approve" | "reject" | null>(null);

  const [memoPage, setMemoPage] = React.useState(1);
  const [memoPageSize] = React.useState(10);
  const [memoStatusFilter, setMemoStatusFilter] = React.useState<string>("pending");
  const [memoTypeFilter, setMemoTypeFilter] = React.useState<string>("");
  const [memoEmployeeIdFilter, setMemoEmployeeIdFilter] = React.useState<string>("");
  const [selectedMemo, setSelectedMemo] = React.useState<Memo | null>(null);
  const [memoActionType, setMemoActionType] = React.useState<"approve" | "reject" | null>(null);
  const [memoActionComments, setMemoActionComments] = React.useState("");

  React.useEffect(() => {
    const storedCompanyId = localStorage.getItem("cf_company_id");
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  const { data: employeesData } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: () => employeesApi.list(companyId, { page_size: 1000 }),
    enabled: !!companyId,
  });

  const { data: leaveTypesData } = useQuery({
    queryKey: ["leaveTypes", companyId],
    queryFn: () => leaveTypesApi.list(companyId, { page_size: 1000 }),
    enabled: !!companyId,
  });

  const { data: leaveRequestsData, isLoading: isLeaveLoading } = useQuery({
    queryKey: [
      "leaveRequests",
      leavePage,
      leavePageSize,
      leaveStatusFilter,
      leaveEmployeeIdFilter,
    ],
    queryFn: () =>
      leaveRequestsApi.list({
        page: leavePage,
        pageSize: leavePageSize,
        ...(leaveStatusFilter && { status: leaveStatusFilter }),
        ...(leaveEmployeeIdFilter && { employeeId: leaveEmployeeIdFilter }),
      }),
    enabled: activeTab === "leave",
  });

  const { data: memosData, isLoading: isMemosLoading } = useQuery({
    queryKey: [
      "memos",
      memoPage,
      memoPageSize,
      memoStatusFilter,
      memoTypeFilter,
      memoEmployeeIdFilter,
    ],
    queryFn: () =>
      memosApi.list({
        page: memoPage,
        pageSize: memoPageSize,
        ...(memoStatusFilter && { status: memoStatusFilter }),
        ...(memoTypeFilter && { memoType: memoTypeFilter }),
        ...(memoEmployeeIdFilter && { employeeId: memoEmployeeIdFilter }),
      }),
    enabled: activeTab === "memo",
  });

  const approveLeaveMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request approved successfully.");
      setSelectedLeaveRequest(null);
      setLeaveActionType(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to approve leave request: ${error.message}`);
    },
  });

  const rejectLeaveMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      toast.success("Leave request rejected successfully.");
      setSelectedLeaveRequest(null);
      setLeaveActionType(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to reject leave request: ${error.message}`);
    },
  });

  const approveMemoMutation = useMutation({
    mutationFn: (payload: { id: string; comments?: string }) =>
      memosApi.approve(payload.id, payload.comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memos"] });
      toast.success("Memo approved successfully.");
      setSelectedMemo(null);
      setMemoActionType(null);
      setMemoActionComments("");
    },
    onError: (error: any) => {
      toast.error(`Failed to approve memo: ${error.message}`);
    },
  });

  const rejectMemoMutation = useMutation({
    mutationFn: (payload: { id: string; comments: string }) =>
      memosApi.reject(payload.id, payload.comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memos"] });
      toast.success("Memo rejected successfully.");
      setSelectedMemo(null);
      setMemoActionType(null);
      setMemoActionComments("");
    },
    onError: (error: any) => {
      toast.error(`Failed to reject memo: ${error.message}`);
    },
  });

  const leaveRequests = leaveRequestsData?.data?.data ?? [];
  const leaveTotalPages = leaveRequestsData?.data?.total_pages ?? 1;

  const memos = memosData?.data?.data ?? [];
  const memosTotalPages = memosData?.data?.total_pages ?? 1;

  const employeesMap = React.useMemo(() => {
    const items = employeesData?.data?.data ?? [];
    return items.reduce((acc, emp) => {
      acc[emp.id] = emp;
      return acc;
    }, {} as Record<string, Employee>);
  }, [employeesData]);

  const leaveTypesMap = React.useMemo(() => {
    const items = leaveTypesData?.data?.data ?? [];
    return items.reduce((acc, lt) => {
      acc[lt.id] = lt;
      return acc;
    }, {} as Record<string, { id: string; name?: string }>);
  }, [leaveTypesData]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status?: string) => {
    if (status === "approved") return "bg-green-100 text-green-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const openLeaveActionDialog = (request: LeaveRequest, action: "approve" | "reject") => {
    setSelectedLeaveRequest(request);
    setLeaveActionType(action);
  };

  const openMemoActionDialog = (memo: Memo, action: "approve" | "reject") => {
    setSelectedMemo(memo);
    setMemoActionType(action);
    setMemoActionComments("");
  };

  const confirmLeaveAction = () => {
    if (!selectedLeaveRequest || !leaveActionType) return;
    if (leaveActionType === "approve") {
      approveLeaveMutation.mutate(selectedLeaveRequest.id);
    } else {
      rejectLeaveMutation.mutate(selectedLeaveRequest.id);
    }
  };

  const confirmMemoAction = () => {
    if (!selectedMemo || !memoActionType) return;

    if (memoActionType === "approve") {
      approveMemoMutation.mutate({
        id: selectedMemo.id,
        comments: memoActionComments.trim() || undefined,
      });
      return;
    }

    const comments = memoActionComments.trim();
    if (!comments) {
      toast.error("Rejection comments are required.");
      return;
    }

    rejectMemoMutation.mutate({
      id: selectedMemo.id,
      comments,
    });
  };

  return (
    <div className="space-y-4 p-8">
      <Link
        href="/dashboard"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
        aria-label="Back to dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Approvals</h1>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-card p-2 w-fit">
        <Button
          variant={activeTab === "leave" ? "default" : "ghost"}
          onClick={() => setActiveTab("leave")}
        >
          Leave Requests
        </Button>
        <Button
          variant={activeTab === "memo" ? "default" : "ghost"}
          onClick={() => setActiveTab("memo")}
        >
          Memo Approvals
        </Button>
      </div>

      {activeTab === "leave" && (
        <>
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 md:grid-cols-2">
            <div>
              <Label htmlFor="leave-status-filter">Filter by Status</Label>
              <Select
                id="leave-status-filter"
                value={leaveStatusFilter}
                onChange={(e) => {
                  setLeaveStatusFilter(e.target.value);
                  setLeavePage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="leave-employee-filter">Filter by Employee</Label>
              <Select
                id="leave-employee-filter"
                value={leaveEmployeeIdFilter}
                onChange={(e) => {
                  setLeaveEmployeeIdFilter(e.target.value);
                  setLeavePage(1);
                }}
              >
                <option value="">All Employees</option>
                {employeesData?.data?.data?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isLeaveLoading ? (
            <div className="p-8">Loading leave requests...</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.length > 0 ? (
                      leaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {(() => {
                              const emp =
                                request.employee ??
                                (request.employee_id
                                  ? employeesMap[request.employee_id]
                                  : undefined);
                              return emp ? `${emp.first_name} ${emp.last_name}` : "-";
                            })()}
                          </TableCell>
                          <TableCell>
                            {request.leave_type?.name ??
                              (request.leave_type_id
                                ? leaveTypesMap[request.leave_type_id]?.name
                                : undefined) ??
                              "-"}
                          </TableCell>
                          <TableCell>{formatDate(request.start_date)}</TableCell>
                          <TableCell>{formatDate(request.end_date)}</TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(request.status)}`}
                            >
                              {request.status ?? "-"}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.reason || "-"}
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openLeaveActionDialog(request, "approve")}
                                  className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openLeaveActionDialog(request, "reject")}
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No leave requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {leavePage} of {leaveTotalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLeavePage((p) => Math.max(1, p - 1))}
                    disabled={leavePage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLeavePage((p) => Math.min(leaveTotalPages, p + 1))}
                    disabled={leavePage === leaveTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "memo" && (
        <>
          <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 md:grid-cols-3">
            <div>
              <Label htmlFor="memo-status-filter">Filter by Status</Label>
              <Select
                id="memo-status-filter"
                value={memoStatusFilter}
                onChange={(e) => {
                  setMemoStatusFilter(e.target.value);
                  setMemoPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="memo-type-filter">Filter by Memo Type</Label>
              <Select
                id="memo-type-filter"
                value={memoTypeFilter}
                onChange={(e) => {
                  setMemoTypeFilter(e.target.value);
                  setMemoPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="announcement">Announcement</option>
                <option value="policy">Policy</option>
                <option value="reminder">Reminder</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="memo-employee-filter">Filter by Employee</Label>
              <Select
                id="memo-employee-filter"
                value={memoEmployeeIdFilter}
                onChange={(e) => {
                  setMemoEmployeeIdFilter(e.target.value);
                  setMemoPage(1);
                }}
              >
                <option value="">All Employees</option>
                {employeesData?.data?.data?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isMemosLoading ? (
            <div className="p-8">Loading memo approvals...</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Memo Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memos.length > 0 ? (
                      memos.map((memo) => (
                        <TableRow key={memo.id}>
                          <TableCell className="max-w-xs">
                            <p className="truncate font-medium">{memo.title || "-"}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {memo.reference_number || "No reference"}
                            </p>
                          </TableCell>
                          <TableCell>{memo.memo_type || "-"}</TableCell>
                          <TableCell>{memo.priority || "-"}</TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(memo.status)}`}
                            >
                              {memo.status || "pending"}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {Array.isArray(memo.recipient_ids) && memo.recipient_ids.length > 0
                              ? memo.recipient_ids
                                  .map((id) => {
                                    const emp = employeesMap[id];
                                    return emp
                                      ? `${emp.first_name} ${emp.last_name}`.trim()
                                      : id;
                                  })
                                  .join(", ")
                              : "-"}
                          </TableCell>
                          <TableCell>{formatDate(memo.created_at)}</TableCell>
                          <TableCell>
                            {(memo.status ?? "pending") === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMemoActionDialog(memo, "approve")}
                                  className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openMemoActionDialog(memo, "reject")}
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No memos found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {memoPage} of {memosTotalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMemoPage((p) => Math.max(1, p - 1))}
                    disabled={memoPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMemoPage((p) => Math.min(memosTotalPages, p + 1))}
                    disabled={memoPage === memosTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <Dialog
        open={!!selectedLeaveRequest}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLeaveRequest(null);
            setLeaveActionType(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {leaveActionType === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {leaveActionType === "approve"
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLeaveRequest && (
              <>
                <div>
                  <span className="font-semibold">Employee:</span>{" "}
                  {(() => {
                    const emp =
                      selectedLeaveRequest.employee ??
                      (selectedLeaveRequest.employee_id
                        ? employeesMap[selectedLeaveRequest.employee_id]
                        : undefined);
                    return emp ? `${emp.first_name} ${emp.last_name}` : "-";
                  })()}
                </div>
                <div>
                  <span className="font-semibold">Leave Type:</span>{" "}
                  {selectedLeaveRequest.leave_type?.name ??
                    (selectedLeaveRequest.leave_type_id
                      ? leaveTypesMap[selectedLeaveRequest.leave_type_id]?.name
                      : undefined) ??
                    "-"}
                </div>
                <div>
                  <span className="font-semibold">From:</span>{" "}
                  {formatDate(selectedLeaveRequest.start_date)}
                </div>
                <div>
                  <span className="font-semibold">To:</span>{" "}
                  {formatDate(selectedLeaveRequest.end_date)}
                </div>
                <div>
                  <span className="font-semibold">Reason:</span>{" "}
                  {selectedLeaveRequest.reason || "-"}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLeaveRequest(null);
                setLeaveActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLeaveAction}
              disabled={approveLeaveMutation.isPending || rejectLeaveMutation.isPending}
              className={
                leaveActionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {approveLeaveMutation.isPending || rejectLeaveMutation.isPending
                ? "Processing..."
                : leaveActionType === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedMemo}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMemo(null);
            setMemoActionType(null);
            setMemoActionComments("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{memoActionType === "approve" ? "Approve" : "Reject"} Memo</DialogTitle>
            <DialogDescription>
              {memoActionType === "approve"
                ? "Confirm memo approval at the current workflow step."
                : "Provide rejection comments and reject this memo."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedMemo && (
              <>
                <div>
                  <span className="font-semibold">Title:</span> {selectedMemo.title || "-"}
                </div>
                <div>
                  <span className="font-semibold">Reference:</span>{" "}
                  {selectedMemo.reference_number || "-"}
                </div>
                <div>
                  <span className="font-semibold">Type:</span>{" "}
                  {selectedMemo.memo_type || "-"}
                </div>
                <div>
                  <span className="font-semibold">Priority:</span>{" "}
                  {selectedMemo.priority || "-"}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="memo-action-comments">
                {memoActionType === "approve" ? "Comment (optional)" : "Rejection comments"}
              </Label>
              <Textarea
                id="memo-action-comments"
                value={memoActionComments}
                onChange={(e) => setMemoActionComments(e.target.value)}
                placeholder={
                  memoActionType === "approve"
                    ? "Optional approval comment"
                    : "Reason for rejecting this memo"
                }
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMemo(null);
                setMemoActionType(null);
                setMemoActionComments("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmMemoAction}
              disabled={approveMemoMutation.isPending || rejectMemoMutation.isPending}
              className={
                memoActionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {approveMemoMutation.isPending || rejectMemoMutation.isPending
                ? "Processing..."
                : memoActionType === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApprovalsPage;
