"use client";

import { useSearchParams } from "next/navigation";
import { PermissionsEditor } from "@/components/permissions";
import { Card } from "@/components/ui/card";
import React from "react";

export default function PermissionsClient() {
  const searchParams = useSearchParams();
  const queryRoleId = searchParams.get("roleId");
  const storedRoleId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cf_role_id")
      : null;
  const roleId = queryRoleId || storedRoleId || "";

  if (!roleId) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold">Role ID Required</h1>
          <p className="text-muted-foreground mt-2">
            Please provide a <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">roleId</code> query parameter or set{" "}
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">localStorage.cf_role_id</code> to view permissions.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Example: <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">/permissions?roleId=your-role-id</code>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Permissions for Role: <span className="text-primary">{roleId}</span>
        </h1>
        <PermissionsEditor roleId={roleId} />
      </div>
    </div>
  );
}
