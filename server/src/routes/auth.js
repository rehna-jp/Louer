import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool } from '../db.js';
import { signToken } from '../lib/jwt.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { email, password, role, name, phone } = parsed.data;

    const pool = getPool();
    // Check existing
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role, name, phone) VALUES (?,?,?,?,?)',
      [email, password_hash, role, name || null, phone || null]
    );

    const userId = result.insertId;
    const token = signToken({ id: userId, email, role });

    return res.status(201).json({
      user: { id: userId, email, role, name: name || null, phone: phone || null },
      token,
    });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }
    const { email, password } = parsed.data;

    const pool = getPool();
    const [rows] = await pool.query('SELECT id, email, password_hash, role, name, phone FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone },
      token,
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, email, role, name, phone, created_at, updated_at FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
