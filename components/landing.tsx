"use client";

import React from "react";
import Link from "next/link";

import { BarChart3, Building2, Users, Zap } from "lucide-react";
import { Card } from "./ui/card";
import * as z from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type FieldValues,
  type Control,
  type Path,
} from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useCreateCompany } from "@/lib/hooks";
import * as motion from "motion/react-client";

const companyAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().max(100).optional(),
});

export const formSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(255),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(255),
  industry: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  registration_number: z.string().max(100).optional(),
  tax_id: z.string().max(100).optional(),
  address: z.string().optional(),
  phone: z.string().max(100).optional(),
  logo_url: z.string().optional(),
  status: z.enum(["active", "suspended", "inactive"]),
  admin: companyAdminSchema,
});

interface CompanyFormValues extends FieldValues {
  name: string;
  slug: string;
  industry?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  registration_number?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  status: "active" | "suspended" | "inactive";
  admin: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
}

const splitText = (text: string) => {
  return text.split(""); // Returns array of individual characters
};

export function LandingPage() {
  const { mutate, isPending } = useCreateCompany();
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      industry: "",
      country: "",
      timezone: "",
      currency: "",
      registration_number: "",
      tax_id: "",
      address: "",
      phone: "",
      logo_url: "",
      status: "active",
      admin: {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
      },
    },
  });

  function onSubmit(data: CompanyFormValues) {
    mutate(data, {
      onSuccess: () => {
        form.reset();
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
                Manage Your Organization Effortlessly
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                {splitText(
                  "Create your company workspace and start organizing departments, managing employees, and tracking organizational structure with CompanyFlow.",
                ).map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }} // Each letter delays by 0.05s
                  >
                    {letter}
                  </motion.span>
                ))}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <FeatureCard
                icon={<Building2 className="w-5 h-5" />}
                title="Organize Structure"
                description="Define departments and hierarchies"
              />
              <FeatureCard
                icon={<Users className="w-5 h-5" />}
                title="Manage Team"
                description="Track employees and designations"
              />
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Analytics"
                description="Monitor organizational metrics"
              />
              <FeatureCard
                icon={<Zap className="w-5 h-5" />}
                title="Quick Setup"
                description="Get started in minutes"
              />
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <Card className="p-8 border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Create Your Company</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set up your admin account and company workspace
                  </p>
                </div>

                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <FormInput
                      control={form.control}
                      name="name"
                      label="Company Name"
                      placeholder="Acme Inc"
                    />
                    <FormInput
                      control={form.control}
                      name="slug"
                      label="Company Slug"
                      placeholder="acme-inc"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="industry"
                        label="Industry"
                        placeholder="Fintech"
                      />
                      <FormInput
                        control={form.control}
                        name="country"
                        label="Country"
                        placeholder="Nigeria"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="timezone"
                        label="Timezone"
                        placeholder="Africa/Lagos"
                      />
                      <FormInput
                        control={form.control}
                        name="currency"
                        label="Currency"
                        placeholder="NGN"
                      />
                    </div>
                    <FormInput
                      control={form.control}
                      name="address"
                      label="Address"
                      placeholder="123 Business St, Lagos"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        control={form.control}
                        name="registration_number"
                        label="Registration Number"
                        placeholder="REG-001234"
                      />
                      <FormInput
                        control={form.control}
                        name="tax_id"
                        label="Tax ID"
                        placeholder="TAX-001234"
                      />
                    </div>
                    <FormInput
                      control={form.control}
                      name="logo_url"
                      label="Logo URL"
                      placeholder="https://example.com/logo.png"
                    />
                    <FormInput
                      control={form.control}
                      name="phone"
                      label="Phone"
                      placeholder="+234 123 456 7890"
                    />
                  </FieldGroup>

                  <div className="border-t border-border/20 pt-6">
                    <h4 className="text-sm font-semibold mb-4">
                      Admin Account
                    </h4>
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          control={form.control}
                          name="admin.first_name"
                          label="First Name"
                          placeholder="John"
                        />
                        <FormInput
                          control={form.control}
                          name="admin.last_name"
                          label="Last Name"
                          placeholder="Doe"
                        />
                      </div>
                      <FormInput
                        control={form.control}
                        name="admin.email"
                        label="Email"
                        placeholder="john@acme.com"
                        type="email"
                      />
                      <FormInput
                        control={form.control}
                        name="admin.password"
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                      />
                    </FieldGroup>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                  >
                    {isPending && <Zap className="w-5 h-5 mr-2 animate-spin" />}
                    Create Company & Account
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  By creating a company, you agree to our Terms of Service
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Already have an admin account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Log in
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
    <motion.div
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      className="group p-4 rounded-lg border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 hover:border-primary/50 cursor-default"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
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
