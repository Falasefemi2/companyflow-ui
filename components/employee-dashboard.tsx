"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Building2,
    ArrowLeft,
    Trash2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { leaveRequestsApi } from "@/lib/api";
import { LeaveRequest } from "@/lib/types";
import { LeaveRequestForm } from "./leave-request-form";
import { toast } from "sonner";

export function EmployeeDashboardPage() {
    const queryClient = useQueryClient();
    const [companyId, setCompanyId] = React.useState<string>("");
    const [employeeId, setEmployeeId] = React.useState<string>("");
    const [employeeName, setEmployeeName] = React.useState<string>("");
    const [designation, setDesignation] = React.useState<string>("");
    const [showLeaveForm, setShowLeaveForm] = React.useState(false);

    React.useEffect(() => {
        const storedCompanyId = localStorage.getItem("cf_company_id");
        const storedEmployeeId = localStorage.getItem("cf_employee_id");
        const storedEmployeeName = localStorage.getItem("cf_user_name") || localStorage.getItem("cf_user_email");
        const storedDesignation = localStorage.getItem("cf_user_designation");

        if (storedCompanyId) setCompanyId(storedCompanyId);
        if (storedEmployeeId) setEmployeeId(storedEmployeeId);
        if (storedEmployeeName) setEmployeeName(storedEmployeeName);
        if (storedDesignation) setDesignation(storedDesignation);
    }, []);

    const { data: leaveRequestsData } = useQuery({
        queryKey: ["myLeaveRequests", employeeId],
        queryFn: () =>
            leaveRequestsApi.list({
                employeeId,
                pageSize: 100,
            }),
        enabled: !!employeeId,
    });

    const withdrawMutation = useMutation({
        mutationFn: (id: string) => leaveRequestsApi.withdraw(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
            toast.success("Leave request withdrawn successfully!");
        },
        onError: (error: any) => {
            toast.error(`Failed to withdraw: ${error.message}`);
        },
    });

    const leaveRequests = leaveRequestsData?.data?.data ?? [];

    const stats = React.useMemo(() => {
        const pending = leaveRequests.filter(
            (r: LeaveRequest) => r.status === "pending"
        ).length;
        const approved = leaveRequests.filter(
            (r: LeaveRequest) => r.status === "approved"
        ).length;
        const rejected = leaveRequests.filter(
            (r: LeaveRequest) => r.status === "rejected"
        ).length;
        const total = leaveRequests.length;

        return { pending, approved, rejected, total };
    }, [leaveRequests]);

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/10">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div className="relative z-10">
                <div className="border-b border-border/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-balance">
                                        CompanyFlow
                                    </h1>
                                    <p className="text-sm text-muted-foreground">Employee Dashboard</p>
                                </div>
                            </div>
                            {employeeName && (
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {employeeName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {designation}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="space-y-10">
                    <Link
                        href="/dashboard"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
                        aria-label="Back to dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
                        <h2 className="text-4xl font-bold tracking-tight">
                            Leave Requests Overview
                        </h2>
                        <p className="text-muted-foreground max-w-2xl">
                            Track your leave requests, manage your time off, and monitor
                            approval status.
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            icon={<FileText className="w-5 h-5" />}
                            title="Total Requests"
                            value={stats.total}
                            color="primary"
                        />
                        <StatCard
                            icon={<Clock className="w-5 h-5" />}
                            title="Pending"
                            value={stats.pending}
                            color="yellow"
                            accent
                        />
                        <StatCard
                            icon={<CheckCircle className="w-5 h-5" />}
                            title="Approved"
                            value={stats.approved}
                            color="green"
                        />
                        <StatCard
                            icon={<XCircle className="w-5 h-5" />}
                            title="Rejected"
                            value={stats.rejected}
                            color="red"
                        />
                    </div>

                    {/* Action Cards */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Quick Actions</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <button
                                onClick={() => setShowLeaveForm(true)}
                                className="group p-6 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50 cursor-pointer animate-in fade-in slide-in-from-bottom-3 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-base">Request Leave</h4>
                                        <p className="text-sm text-muted-foreground mt-1">Submit a new leave request</p>
                                    </div>
                                </div>
                            </button>
                            <ActionCard
                                icon={<FileText className="w-5 h-5" />}
                                title="View All Requests"
                                description="See all your leave requests and their status"
                            />
                        </div>
                    </div>

                    {/* Recent Requests */}
                    {leaveRequests.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Recent Requests</h3>
                            <div className="space-y-3">
                                {leaveRequests.slice(0, 5).map((request: LeaveRequest) => (
                                    <Card
                                        key={request.id}
                                        className="p-4 border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">
                                                            {request.leave_type?.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {request.start_date} to {request.end_date}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground max-w-37.5 truncate">
                                                    {request.reason && request.reason.substring(0, 30)}
                                                    {request.reason && request.reason.length > 30 ? "..." : ""}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${request.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                        : request.status === "approved"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                        }`}
                                                >
                                                    {request.status}
                                                </span>
                                                {request.status === "pending" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => withdrawMutation.mutate(request.id)}
                                                        disabled={withdrawMutation.isPending}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {leaveRequests.length > 5 && (
                                <div className="text-center pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        and {leaveRequests.length - 5} more requests
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {leaveRequests.length === 0 && (
                        <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-3 rounded-xl bg-muted/50">
                                    <Calendar className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">No Requests Yet</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You haven't submitted any leave requests. Start by requesting
                                        leave.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Need Help?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Check the leave policy or contact your HR manager for guidance.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Leave Request Form Dialog */}
            <Dialog open={showLeaveForm} onOpenChange={setShowLeaveForm}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Leave</DialogTitle>
                        <DialogDescription>
                            Submit a new leave request. Please fill in all required fields.
                        </DialogDescription>
                    </DialogHeader>
                    <LeaveRequestForm
                        onSuccess={() => setShowLeaveForm(false)}
                        onCancel={() => setShowLeaveForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    color = "primary",
    accent = false,
}: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    color?: "primary" | "yellow" | "green" | "red";
    accent?: boolean;
}) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        yellow: "bg-yellow-100/10 text-yellow-600 dark:text-yellow-400",
        green: "bg-green-100/10 text-green-600 dark:text-green-400",
        red: "bg-red-100/10 text-red-600 dark:text-red-400",
    };

    return (
        <Card
            className={`p-6 border rounded-xl animate-in fade-in slide-in-from-bottom-3 ${accent
                ? "border-yellow-200/50 bg-yellow-50/20 dark:border-yellow-900/30 dark:bg-yellow-900/10"
                : "border-border/30 bg-secondary/20"
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
            </div>
        </Card>
    );
}

function ActionCard({
    icon,
    title,
    description,
    href,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
}) {
    const content = (
        <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-base">{title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
        </div>
    );

    const className =
        "group p-6 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50 cursor-pointer animate-in fade-in slide-in-from-bottom-3";

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}
