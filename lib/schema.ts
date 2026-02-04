import { z } from "zod";

export const companyAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),

  industry: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  registration_number: z.string().max(100).optional(),
  tax_id: z.string().max(100).optional(),
  address: z.string().optional(),
  phone: z.string().max(100).optional(),
  logo_url: z.string().optional(),

  status: z.enum(["active", "suspended", "inactive"]).optional(),

  admin: companyAdminSchema,
});

export type CreateCompanyPayload = z.infer<typeof createCompanySchema>;
