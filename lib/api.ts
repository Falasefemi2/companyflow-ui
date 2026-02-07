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

const getString = (value?: string | null): string => value ?? "";

const getNullableString = (value?: string | null): string | undefined =>
  value ?? undefined;

const getNullableNumber = (value?: number | null): number | undefined =>
  value ?? undefined;

const normalizeStatus = <T extends string>(
  value: string | null | undefined,
  allowed: T[],
): T | undefined => {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  return allowed.find((v) => v.toLowerCase() === lower) as T | undefined;
};

const normalizeDepartment = (item: RawDepartment): Department => ({
  id: getString(item?.id ?? item?.ID),
  company_id: getString(item?.company_id ?? item?.CompanyID),
  name: getString(item?.name ?? item?.Name),
  code: getString(item?.code ?? item?.Code),
  description: getString(item?.description ?? item?.Description),
  parent_department_id: getNullableString(
    item?.parent_department_id ?? item?.ParentDepartmentID,
  ),
  cost_center: getString(item?.cost_center ?? item?.CostCenter),
  status: normalizeStatus(item?.status ?? item?.Status, ["active", "inactive"]),
  created_at: getString(item?.created_at ?? item?.CreatedAt),
  updated_at: getString(item?.updated_at ?? item?.UpdatedAt),
});

const normalizeLevel = (item: RawLevel): Level => ({
  id: getString(item?.id ?? item?.ID),
  company_id: getString(item?.company_id ?? item?.CompanyID),
  name: getString(item?.name ?? item?.Name),
  hierarchy_level: getNullableNumber(
    item?.hierarchy_level ?? item?.HierarchyLevel,
  ),
  min_salary: getNullableNumber(item?.min_salary ?? item?.MinSalary),
  max_salary: getNullableNumber(item?.max_salary ?? item?.MaxSalary),
  description: getString(item?.description ?? item?.Description),
  created_at: getString(item?.created_at ?? item?.CreatedAt),
  updated_at: getString(item?.updated_at ?? item?.UpdatedAt),
});

const normalizeDesignation = (item: RawDesignation): Designation => ({
  id: getString(item?.id ?? item?.ID),
  company_id: getString(item?.company_id ?? item?.CompanyID),
  name: getString(item?.name ?? item?.Name),
  description: getString(item?.description ?? item?.Description),
  level_id: getNullableString(item?.level_id ?? item?.LevelID),
  department_id: getNullableString(item?.department_id ?? item?.DepartmentID),
  status: normalizeStatus(item?.status ?? item?.Status, ["active", "inactive"]),
  created_at: getString(item?.created_at ?? item?.CreatedAt),
  updated_at: getString(item?.updated_at ?? item?.UpdatedAt),
});

const normalizeEmployee = (item: RawEmployee): Employee => ({
  id: getString(item?.id ?? item?.ID),
  company_id: getString(item?.company_id ?? item?.CompanyID),
  email: getString(item?.email ?? item?.Email),
  phone: getString(item?.phone ?? item?.Phone),
  first_name: getString(item?.first_name ?? item?.FirstName),
  last_name: getString(item?.last_name ?? item?.LastName),
  employee_code: getString(item?.employee_code ?? item?.EmployeeCode),
  department_id: getNullableString(item?.department_id ?? item?.DepartmentID),
  designation_id: getNullableString(
    item?.designation_id ?? item?.DesignationID,
  ),
  level_id: getNullableString(item?.level_id ?? item?.LevelID),
  manager_id: getNullableString(item?.manager_id ?? item?.ManagerID),
  role_id: getNullableString(item?.role_id ?? item?.RoleID),
  status: normalizeStatus(item?.status ?? item?.Status, [
    "active",
    "inactive",
    "on_leave",
    "terminated",
    "probation",
  ]),
  employment_type: normalizeStatus(
    item?.employment_type ?? item?.EmploymentType,
    ["full_time", "part_time", "contract", "intern"],
  ),
  hire_date: getString(item?.hire_date ?? item?.HireDate),
  termination_date: getNullableString(
    item?.termination_date ?? item?.TerminationDate,
  ),
  date_of_birth: getNullableString(item?.date_of_birth ?? item?.DateOfBirth),
  gender: getNullableString(item?.gender ?? item?.Gender),
  address: getNullableString(item?.address ?? item?.Address),
  emergency_contact_name: getNullableString(
    item?.emergency_contact_name ?? item?.EmergencyContactName,
  ),
  emergency_contact_phone: getNullableString(
    item?.emergency_contact_phone ?? item?.EmergencyContactPhone,
  ),
  profile_image_url: getNullableString(
    item?.profile_image_url ?? item?.ProfileImageUrl,
  ),
  last_login_at: getNullableString(item?.last_login_at ?? item?.LastLoginAt),
  created_at: getString(item?.created_at ?? item?.CreatedAt),
  updated_at: getString(item?.updated_at ?? item?.UpdatedAt),
});

const normalizeRole = (item: RawRole): Role => ({
  id: getString(item?.id ?? item?.ID),
  company_id: getString(item?.company_id ?? item?.CompanyID),
  name: getString(item?.name ?? item?.Name),
  description: getString(item?.description ?? item?.Description),
  is_system_role: Boolean(item?.is_system_role ?? item?.IsSystemRole),
  permission_cache: (item?.permission_cache ?? item?.Permission_Cache) as
    | string[]
    | undefined,
  created_at: getString(item?.created_at ?? item?.CreatedAt),
  updated_at: getString(item?.updated_at ?? item?.UpdatedAt),
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
