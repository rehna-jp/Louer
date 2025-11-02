import { z } from 'zod';

const toInt = (v, def) => {
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  return def;
};

export const createBookingSchema = z.object({
  listing_id: z.preprocess((v) => toInt(v), z.number().int().positive()),
  move_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  months: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().min(1).max(36).optional()),
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  move_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  months: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().min(1).max(36).optional()),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field must be provided for update' });

export const listBookingsQuerySchema = z.object({
  page: z.preprocess((v) => toInt(v, 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => toInt(v, 10), z.number().int().min(1).max(100).default(10)),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  listing_id: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().positive().optional()),
});
