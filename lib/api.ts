import axios from "axios";
import type {
  ApiResponse,
  Company,
  Department,
  Designation,
  Employee,
  Level,
  LoginResponse,
  Paginated,
  Role,
  RawDepartment,
  RawDesignation,
  RawEmployee,
  RawLevel,
  RawRole,
} from "./types";
import { CreateCompanyPayload } from "./schema";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeDepartment = (item: RawDepartment): Department => ({
  id: item?.id ?? item?.ID,
  company_id: item?.company_id ?? item?.CompanyID,
  name: item?.name ?? item?.Name,
  code: item?.code ?? item?.Code,
  description: item?.description ?? item?.Description,
  parent_department_id: item?.parent_department_id ?? item?.ParentDepartmentID,
  cost_center: item?.cost_center ?? item?.CostCenter,
  status: item?.status ?? item?.Status,
  created_at: item?.created_at ?? item?.CreatedAt,
  updated_at: item?.updated_at ?? item?.UpdatedAt,
});

const normalizeLevel = (item: RawLevel): Level => ({
  id: item?.id ?? item?.ID,
  company_id: item?.company_id ?? item?.CompanyID,
  name: item?.name ?? item?.Name,
  hierarchy_level: item?.hierarchy_level ?? item?.HierarchyLevel,
  min_salary: item?.min_salary ?? item?.MinSalary,
  max_salary: item?.max_salary ?? item?.MaxSalary,
  description: item?.description ?? item?.Description,
  created_at: item?.created_at ?? item?.CreatedAt,
  updated_at: item?.updated_at ?? item?.UpdatedAt,
});

const normalizeDesignation = (item: RawDesignation): Designation => ({
  id: item?.id ?? item?.ID,
  company_id: item?.company_id ?? item?.CompanyID,
  name: item?.name ?? item?.Name,
  description: item?.description ?? item?.Description,
  level_id: item?.level_id ?? item?.LevelID,
  department_id: item?.department_id ?? item?.DepartmentID,
  status: item?.status ?? item?.Status,
  created_at: item?.created_at ?? item?.CreatedAt,
  updated_at: item?.updated_at ?? item?.UpdatedAt,
});

const normalizeEmployee = (item: RawEmployee): Employee => ({
  id: item?.id ?? item?.ID,
  company_id: item?.company_id ?? item?.CompanyID,
  email: item?.email ?? item?.Email,
  phone: item?.phone ?? item?.Phone,
  first_name: item?.first_name ?? item?.FirstName,
  last_name: item?.last_name ?? item?.LastName,
  employee_code: item?.employee_code ?? item?.EmployeeCode,
  department_id: item?.department_id ?? item?.DepartmentID,
  designation_id: item?.designation_id ?? item?.DesignationID,
  level_id: item?.level_id ?? item?.LevelID,
  manager_id: item?.manager_id ?? item?.ManagerID,
  role_id: item?.role_id ?? item?.RoleID,
  status: item?.status ?? item?.Status,
  employment_type: item?.employment_type ?? item?.EmploymentType,
  hire_date: item?.hire_date ?? item?.HireDate,
  termination_date: item?.termination_date ?? item?.TerminationDate,
  date_of_birth: item?.date_of_birth ?? item?.DateOfBirth,
  gender: item?.gender ?? item?.Gender,
  address: item?.address ?? item?.Address,
  emergency_contact_name:
    item?.emergency_contact_name ?? item?.EmergencyContactName,
  emergency_contact_phone:
    item?.emergency_contact_phone ?? item?.EmergencyContactPhone,
  profile_image_url: item?.profile_image_url ?? item?.ProfileImageUrl,
  last_login_at: item?.last_login_at ?? item?.LastLoginAt,
  created_at: item?.created_at ?? item?.CreatedAt,
  updated_at: item?.updated_at ?? item?.UpdatedAt,
});

