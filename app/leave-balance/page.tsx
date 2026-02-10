"use client";

import React from "react";
import LeaveBalanceCard from "@/components/leave-balance";

export default function Page() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Leave Balance</h1>
            <LeaveBalanceCard />
        </div>
    );
}
