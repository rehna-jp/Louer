import { z } from 'zod';

const toInt = (v, def) => {
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) return n;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
  return def;
};

export const createThreadSchema = z.object({
  listing_id: z.preprocess((v) => toInt(v), z.number().int().positive()),
  tenant_id: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().positive().optional()),
});

export const listThreadsQuerySchema = z.object({
  page: z.preprocess((v) => toInt(v, 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => toInt(v, 10), z.number().int().min(1).max(100).default(10)),
  listing_id: z.preprocess((v) => (v == null ? undefined : toInt(v)), z.number().int().positive().optional()),
});

export const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const listMessagesQuerySchema = z.object({
  page: z.preprocess((v) => toInt(v, 1), z.number().int().min(1).default(1)),
  limit: z.preprocess((v) => toInt(v, 20), z.number().int().min(1).max(200).default(20)),
});