const normalizeRole = (item: RawRole): Role => ({
  id: item?.id ?? item.ID,
  company_id: item?.company_id ?? item?.CompanyID,
  name: item?.name ?? item?.Name,
  description: item?.description ?? item?.Description,
  is_system_role: item?.is_system_role ?? item?.IsSystemRole,
  permission_cache: item?.permission_cache ?? item?.Permission_Cache,
  created_at: item?.created_at ?? item?.CreatedAt,
  updated_at: item?.updated_at ?? item.UpdatedAt,
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
    const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });
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
    const items = data?.data?.data ?? [];
    return {
      ...data,
      data: {
        ...data.data,
        data: items.map(normalizeDepartment),
      },
    };
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
    return {
      ...data,
      data: normalizeDepartment(data.data),
    };
  },
  update: async (id: string, payload: Partial<Department>) => {
    const { data } = await api.put<ApiResponse<Department>>(
      `/departments/${id}`,
      payload,
    );
    return {
      ...data,
      data: normalizeDepartment(data.data),
    };
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
    const items = data?.data?.data ?? [];
    return {
      ...data,
      data: {
        ...data.data,
        data: items.map(normalizeDesignation),
      },
    };
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
    return {
      ...data,
      data: normalizeDesignation(data.data),
    };
  },
  update: async (id: string, payload: Partial<Designation>) => {
    const { data } = await api.put<ApiResponse<Designation>>(
      `/designations/${id}`,
      payload,
    );
    return {
      ...data,
      data: normalizeDesignation(data.data),
    };
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
    const items = data?.data?.data ?? [];
    return {
      ...data,
      data: {
        ...data.data,
        data: items.map(normalizeEmployee),
      },
    };
  },
  create: async (
    companyId: string,
    payload: Partial<Employee> & { email: string },
  ) => {
    const { data } = await api.post<ApiResponse<Employee>>(
      `/companies/${companyId}/employees`,
      payload,
    );
    return {
      ...data,
      data: normalizeEmployee(data.data),
    };
  },
  update: async (id: string, payload: Partial<Employee>) => {
    const { data } = await api.put<ApiResponse<Employee>>(
      `/employees/${id}`,
      payload,
    );
    return {
      ...data,
      data: normalizeEmployee(data.data),
    };
  },
  patch: async (id: string, payload: Partial<Employee>) => {
    const { data } = await api.patch<ApiResponse<Employee>>(
      `/employees/${id}`,
      payload,
    );
    return {
      ...data,
      data: normalizeEmployee(data.data),
    };
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
    const items = data?.data?.data ?? [];
    return {
      ...data,
      data: {
        ...data.data,
        data: items.map(normalizeLevel),
      },
    };
  },
  create: async (
    companyId: string,
    payload: { name: string; hierarchy_level?: number },
  ) => {
    const { data } = await api.post<ApiResponse<Level>>(
      `/companies/${companyId}/levels`,
      payload,
    );
    return {
      ...data,
      data: normalizeLevel(data.data),
    };
  },
  update: async (id: string, payload: Partial<Level>) => {
    const { data } = await api.put<ApiResponse<Level>>(
      `/levels/${id}`,
      payload,
    );
    return {
      ...data,
      data: normalizeLevel(data.data),
    };
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/levels/${id}`);
    return data;
  },
};

export const roleApi = {
  list: async (
    companyId: string,
    params: { page?: number; page_size?: number; search?: string },
  ) => {
    const { data } = await api.get<ApiResponse<Paginated<Role>>>(
      `/companies/${companyId}/roles`,
      { params },
    );
    const items = data?.data?.data ?? [];
    return {
      ...data,
      data: {
        ...data.data,
        data: items.map(normalizeRole),
      },
    };
  },
  create: async (
    companyId: string,
    payload: { name: string; description: string; permissions_cache: string[] },
  ) => {
    const { data } = await api.post<ApiResponse<Role>>(
      `/companies/${companyId}/roles`,
      payload,
    );
    return {
      ...data,
      data: normalizeRole(data.data),
    };
  },
  update: async (id: string, payload: Partial<Role>) => {
    const { data } = await api.put<ApiResponse<Role>>(`/roles/${id}`, payload);
    return {
      ...data,
      data: normalizeRole(data.data),
    };
  },
  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/roles/${id}`);
    return data;
  },
};
