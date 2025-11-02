import express from 'express';
import { getPool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createFavoriteSchema, listFavoritesQuerySchema } from '../schemas/favorites.js';

const router = express.Router();

// Add favorite for current user
router.post('/', requireAuth, async (req, res) => {
  try {
    const parsed = createFavoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { listing_id } = parsed.data;
    const pool = getPool();

    // Ensure listing exists
    const [lrows] = await pool.query('SELECT id FROM listings WHERE id = ?', [listing_id]);
    if (lrows.length === 0) return res.status(404).json({ error: 'Listing not found' });

    // Insert favorite (unique pair constraint will prevent duplicates)
    await pool.query('INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)', [req.user.id, listing_id]);

    const [row] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND listing_id = ?', [req.user.id, listing_id]);
    return res.status(201).json({ favorite: row[0] });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already in favorites' });
    }
    console.error('Create favorite error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List favorites for current user with pagination
router.get('/', requireAuth, async (req, res) => {
  try {
    const parsed = listFavoritesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;
    const pool = getPool();

    const [countRows] = await pool.query('SELECT COUNT(1) as count FROM favorites WHERE user_id = ?', [req.user.id]);
    const total = countRows[0].count;

    const [rows] = await pool.query(
      `SELECT f.id as favorite_id, l.*
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    return res.json({ page, limit, total, favorites: rows });
  } catch (err) {
    console.error('List favorites error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove a favorite by favorite id (must belong to current user)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

    const pool = getPool();
    const [rows] = await pool.query('SELECT user_id FROM favorites WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Favorite not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await pool.query('DELETE FROM favorites WHERE id = ?', [id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete favorite error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
