import axios from "axios";
import type {
  ApiResponse,
  Company,
  Department,
  Designation,
  Employee,
  Level,
  Paginated,
} from "./types";
import { CreateCompanyPayload } from "./schema";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("cf_token");
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ token: string }>>(
      "/auth/login",
      { email, password },
    );
    return data;
  },
};

export const companiesApi = {
  list: async (params: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }) => {
    const { data } = await api.get<ApiResponse<Paginated<Company>>>(
      "/companies",
      { params },
    );
    return data;
  },
  create: async (payload: CreateCompanyPayload) => {
    const { data } = await api.post<ApiResponse<Company>>(
      "/companies",
      payload,
    );
    return data;
  },
  update: async (id: string, payload: Partial<Company>) => {
    const { data } = await api.put<ApiResponse<Company>>(
      `/companies/${id}`,
      payload,
    );
    return data;
  },
  delete: async (id: string, hard_delete = false) => {
    const { data } = await api.delete<ApiResponse<null>>(`/companies/${id}`, {
      params: { hard_delete },
    });
    return data;
  },
};

export const departmentsApi = {
  list: async (
    companyId: string,
    params: {
      page?: number;
      page_size?: number;
      status?: string;
      search?: string;
    },
  ) => {
    const { data } = await api.get<ApiResponse<Paginated<Department>>>(
      `/companies/${companyId}/departments`,
      { params },
    );
    return data;
  },
  create: async (
    companyId: string,
    payload: {
      name: string;
      status?: string;
      code?: string;
      description?: string;
      parent_department_id?: string | null;
    },
  ) => {
    const { data } = await api.post<ApiResponse<Department>>(
      `/companies/${companyId}/departments`,
      payload,
    );
    return data;
  },
  update: async (id: string, payload: Partial<Department>) => {
    const { data } = await api.put<ApiResponse<Department>>(
      `/departments/${id}`,
      payload,
    );
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/departments/${id}`);
    return data;
  },
};

export const designationsApi = {
  list: async (
    companyId: string,
    params: {
      page?: number;
      page_size?: number;
      status?: string;
      department_id?: string;
      level_id?: string;
      search?: string;
    },
  ) => {
    const { data } = await api.get<ApiResponse<Paginated<Designation>>>(
      `/companies/${companyId}/designations`,
      { params },
    );
    return data;
  },
  create: async (
    companyId: string,
    payload: {
      name: string;
      level_id?: string;
      department_id?: string;
      status?: string;
      description?: string;
    },
  ) => {
    const { data } = await api.post<ApiResponse<Designation>>(
      `/companies/${companyId}/designations`,
      payload,
    );
    return data;
  },
  update: async (id: string, payload: Partial<Designation>) => {
    const { data } = await api.put<ApiResponse<Designation>>(
      `/designations/${id}`,
      payload,
    );
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/designations/${id}`);
    return data;
  },
};

export const employeesApi = {
  list: async (
    companyId: string,
    params: {
      page?: number;
      page_size?: number;
      status?: string;
      department_id?: string;
      manager_id?: string;
      employment_type?: string;
      search?: string;
    },
  ) => {
    const { data } = await api.get<ApiResponse<Paginated<Employee>>>(
      `/companies/${companyId}/employees`,
      { params },
    );
    return data;
  },
  create: async (
    companyId: string,
    payload: Partial<Employee> & { email: string },
  ) => {
    const { data } = await api.post<ApiResponse<Employee>>(
      `/companies/${companyId}/employees`,
      payload,
    );
    return data;
  },
  update: async (id: string, payload: Partial<Employee>) => {
    const { data } = await api.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      payload,
    );
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/employees/${id}`);
    return data;
  },
};

export const levelsApi = {
  list: async (
    companyId: string,
    params: { page?: number; page_size?: number; search?: string },
  ) => {
    const { data } = await api.get<ApiResponse<Paginated<Level>>>(
      `/companies/${companyId}/levels`,
      { params },
    );
    return data;
  },
  create: async (
    companyId: string,
    payload: { name: string; hierarchy_level?: number },
  ) => {
    const { data } = await api.post<ApiResponse<Level>>(
      `/companies/${companyId}/levels`,
      payload,
    );
    return data;
  },
  update: async (id: string, payload: Partial<Level>) => {
    const { data } = await api.put<ApiResponse<Level>>(
      `/levels/${id}`,
      payload,
    );
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/levels/${id}`);
    return data;
  },
};
