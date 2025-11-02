import express from 'express';
import { getPool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createListingSchema, updateListingSchema, listQuerySchema } from '../schemas/listings.js';

const router = express.Router();

// Create listing (landlord only)
router.post('/', requireAuth, requireRole('landlord', 'admin'), async (req, res) => {
  try {
    const parsed = createListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const data = parsed.data;
    const pool = getPool();

    const [result] = await pool.query(
      `INSERT INTO listings (landlord_id, title, description, location_city, location_area, latitude, longitude, price_monthly_cents, currency, type, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        data.title,
        data.description || null,
        data.location_city || null,
        data.location_area || null,
        data.latitude ?? null,
        data.longitude ?? null,
        data.price_monthly_cents,
        (data.currency || 'USD').toUpperCase(),
        data.type,
        data.status || 'active',
      ]
    );

    const listingId = result.insertId;

    if (data.images?.length) {
      const values = data.images.map((url, i) => [listingId, url, i]);
      await pool.query(
        'INSERT INTO listing_images (listing_id, url, position) VALUES ?',[values]
      );
    }

    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [listingId]);
    return res.status(201).json({ listing: rows[0] });
  } catch (err) {
    console.error('Create listing error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List listings (public) with filters, pagination, and ordering
router.get('/', async (req, res) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit, status, type, city, landlord_id, q, order } = parsed.data;
    const pool = getPool();

    const where = [];
    const params = [];
    if (status) { where.push('l.status = ?'); params.push(status); }
    if (type) { where.push('l.type = ?'); params.push(type); }
    if (city) { where.push('l.location_city = ?'); params.push(city); }
    if (landlord_id) { where.push('l.landlord_id = ?'); params.push(landlord_id); }
    if (q) { where.push('(l.title LIKE ? OR l.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderSql = 'ORDER BY l.created_at DESC';
    if (order === 'price_asc') orderSql = 'ORDER BY l.price_monthly_cents ASC';
    if (order === 'price_desc') orderSql = 'ORDER BY l.price_monthly_cents DESC';

    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      `SELECT COUNT(1) as count FROM listings l ${whereSql}`,
      params
    );
    const total = countRows[0].count;

    const [rows] = await pool.query(
      `SELECT l.*,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('url', li.url, 'position', li.position))
               FROM listing_images li WHERE li.listing_id = l.id) AS images
       FROM listings l
       ${whereSql}
       ${orderSql}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({ page, limit, total, listings: rows });
  } catch (err) {
    console.error('List listings error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get listing by id (public)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT l.*,
              (SELECT JSON_ARRAYAGG(JSON_OBJECT('url', li.url, 'position', li.position))
               FROM listing_images li WHERE li.listing_id = l.id) AS images
       FROM listings l WHERE l.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('Get listing error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update listing (owner or admin)
router.put('/:id', requireAuth, requireRole('landlord', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const parsed = updateListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const data = parsed.data;

    const pool = getPool();
    // Ensure ownership unless admin
    if (req.user.role !== 'admin') {
      const [own] = await pool.query('SELECT id FROM listings WHERE id = ? AND landlord_id = ?', [id, req.user.id]);
      if (own.length === 0) return res.status(403).json({ error: 'Forbidden' });
    }

    const fields = [];
    const params = [];
    for (const key of ['title','description','location_city','location_area','latitude','longitude','price_monthly_cents','currency','type','status']) {
      if (key in data) {
        fields.push(`${key} = ?`);
        if (key === 'currency') params.push(String(data[key]).toUpperCase());
        else params.push(data[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    await pool.query(`UPDATE listings SET ${fields.join(', ')} WHERE id = ?`, params);

    // Optional: update images if provided
    if (Array.isArray(data.images)) {
      await pool.query('DELETE FROM listing_images WHERE listing_id = ?', [id]);
      if (data.images.length) {
        const values = data.images.map((url, i) => [id, url, i]);
        await pool.query('INSERT INTO listing_images (listing_id, url, position) VALUES ?', [values]);
      }
    }

    const [rows] = await pool.query('SELECT * FROM listings WHERE id = ?', [id]);
    return res.json({ listing: rows[0] });
  } catch (err) {
    console.error('Update listing error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete listing (owner or admin)
router.delete('/:id', requireAuth, requireRole('landlord', 'admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const pool = getPool();
    if (req.user.role !== 'admin') {
      const [own] = await pool.query('SELECT id FROM listings WHERE id = ? AND landlord_id = ?', [id, req.user.id]);
      if (own.length === 0) return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.query('DELETE FROM listings WHERE id = ?', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete listing error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
