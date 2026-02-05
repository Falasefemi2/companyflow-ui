import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, companiesApi } from "./api";
import { toast } from "sonner";
import { CreateCompanyPayload } from "./schema";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companiesApi.create(payload),

    onSuccess: () => {
      toast.success("Company created successfully");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },

    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to create company");
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      authApi.login(payload.email, payload.password),

    onSuccess: (response) => {
      const token = response?.data?.token;
      if (token && typeof window !== "undefined") {
        window.localStorage.setItem("cf_token", token);
      }
      const companyId =
        response?.data?.company?.id ?? response?.data?.employee?.company_id;
      if (companyId && typeof window !== "undefined") {
        window.localStorage.setItem("cf_company_id", companyId);
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

    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to log in");
    },
  });
};
