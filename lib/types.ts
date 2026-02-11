/** @format */

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
  settings?: Record<string, unknown> | string;
  created_at?: string;
  updated_at?: string;
};

export type Department = {
  id: string;
  company_id?: string;
  name?: string;
  code?: string;
  description?: string;
  parent_department_id?: string | null;
  cost_center?: string;
  status?: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Designation = {
  id: string;
  company_id?: string;
  name?: string;
  description?: string;
  level_id?: string;
  department_id?: string;
  status?: "active" | "inactive";
  created_at?: string;
  updated_at?: string;
};

export type Employee = {
  id: string;
  company_id?: string;
  email?: string;
  password?: string;
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
  company_id?: string;
  name?: string;
  hierarchy_level?: number;
  min_salary?: number;
  max_salary?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type LoginResponse = {
  token: string;
  role?: string;
  employee?: Employee;
  company?: Company;
};

export type Role = {
  id: string;
  company_id?: string;
  name?: string;
  description?: string;
  is_system_role?: boolean;
  permission_cache?: string[];
  created_at?: string;
  updated_at?: string;
};

export type RawDepartment = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  description?: string;
  Description?: string;
  parent_department_id?: string | null;
  ParentDepartmentID?: string | null;
  cost_center?: string;
  CostCenter?: string;
  status?: "active" | "inactive";
  Status?: "active" | "inactive";
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type RawLevel = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  name?: string;
  Name?: string;
  hierarchy_level?: number;
  HierarchyLevel?: number;
  min_salary?: number;
  MinSalary?: number;
  max_salary?: number;
  MaxSalary?: number;
  description?: string;
  Description?: string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type RawDesignation = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  level_id?: string;
  LevelID?: string;
  department_id?: string;
  DepartmentID?: string;
  status?: "active" | "inactive";
  Status?: "active" | "inactive";
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type RawEmployee = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  email?: string;
  Email?: string;
  password?: string;
  Password?: string;
  phone?: string;
  Phone?: string;
  first_name?: string;
  FirstName?: string;
  last_name?: string;
  LastName?: string;
  employee_code?: string;
  EmployeeCode?: string;
  department_id?: string;
  DepartmentID?: string;
  designation_id?: string;
  DesignationID?: string;
  level_id?: string;
  LevelID?: string;
  manager_id?: string;
  ManagerID?: string;
  role_id?: string;
  RoleID?: string;
  status?: "active" | "inactive" | "on_leave" | "terminated" | "probation";
  Status?: "active" | "inactive" | "on_leave" | "terminated" | "probation";
  employment_type?: "full_time" | "part_time" | "contract" | "intern";
  EmploymentType?: "full_time" | "part_time" | "contract" | "intern";
  hire_date?: string;
  HireDate?: string;
  termination_date?: string;
  TerminationDate?: string;
  date_of_birth?: string;
  DateOfBirth?: string;
  gender?: string;
  Gender?: string;
  address?: string;
  Address?: string;
  emergency_contact_name?: string;
  EmergencyContactName?: string;
  emergency_contact_phone?: string;
  EmergencyContactPhone?: string;
  profile_image_url?: string;
  ProfileImageUrl?: string;
  last_login_at?: string;
  LastLoginAt?: string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type RawRole = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  name?: string;
  Name?: string;
  description?: string;
  Description?: string;
  is_system_role?: boolean;
  IsSystemRole?: boolean;
  permission_cache?: string[];
  Permission_Cache?: string[];
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type Permission = {
  id: string;
  role_id: string;
  action: string;
  resource: string;
  conditions?: Record<string, unknown>;
  created_at: string;
};

export type CreatePermissionRequest = {
  action: string;
  resource: string;
  conditions?: Record<string, unknown>;
};

export type UpdatePermissionRequest = {
  action?: string;
  resource?: string;
  conditions?: Record<string, unknown>;
};

export type LeaveType = {
  id: string;
  company_id?: string;
  name?: string;
  code?: string;
  description?: string;
  carryForwardAllowed?: boolean;
  colorCode?: string;
  daysAllowed?: number;
  isPaid?: boolean;
  maxCarryForwardDays?: number;
  requiresDocumentation?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type RawLeaveType = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  name?: string;
  Name?: string;
  code?: string;
  Code?: string;
  description?: string;
  Description?: string;
  carryForwardAllowed?: boolean;
  CarryForwardAllowed?: boolean;
  carry_forward_allowed?: boolean | null;
  colorCode?: string;
  ColorCode?: string;
  color_code?: string | null;
  daysAllowed?: number;
  DaysAllowed?: number;
  days_allowed?: number | null;
  isPaid?: boolean;
  IsPaid?: boolean;
  is_paid?: boolean | null;
  maxCarryForwardDays?: number;
  MaxCarryForwardDays?: number;
  max_carry_forward_days?: number | null;
  requiresDocumentation?: boolean;
  RequiresDocumentation?: boolean;
  requires_documentation?: boolean | null;
  status?: string;
  Status?: string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
};

export type LeaveRequest = {
  id: string;
  company_id?: string;
  employee_id?: string;
  leave_type_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: "pending" | "approved" | "rejected";
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  rejected_at?: string;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
  leave_type?: LeaveType;
};

export type RawLeaveRequest = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  employee_id?: string;
  EmployeeID?: string;
  leave_type_id?: string;
  LeaveTypeID?: string;
  start_date?: string;
  StartDate?: string;
  end_date?: string;
  EndDate?: string;
  reason?: string;
  Reason?: string;
  status?: "pending" | "approved" | "rejected";
  Status?: "pending" | "approved" | "rejected";
  approved_by?: string;
  ApprovedBy?: string;
  approved_at?: string;
  ApprovedAt?: string;
  rejection_reason?: string;
  RejectionReason?: string;
  rejected_at?: string;
  RejectedAt?: string;
  created_at?: string;
  CreatedAt?: string;
  updated_at?: string;
  UpdatedAt?: string;
  employee?: RawEmployee;
  Employee?: RawEmployee;
  leave_type?: RawLeaveType;
  LeaveType?: RawLeaveType;
};

export type LeaveBalance = {
  id?: string;
  company_id?: string;
  employee_id?: string;
  leave_type_id?: string;
  leave_type_name?: string;
  year?: number;
  total_days?: number;
  used_days?: number;
  pending_days?: number;
  carried_forward_days?: number;
  available?: number;
  balance?: number;
};

export type RawLeaveBalance = {
  id?: string;
  ID?: string;
  company_id?: string;
  CompanyID?: string;
  employee_id?: string;
  EmployeeID?: string;
  leave_type_id?: string;
  LeaveTypeID?: string;
  leave_type_name?: string;
  LeaveTypeName?: string;
  year?: number;
  Year?: number;
  total_days?: number;
  TotalDays?: number;
  used_days?: number;
  UsedDays?: number;
  pending_days?: number;
  PendingDays?: number;
  carried_forward_days?: number;
  CarriedForwardDays?: number;
  available?: number;
  Available?: number;
  balance?: number;
  Balance?: number;
};
