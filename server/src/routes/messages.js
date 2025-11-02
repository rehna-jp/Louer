import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createThreadSchema, listThreadsQuerySchema, createMessageSchema, listMessagesQuerySchema } from '../schemas/messages.js';

const router = express.Router();

// Create or retrieve a message thread between a tenant and a listing's landlord
// - Tenant can create a thread for a listing
// - Landlord cannot start a thread but can participate
router.post('/threads', requireAuth, async (req, res) => {
  try {
    const parsed = createThreadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { listing_id, tenant_id } = parsed.data;

    const pool = getPool();
    const [lrows] = await pool.query('SELECT id, landlord_id FROM listings WHERE id = ?', [listing_id]);
    if (lrows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    const landlord_id = lrows[0].landlord_id;
    let tenantId = tenant_id || req.user.id;

    // Only tenant can create a thread; landlords can only join existing threads
    if (req.user.role === 'landlord' && !tenant_id) {
      return res.status(403).json({ error: 'Landlord cannot start a thread without specifying a tenant_id' });
    }

    // If tenant creates and specifies tenant_id, ensure it matches req.user.id unless admin
    if (req.user.role === 'tenant' && tenant_id && tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check for existing thread
    const [exists] = await pool.query(
      'SELECT * FROM message_threads WHERE listing_id = ? AND tenant_id = ?',
      [listing_id, tenantId]
    );
    if (exists.length > 0) return res.json({ thread: exists[0], existed: true });

    const [result] = await pool.query(
      'INSERT INTO message_threads (listing_id, landlord_id, tenant_id) VALUES (?,?,?)',
      [listing_id, landlord_id, tenantId]
    );

    const [rows] = await pool.query('SELECT * FROM message_threads WHERE id = ?', [result.insertId]);
    return res.status(201).json({ thread: rows[0] });
  } catch (err) {
    console.error('Create thread error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List threads for current user (tenant sees their threads, landlord sees their listing threads)
router.get('/threads', requireAuth, async (req, res) => {
  try {
    const parsed = listThreadsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit, listing_id } = parsed.data;

    const pool = getPool();
    const where = [];
    const params = [];

    if (req.user.role === 'tenant') {
      where.push('t.tenant_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'landlord') {
      where.push('t.landlord_id = ?');
      params.push(req.user.id);
    }
    if (listing_id) { where.push('t.listing_id = ?'); params.push(listing_id); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(`SELECT COUNT(1) as count FROM message_threads t ${whereSql}`, params);
    const total = countRows[0].count;

    const [rows] = await pool.query(
      `SELECT t.*, l.title, l.location_city, l.location_area
       FROM message_threads t
       JOIN listings l ON l.id = t.listing_id
       ${whereSql}
       ORDER BY t.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({ page, limit, total, threads: rows });
  } catch (err) {
    console.error('List threads error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a thread, ensure the user participates
router.get('/threads/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM message_threads WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Thread not found' });
    const thread = rows[0];

    if (req.user.role === 'tenant' && thread.tenant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'landlord' && thread.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ thread });
  } catch (err) {
    console.error('Get thread error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Send message in a thread
router.post('/threads/:id/messages', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { content } = parsed.data;

    const pool = getPool();
    const [trows] = await pool.query('SELECT * FROM message_threads WHERE id = ?', [id]);
    if (trows.length === 0) return res.status(404).json({ error: 'Thread not found' });
    const thread = trows[0];

    if (req.user.role === 'tenant' && thread.tenant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'landlord' && thread.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const [result] = await pool.query(
      'INSERT INTO messages (thread_id, sender_id, content) VALUES (?,?,?)',
      [id, req.user.id, content]
    );

    // bump thread updated_at
    await pool.query('UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [id]);

    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error('Send message error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List messages in a thread
router.get('/threads/:id/messages', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const parsed = listMessagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const pool = getPool();
    const [trows] = await pool.query('SELECT * FROM message_threads WHERE id = ?', [id]);
    if (trows.length === 0) return res.status(404).json({ error: 'Thread not found' });
    const thread = trows[0];
    if (req.user.role === 'tenant' && thread.tenant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'landlord' && thread.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const [countRows] = await pool.query('SELECT COUNT(1) as count FROM messages WHERE thread_id = ?', [id]);
    const total = countRows[0].count;

    const [rows] = await pool.query(
      `SELECT m.* FROM messages m
       WHERE m.thread_id = ?
       ORDER BY m.created_at ASC
       LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );

    return res.json({ page, limit, total, messages: rows });
  } catch (err) {
    console.error('List messages error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
