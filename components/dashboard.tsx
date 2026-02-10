"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Building2,
  Layers3,
  Shield,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { Card } from "./ui/card";

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 dark:from-background dark:via-background dark:to-secondary/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10">
        <div className="border-b border-border/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br`from-primary to-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  CompanyFlow
                </h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl font-bold tracking-tight">
              Organization Overview
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Manage your core company structure, keep teams aligned, and grow
              with clear hierarchy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              href="/departments"
              icon={<Users2 className="w-5 h-5" />}
              title="Departments"
              description="Create and organize departments by function."
            />
            <DashboardCard
              href="/employees"
              icon={<Users2 className="w-5 h-5" />}
              title="Employees"
              description="Manage employee profiles and assignments."
            />
            <DashboardCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="Designations"
              description="Define roles and job titles across teams."
              href="/designations"
            />
            <DashboardCard
              href="/levels"
              icon={<Layers3 className="w-5 h-5" />}
              title="Levels"
              description="Set up levels to support growth and structure."
            />
            <DashboardCard
              href="/leave-types"
              icon={<ShieldAlert className="w-5 h-5" />}
              title="Leave Types"
              description="Manage leave categories like sick, vacation, and more."
            />
            <DashboardCard
              href="/roles"
              icon={<Shield className="w-5 h-5" />}
              title="Roles"
              description="Manage user roles and permissions"
            />
          </div>

          <Card className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Next steps</h3>
                <p className="text-sm text-muted-foreground">
                  Start by adding departments, then map designations and levels.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
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
