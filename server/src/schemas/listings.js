import { z } from 'zod';

const toInt = (v, def) => {
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  return def;
};

export const createListingSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(5000).optional(),
  location_city: z.string().max(100).optional(),
  location_area: z.string().max(100).optional(),
  latitude: z.preprocess((v) => (v === undefined || v === null ? undefined : Number(v)), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess((v) => (v === undefined || v === null ? undefined : Number(v)), z.number().min(-180).max(180).optional()),
  price_monthly_cents: z.preprocess((v) => toInt(v), z.number().int().positive()),
  currency: z.string().length(3).default('USD'),
  type: z.enum(['room', 'apartment', 'hostel', 'studio']),
  status: z.enum(['active', 'occupied', 'inactive', 'draft']).optional(),
  images: z.array(z.string().url()).max(10).optional(),
});

export const updateListingSchema = createListingSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const listQuerySchema = z.object({
  page: z.preprocess((v) => toInt(v, 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => toInt(v, 10), z.number().int().min(1).max(100).default(10)),
  status: z.enum(['active', 'occupied', 'inactive', 'draft']).optional(),
  type: z.enum(['room', 'apartment', 'hostel', 'studio']).optional(),
  city: z.string().max(100).optional(),
  landlord_id: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().positive().optional()),
  q: z.string().max(200).optional(),
  order: z.enum(['newest', 'price_asc', 'price_desc']).optional(),
});
