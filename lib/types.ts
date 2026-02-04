export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
};

export type Paginated<T> = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
  data: T[];
};

export type Company = {
  id: string;
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
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type Department = {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  parent_department_id?: string | null;
  cost_center?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Designation = {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  level_id?: string;
  department_id?: string;
  status: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Employee = {
  id: string;
  company_id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  department_id?: string;
  designation_id?: string;
  level_id?: string;
  manager_id?: string;
  role_id?: string;
  status?: "active" | "inactive" | "on_leave" | "terminated" | "probation";
  employment_type?: "full_time" | "part_time" | "contract" | "intern";
  hire_date?: string;
  termination_date?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_image_url?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type Level = {
  id: string;
  company_id: string;
  name: string;
  hierarchy_level?: number;
  min_salary?: number;
  max_salary?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
};
