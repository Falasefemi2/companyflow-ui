"use client";

import { useLayoutEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EmployeeDashboardPage } from "@/components/employee-dashboard";

export default function EmployeeDashboard() {
    const router = useRouter();

    const normalizeRole = (value: string) =>
        value
            .trim()
            .toLowerCase()
            .replace(/[_\s]+/g, " ")
            .trim();

    const allowedRoles = useMemo(
        () => new Set([normalizeRole("Employee"), normalizeRole("HR Manager"), normalizeRole("Super Admin")]),
        [],
    );

    const checkAuth = () => {
        if (typeof window === "undefined") return false;
        const token = window.localStorage.getItem("cf_token");
        const rawRole = window.localStorage.getItem("cf_user_role") ?? "";
        return token && allowedRoles.has(normalizeRole(rawRole));
    };

    const isAllowed = checkAuth();

    useLayoutEffect(() => {
        if (!isAllowed) {
            router.replace("/login");
        }
    }, [isAllowed, router]);

    if (!isAllowed) {
        return null;
    }

    return <EmployeeDashboardPage />;
}
