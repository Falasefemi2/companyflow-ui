"use client";

import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { leaveRequestsApi, leaveTypesApi } from "@/lib/api";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

interface LeaveRequestFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function LeaveRequestForm({ onSuccess, onCancel }: LeaveRequestFormProps) {
    const queryClient = useQueryClient();
    const [companyId, setCompanyId] = React.useState<string>("");

    const [formData, setFormData] = React.useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        daysRequested: 0,
        reason: "",
        attachment: "",
    });

    useEffect(() => {
        const storedCompanyId = localStorage.getItem("cf_company_id");
        if (storedCompanyId) setCompanyId(storedCompanyId);
    }, []);

    const { data: leaveTypesData } = useQuery({
        queryKey: ["leaveTypes", companyId],
        queryFn: () => leaveTypesApi.list(companyId),
        enabled: !!companyId,
    });

    const leaveTypes = leaveTypesData?.data?.data ?? [];

    const createMutation = useMutation({
        mutationFn: (payload: any) => leaveRequestsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
            toast.success("Leave request submitted successfully!");
            setFormData({
                leaveTypeId: "",
                startDate: "",
                endDate: "",
                daysRequested: 0,
                reason: "",
                attachment: "",
            });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(`Failed to submit: ${error.message}`);
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateDaysRequested = (): number => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
        return Math.max(1, diffDays);
    };

    const daysRequested = calculateDaysRequested();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leaveTypeId || !formData.startDate || !formData.endDate) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (daysRequested <= 0) {
            toast.error("Days requested must be greater than 0");
            return;
        }
        createMutation.mutate({
            ...formData,
            daysRequested,
        });
    };

    const handleCancel = () => {
        setFormData({
            leaveTypeId: "",
            startDate: "",
            endDate: "",
            daysRequested: 0,
            reason: "",
            attachment: "",
        });
        onCancel?.();
    };

    return (
        <Card className="p-6 border border-border/50 bg-card/80 backdrop-blur-sm w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Leave Type */}
                <div>
                    <Label htmlFor="leaveTypeId">Leave Type *</Label>
                    <Select
                        id="leaveTypeId"
                        name="leaveTypeId"
                        value={formData.leaveTypeId}
                        onChange={handleChange}
                        className="mt-1"
                    >
                        <option value="">Select a leave type</option>
                        {leaveTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Start Date */}
                <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>

                {/* End Date */}
                <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>

                {/* Days Requested Display */}
                {formData.startDate && formData.endDate && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                            Total days requested: <span className="font-bold">{daysRequested}</span>
                        </p>
                    </div>
                )}

                {/* Reason */}
                <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Please provide a reason for your leave request"
                        className="mt-1 min-h-24"
                    />
                </div>

                {/* Attachment */}
                <div>
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <Input
                        id="attachment"
                        name="attachment"
                        type="text"
                        value={formData.attachment}
                        onChange={handleChange}
                        placeholder="Attachment URL or file path"
                        className="mt-1"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={createMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="gap-2"
                    >
                        {createMutation.isPending && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {createMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
