import { z } from 'zod';

const toInt = (v, def) => {
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  return def;
};

export const createFavoriteSchema = z.object({
  listing_id: z.preprocess((v) => toInt(v), z.number().int().positive()),
});

export const listFavoritesQuerySchema = z.object({
  page: z.preprocess((v) => toInt(v, 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => toInt(v, 10), z.number().int().min(1).max(100).default(10)),
});
