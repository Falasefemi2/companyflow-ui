"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { employeesApi, leaveBalancesApi } from "@/lib/api";
import { Employee, LeaveBalance } from "@/lib/types";

export function LeaveBalanceCard() {
    const [employeeId, setEmployeeId] = React.useState<string>("");
    const [year, setYear] = React.useState<number>(new Date().getFullYear());

    const [companyId, setCompanyId] = React.useState<string>("");

    React.useEffect(() => {
        const stored = localStorage.getItem("cf_employee_id");
        const storedCompany = localStorage.getItem("cf_company_id");
        if (stored) setEmployeeId(stored);
        if (storedCompany) setCompanyId(storedCompany);
    }, []);

    const { data: employeesData } = useQuery({
        queryKey: ["employees", companyId],
        queryFn: () => employeesApi.list(companyId, { page_size: 1000 }),
        enabled: !!companyId,
    });

    const { data: balancesData, isLoading, error } = useQuery<LeaveBalance[]>({
        queryKey: ["leaveBalances", employeeId, year],
        queryFn: () => leaveBalancesApi.listForEmployee(employeeId, { year }),
        enabled: !!employeeId,
    });

    const items: LeaveBalance[] = balancesData ?? [];

    return (
        <Card className="p-6 border border-border/30 bg-secondary/20">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Leave Balance</h3>
                    <p className="text-sm text-muted-foreground">Available leave days</p>
                </div>
                <div className="flex items-center gap-4">
                    <div>
                        <Label>Employee</Label>
                        <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="ml-2"
                        >
                            <option value="">Select employee</option>
                            {employeesData?.data?.data?.map((emp: Employee) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Year</Label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="ml-2"
                        >
                            {Array.from({ length: 5 }).map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {isLoading && <div>Loading...</div>}
                {error && <div className="text-red-600">Unable to load balances</div>}
                {!isLoading && items.length === 0 && <div>No balances found.</div>}
                <div className="space-y-3 mt-2">
                    {items.map((b: LeaveBalance) => (
                        <div key={b.leave_type_id ?? b.id} className="border rounded-lg p-3 bg-background/50">
                            <div className="font-semibold text-sm mb-2">{b.leave_type_name ?? "Leave"}</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-muted-foreground">Total Days:</span>
                                    <div className="font-medium">{b.total_days ?? 0}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Used Days:</span>
                                    <div className="font-medium text-red-600">{b.used_days ?? 0}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Pending Days:</span>
                                    <div className="font-medium text-yellow-600">{b.pending_days ?? 0}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Carried Fwd:</span>
                                    <div className="font-medium">{b.carried_forward_days ?? 0}</div>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t text-sm">
                                <span className="text-muted-foreground">Available Balance:</span>
                                <div className="font-bold text-green-600">{(b.total_days ?? 0) - (b.used_days ?? 0) - (b.pending_days ?? 0)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

export default LeaveBalanceCard;
