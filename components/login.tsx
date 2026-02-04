"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Building2, Users, Zap } from "lucide-react";
import { Card } from "./ui/card";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useLogin } from "@/lib/hooks";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const router = useRouter();
  const { mutate, isPending } = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        router.push("/dashboard");
      },
    });
  }

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
              <h1 className="text-2xl font-bold tracking-tight text-balance">
                CompanyFlow
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight text-balance">
                Welcome Back, Admin
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Log in to manage your company workspace, departments, and team
                structure in CompanyFlow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <FeatureCard
                icon={<Building2 className="w-5 h-5" />}
                title="Company Hub"
                description="Centralize your org data"
              />
              <FeatureCard
                icon={<Users className="w-5 h-5" />}
                title="Team Access"
                description="Invite and manage staff"
              />
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Insights"
                description="Track company metrics"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Fast Actions"
                description="Get things done quickly"
              />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Admin Login</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sign in with your company admin account
                  </p>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <FormInput
                      control={form.control}
                      name="email"
                      label="Email"
                      placeholder="admin@company.com"
                      type="email"
                    />
                    <FormInput
                      control={form.control}
                      name="password"
                      label="Password"
                      placeholder="••••••••"
                      type="password"
                    />
                  </FieldGroup>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                  >
                    {isPending && (
                      <Zap className="w-5 h-5 mr-2 animate-spin" />
                    )}
                    Log In
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  Need to create a company?{" "}
                  <Link
                    href="/"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Start here
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-4 rounded-lg border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50 cursor-default">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
