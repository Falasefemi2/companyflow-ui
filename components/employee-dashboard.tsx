"use client";

import React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MailCheck,
  PlusCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { leaveRequestsApi, memosApi } from "@/lib/api";
import { LeaveRequest, Memo } from "@/lib/types";
import { toast } from "sonner";
import { LeaveRequestForm } from "./leave-request-form";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

type MemoFormState = {
  title: string;
  content: string;
  memoType: "general" | "announcement" | "policy" | "reminder";
  priority: "low" | "medium" | "high";
  referenceNumber: string;
};

const INITIAL_MEMO_FORM: MemoFormState = {
  title: "",
  content: "",
  memoType: "general",
  priority: "low",
  referenceNumber: "",
};

export function EmployeeDashboardPage() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = React.useState<string>("");
  const [employeeId, setEmployeeId] = React.useState<string>("");
  const [employeeName, setEmployeeName] = React.useState<string>("");
  const [designation, setDesignation] = React.useState<string>("");
  const [showLeaveForm, setShowLeaveForm] = React.useState(false);
  const [showMemoForm, setShowMemoForm] = React.useState(false);
  const [memoForm, setMemoForm] = React.useState<MemoFormState>(INITIAL_MEMO_FORM);

  React.useEffect(() => {
    const storedCompanyId = localStorage.getItem("cf_company_id");
    const storedEmployeeId = localStorage.getItem("cf_employee_id");
    const storedEmployeeName =
      localStorage.getItem("cf_user_name") || localStorage.getItem("cf_user_email");
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

  const { data: memosData } = useQuery({
    queryKey: ["myMemos", companyId, employeeId],
    queryFn: () =>
      memosApi.list({
        companyId,
        recipientId: employeeId,
        pageSize: 100,
      }),
    enabled: !!companyId && !!employeeId,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => leaveRequestsApi.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      toast.success("Leave request withdrawn successfully.");
    },
    onError: (error: any) => {
      toast.error(`Failed to withdraw: ${error.message}`);
    },
  });

  const createMemoMutation = useMutation({
    mutationFn: (payload: {
      companyId: string;
      content: string;
      memoType: string;
      priority: string;
      recipientIds: string[];
      referenceNumber: string;
      title: string;
    }) => memosApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMemos"] });
      setMemoForm(INITIAL_MEMO_FORM);
      setShowMemoForm(false);
      toast.success("Memo created successfully.");
    },
    onError: (error: any) => {
      toast.error(`Failed to create memo: ${error.message}`);
    },
  });

  const markMemoAsReadMutation = useMutation({
    mutationFn: (id: string) => memosApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMemos"] });
      toast.success("Memo marked as read.");
    },
    onError: (error: any) => {
      toast.error(`Failed to mark memo as read: ${error.message}`);
    },
  });

  const leaveRequests = leaveRequestsData?.data?.data ?? [];
  const memos = React.useMemo(() => {
    const items = memosData?.data?.data ?? [];
    return [...items].sort((a: Memo, b: Memo) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    );
  }, [memosData?.data?.data]);

  const isMemoRead = React.useCallback(
    (memo: Memo) => {
      const isReadByRecipient =
        Array.isArray(memo.read_by) && memo.read_by.includes(employeeId);
      const hasReadStatus = (memo.status ?? "").toLowerCase() === "read";
      return isReadByRecipient || hasReadStatus;
    },
    [employeeId],
  );

  const stats = React.useMemo(() => {
    const pending = leaveRequests.filter(
      (r: LeaveRequest) => r.status === "pending",
    ).length;
    const approved = leaveRequests.filter(
      (r: LeaveRequest) => r.status === "approved",
    ).length;
    const rejected = leaveRequests.filter(
      (r: LeaveRequest) => r.status === "rejected",
    ).length;
    const unreadMemos = memos.filter((memo: Memo) => !isMemoRead(memo)).length;

    return { pending, approved, rejected, unreadMemos };
  }, [isMemoRead, leaveRequests, memos]);

  const scrollToSection = (id: "leave-requests" | "employee-memos") => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitMemo = () => {
    if (!companyId || !employeeId) {
      toast.error("Missing company or employee context.");
      return;
    }

    if (!memoForm.title.trim() || !memoForm.content.trim()) {
      toast.error("Memo title and content are required.");
      return;
    }

    createMemoMutation.mutate({
      companyId,
      content: memoForm.content.trim(),
      memoType: memoForm.memoType,
      priority: memoForm.priority,
      recipientIds: [employeeId],
      referenceNumber: memoForm.referenceNumber.trim() || `MEM-${Date.now()}`,
      title: memoForm.title.trim(),
    });
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
                  <p className="text-sm font-medium">{employeeName}</p>
                  <p className="text-xs text-muted-foreground">{designation}</p>
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
            <h2 className="text-4xl font-bold tracking-tight">Employee Overview</h2>
            <p className="text-muted-foreground max-w-2xl">
              Manage your leave requests and memos from one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              title="Pending Leave"
              value={stats.pending}
              color="yellow"
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Approved Leave"
              value={stats.approved}
              color="green"
            />
            <StatCard
              icon={<XCircle className="w-5 h-5" />}
              title="Rejected Leave"
              value={stats.rejected}
              color="red"
            />
            <StatCard
              icon={<Mail className="w-5 h-5" />}
              title="Unread Memos"
              value={stats.unreadMemos}
              color="primary"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              icon={<Calendar className="w-5 h-5" />}
              title="Request Leave"
              description="Submit a new leave request."
              onClick={() => setShowLeaveForm(true)}
            />
            <ActionCard
              icon={<PlusCircle className="w-5 h-5" />}
              title="Create Memo"
              description="Send a memo to an employee recipient."
              onClick={() => setShowMemoForm(true)}
            />
            <ActionCard
              icon={<FileText className="w-5 h-5" />}
              title="My Leave Requests"
              description="Review your latest leave requests."
              onClick={() => scrollToSection("leave-requests")}
            />
            <ActionCard
              icon={<MailCheck className="w-5 h-5" />}
              title="My Memos"
              description="Read and manage your received memos."
              onClick={() => scrollToSection("employee-memos")}
            />
          </div>

          <div id="leave-requests" className="space-y-4 scroll-mt-24">
            <h3 className="text-xl font-semibold">Recent Leave Requests</h3>
            {leaveRequests.length > 0 ?
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
                            <p className="font-semibold text-sm">{request.leave_type?.name}</p>
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
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            request.status === "pending" ?
                              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : request.status === "approved" ?
                              "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
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
            : <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Calendar className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Requests Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have not submitted any leave requests.
                    </p>
                  </div>
                </div>
              </Card>
            }
          </div>

          <div id="employee-memos" className="space-y-4 scroll-mt-24">
            <h3 className="text-xl font-semibold">My Memos</h3>
            {memos.length > 0 ?
              <div className="space-y-3">
                {memos.slice(0, 5).map((memo: Memo) => {
                  const read = isMemoRead(memo);
                  return (
                    <Card
                      key={memo.id}
                      className="p-4 border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{memo.title || "Untitled memo"}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                read ?
                                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {read ? "read" : "unread"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {memo.memo_type || "general"} • {memo.priority || "low"} •{" "}
                            {memo.reference_number || "No reference"}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{memo.content}</p>
                        </div>
                        {!read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markMemoAsReadMutation.mutate(memo.id)}
                            disabled={markMemoAsReadMutation.isPending}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            : <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <Mail className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Memos Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have no memos at the moment.
                    </p>
                  </div>
                </div>
              </Card>
            }
          </div>
        </div>
      </div>

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

      <Dialog open={showMemoForm} onOpenChange={setShowMemoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Memo</DialogTitle>
            <DialogDescription>
              Create a memo and send it to a recipient using the employee ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memo-title">Title</Label>
              <Input
                id="memo-title"
                value={memoForm.title}
                onChange={(event) =>
                  setMemoForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Memo title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo-reference">Reference Number</Label>
              <Input
                id="memo-reference"
                value={memoForm.referenceNumber}
                onChange={(event) =>
                  setMemoForm((prev) => ({
                    ...prev,
                    referenceNumber: event.target.value,
                  }))
                }
                placeholder="e.g. 123"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="memo-type">Memo Type</Label>
                <Select
                  id="memo-type"
                  value={memoForm.memoType}
                  onChange={(event) =>
                    setMemoForm((prev) => ({
                      ...prev,
                      memoType: event.target.value as MemoFormState["memoType"],
                    }))
                  }
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="policy">Policy</option>
                  <option value="reminder">Reminder</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo-priority">Priority</Label>
                <Select
                  id="memo-priority"
                  value={memoForm.priority}
                  onChange={(event) =>
                    setMemoForm((prev) => ({
                      ...prev,
                      priority: event.target.value as MemoFormState["priority"],
                    }))
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo-content">Content</Label>
              <Textarea
                id="memo-content"
                value={memoForm.content}
                onChange={(event) =>
                  setMemoForm((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder="Write memo content..."
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMemoForm(false);
                  setMemoForm(INITIAL_MEMO_FORM);
                }}
              >
                Cancel
              </Button>
              <Button onClick={submitMemo} disabled={createMemoMutation.isPending}>
                {createMemoMutation.isPending ? "Creating..." : "Create Memo"}
              </Button>
            </div>
          </div>
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
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color?: "primary" | "yellow" | "green" | "red";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    yellow: "bg-yellow-100/10 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-100/10 text-green-600 dark:text-green-400",
    red: "bg-red-100/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card className="p-6 border border-border/30 bg-secondary/20 rounded-xl animate-in fade-in slide-in-from-bottom-3">
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
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
    "group p-6 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50 cursor-pointer animate-in fade-in slide-in-from-bottom-3 text-left";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
