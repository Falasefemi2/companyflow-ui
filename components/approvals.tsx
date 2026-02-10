"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { leaveRequestsApi, employeesApi, leaveTypesApi } from "@/lib/api";
import { LeaveRequest, Employee } from "@/lib/types";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export function ApprovalsPage() {
    const queryClient = useQueryClient();

    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [statusFilter, setStatusFilter] = React.useState<string>("");
    const [employeeIdFilter, setEmployeeIdFilter] = React.useState<string>("");
    const [companyId, setCompanyId] = React.useState<string>("");
    const [selectedRequest, setSelectedRequest] = React.useState<LeaveRequest | null>(null);
    const [actionType, setActionType] = React.useState<"approve" | "reject" | null>(null);

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

    const { data: leaveRequestsData, isLoading } = useQuery({
        queryKey: ["leaveRequests", page, pageSize, statusFilter, employeeIdFilter],
        queryFn: () =>
            leaveRequestsApi.list({
                page,
                pageSize,
                ...(statusFilter && { status: statusFilter }),
                ...(employeeIdFilter && { employeeId: employeeIdFilter }),
            }),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => leaveRequestsApi.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
            toast.success("Leave request approved successfully!");
            setSelectedRequest(null);
            setActionType(null);
        },
        onError: (error) => {
            toast.error(`Failed to approve: ${error.message}`);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => leaveRequestsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
            toast.success("Leave request rejected successfully!");
            setSelectedRequest(null);
            setActionType(null);
        },
        onError: (error) => {
            toast.error(`Failed to reject: ${error.message}`);
        },
    });

    const handleApprove = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setActionType("approve");
    };

    const handleReject = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setActionType("reject");
    };

    const handleConfirmAction = () => {
        if (!selectedRequest || !actionType) return;

        if (actionType === "approve") {
            approveMutation.mutate(selectedRequest.id);
        } else {
            rejectMutation.mutate(selectedRequest.id);
        }
    };

    const leaveRequests = leaveRequestsData?.data?.data ?? [];
    const totalPages = leaveRequestsData?.data?.total_pages ?? 1;

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

    if (isLoading) {
        return <div className="p-8">Loading leave requests...</div>;
    }

    return (
        <div className="space-y-4 p-8">
            <Link
                href="/dashboard"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
                aria-label="Back to dashboard"
            >
                <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Leave Request Approvals</h1>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-4 rounded-lg border">
                <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="employee-filter">Filter by Employee</Label>
                    <Select
                        id="employee-filter"
                        value={employeeIdFilter}
                        onChange={(e) => setEmployeeIdFilter(e.target.value)}
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

            {/* Table */}
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
                                            const emp = request.employee ?? (request.employee_id ? employeesMap[request.employee_id] : undefined);
                                            return emp ? `${emp.first_name} ${emp.last_name}` : "-";
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        {request.leave_type?.name ?? (request.leave_type_id ? leaveTypesMap[request.leave_type_id]?.name : undefined) ?? "-"}
                                    </TableCell>
                                    <TableCell>{formatDate(request.start_date)}</TableCell>
                                    <TableCell>{formatDate(request.end_date)}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : request.status === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {request.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {request.reason}
                                    </TableCell>
                                    <TableCell>
                                        {request.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleApprove(request)}
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleReject(request)}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => {
                if (!open) {
                    setSelectedRequest(null);
                    setActionType(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "approve" ? "Approve" : "Reject"} Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "approve"
                                ? "Are you sure you want to approve this leave request?"
                                : "Are you sure you want to reject this leave request?"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedRequest && (
                            <>
                                <div>
                                    <span className="font-semibold">Employee:</span>{" "}
                                    {(() => {
                                        const emp = selectedRequest.employee ?? (selectedRequest.employee_id ? employeesMap[selectedRequest.employee_id] : undefined);
                                        return emp ? `${emp.first_name} ${emp.last_name}` : "-";
                                    })()}
                                </div>
                                <div>
                                    <span className="font-semibold">Leave Type:</span>{" "}
                                    {selectedRequest.leave_type?.name ?? (selectedRequest.leave_type_id ? leaveTypesMap[selectedRequest.leave_type_id]?.name : undefined) ?? "-"}
                                </div>
                                <div>
                                    <span className="font-semibold">From:</span>{" "}
                                    {formatDate(selectedRequest.start_date)}
                                </div>
                                <div>
                                    <span className="font-semibold">To:</span> {formatDate(selectedRequest.end_date)}
                                </div>
                                <div>
                                    <span className="font-semibold">Reason:</span>{" "}
                                    {selectedRequest.reason}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedRequest(null);
                                setActionType(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmAction}
                            disabled={
                                approveMutation.isPending || rejectMutation.isPending
                            }
                            className={
                                actionType === "approve"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                            }
                        >
                            {approveMutation.isPending || rejectMutation.isPending
                                ? "Processing..."
                                : actionType === "approve"
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
