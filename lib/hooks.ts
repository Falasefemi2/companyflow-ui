import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, companiesApi } from "./api";
import { toast } from "sonner";
import { CreateCompanyPayload } from "./schema";
import { AxiosError } from "axios";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companiesApi.create(payload),

    onSuccess: () => {
      toast.success("Company created successfully");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },

    onError: (error: AxiosError<unknown> | Error) => {
      const errorMessage = (error as AxiosError<any>).response?.data?.message || error.message;
      toast.error(errorMessage ?? "Failed to create company");
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      authApi.login(payload.email, payload.password),

    onSuccess: (response) => {
      const token = response?.data?.token;
      let decodedTokenClaims: Record<string, unknown> | null = null;

      if (token && typeof window !== "undefined") {
        try {
          const payload = token.split(".")[1];
          if (payload) {
            const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded =
              normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
            const json = window.atob(padded);
            decodedTokenClaims = JSON.parse(json) as Record<string, unknown>;
          }
        } catch {
          decodedTokenClaims = null;
        }
      }

      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("cf_token", token);
      }
      const companyId =
        response?.data?.company?.id ??
        response?.data?.employee?.company_id ??
        (decodedTokenClaims?.company_id as string | undefined);
      const employeeId =
        response?.data?.employee?.id ??
        (decodedTokenClaims?.employee_id as string | undefined);
      if (companyId && typeof window !== "undefined") {
        window.localStorage.setItem("cf_company_id", companyId);
      }
      if (employeeId && typeof window !== "undefined") {
        window.localStorage.setItem("cf_employee_id", employeeId);
      }
      const firstName = response?.data?.employee?.first_name ?? "";
      const lastName = response?.data?.employee?.last_name ?? "";
      const email = response?.data?.employee?.email ?? "";
      const fullName =
        `${firstName} ${lastName}`.trim() || email || "Account";
      const role = response?.data?.role ?? "User";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cf_user_name", fullName);
        window.localStorage.setItem("cf_user_first_name", firstName);
        window.localStorage.setItem("cf_user_last_name", lastName);
        window.localStorage.setItem("cf_user_role", role);
        window.dispatchEvent(new Event("cf-auth-update"));
      }
      toast.success(response?.message ?? "Login successful");
    },

    onError: (error: AxiosError<unknown> | Error) => {
      const errorMessage = (error as AxiosError<any>).response?.data?.message || error.message;
      toast.error(errorMessage ?? "Failed to log in");
    },
  });
};
