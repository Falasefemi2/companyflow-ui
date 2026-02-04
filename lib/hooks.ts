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
      toast.success(response?.message ?? "Login successful");
    },

    onError: (error: any) => {
      toast.error(error?.message ?? "Failed to log in");
    },
  });
};
