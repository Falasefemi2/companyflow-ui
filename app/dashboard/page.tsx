"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPage } from "@/components/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  const normalizeRole = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, " ")
      .trim();

  const allowedRoles = useMemo(
    () =>
      new Set([
        normalizeRole("Super Admin"),
        normalizeRole("HR Manager"),
      ]),
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("cf_token");
    const rawRole = window.localStorage.getItem("cf_user_role") ?? "";
    const normalizedRole = normalizeRole(rawRole);

    if (!token || !allowedRoles.has(normalizedRole)) {
      setIsAllowed(false);
      router.replace("/login");
      return;
    }

    setIsAllowed(true);
  }, [allowedRoles, router]);

  if (isAllowed === null) {
    return null;
  }

  if (isAllowed === false) {
    return null;
  }

  return <DashboardPage />;
}
