import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(100),
  role: z.enum(['tenant', 'landlord']).default('tenant'),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(100),
});
