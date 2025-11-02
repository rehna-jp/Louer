import express from 'express';
import { getPool } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createBookingSchema, updateBookingSchema, listBookingsQuerySchema } from '../schemas/bookings.js';

const router = express.Router();

// Create booking (tenant only)
router.post('/', requireAuth, requireRole('tenant', 'admin'), async (req, res) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { listing_id, move_in_date, months } = parsed.data;

    const pool = getPool();
    const [lrows] = await pool.query('SELECT id, price_monthly_cents, landlord_id FROM listings WHERE id = ?', [listing_id]);
    if (lrows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    const price_monthly_cents = lrows[0].price_monthly_cents;

    const [result] = await pool.query(
      `INSERT INTO bookings (listing_id, tenant_id, move_in_date, months, status, price_monthly_cents)
       VALUES (?,?,?,?, 'pending', ?)`,
      [listing_id, req.user.id, move_in_date, months || null, price_monthly_cents]
    );

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    return res.status(201).json({ booking: rows[0] });
  } catch (err) {
    console.error('Create booking error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List bookings (tenant sees own; landlord sees for their listings)
router.get('/', requireAuth, async (req, res) => {
  try {
    const parsed = listBookingsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit, status, listing_id } = parsed.data;
    const pool = getPool();

    const where = [];
    const params = [];

    if (req.user.role === 'tenant') {
      where.push('b.tenant_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'landlord') {
      where.push('l.landlord_id = ?');
      params.push(req.user.id);
    }

    if (status) { where.push('b.status = ?'); params.push(status); }
    if (listing_id) { where.push('b.listing_id = ?'); params.push(listing_id); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const offset = (page - 1) * limit;

    const [countRows] = await pool.query(
      `SELECT COUNT(1) as count
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       ${whereSql}`,
      params
    );
    const total = countRows[0].count;

    const [rows] = await pool.query(
      `SELECT b.*, l.title, l.location_city, l.location_area
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       ${whereSql}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({ page, limit, total, bookings: rows });
  } catch (err) {
    console.error('List bookings error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get booking by id (visible to tenant owner or landlord of listing)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT b.*, l.landlord_id, l.title, l.location_city, l.location_area
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = rows[0];

    if (req.user.role === 'tenant' && booking.tenant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (req.user.role === 'landlord' && booking.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    return res.json({ booking });
  } catch (err) {
    console.error('Get booking error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update booking status
// - Landlord can confirm/cancel pending bookings for their listings
// - Tenant can cancel their own pending booking
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const parsed = updateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const data = parsed.data;

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT b.*, l.landlord_id
       FROM bookings b
       JOIN listings l ON l.id = b.listing_id
       WHERE b.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = rows[0];

    // Permissions
    if (req.user.role === 'tenant') {
      if (booking.tenant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      // Tenant can only cancel when pending
      if (data.status && data.status !== 'cancelled') return res.status(403).json({ error: 'Tenant can only cancel their pending booking' });
      if (booking.status !== 'pending') return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
    } else if (req.user.role === 'landlord') {
      if (booking.landlord_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      if (booking.status !== 'pending') return res.status(400).json({ error: 'Only pending bookings can be updated' });
      if (data.status && !['confirmed','cancelled'].includes(data.status)) return res.status(400).json({ error: 'Invalid status transition' });
    }

    const fields = [];
    const params = [];
    for (const key of ['status','move_in_date','months']) {
      if (key in data) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(id);

    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, params);

    const [resultRows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    return res.json({ booking: resultRows[0] });
  } catch (err) {
    console.error('Update booking error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
