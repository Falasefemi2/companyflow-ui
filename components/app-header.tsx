"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

type UserInfo = {
  name: string;
  role: string;
  hasToken: boolean;
};

export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo>({
    name: "",
    role: "",
    hasToken: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadUser = () => {
      const token = window.localStorage.getItem("cf_token");
      const name = window.localStorage.getItem("cf_user_name") ?? "";
      const firstName = window.localStorage.getItem("cf_user_first_name") ?? "";
      const lastName = window.localStorage.getItem("cf_user_last_name") ?? "";
      const derivedName = `${firstName} ${lastName}`.trim();
      const role = window.localStorage.getItem("cf_user_role") ?? "";
      setUser({
        name: name || derivedName,
        role,
        hasToken: Boolean(token),
      });
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("cf-auth-update", loadUser);
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("cf-auth-update", loadUser);
    };
  }, []);

  const initials = useMemo(() => {
    if (!user.name) return "U";
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${last}`.toUpperCase();
  }, [user.name]);

  const hiddenPaths = pathname === "/" || pathname === "/login";
  const isEmployeeRole = user.role.trim().toLowerCase() === "employee";
  const homePath = isEmployeeRole ? "/employee/dashboard" : "/dashboard";

  if (!user.hasToken || hiddenPaths) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href={homePath} className="text-sm font-semibold tracking-tight">
          CompanyFlow
        </Link>
        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          <div className="text-right">
            <div className="text-sm font-semibold leading-tight">
              {user.name || "Account"}
            </div>
            <div className="text-xs text-muted-foreground">
              {user.role || "User"}
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
