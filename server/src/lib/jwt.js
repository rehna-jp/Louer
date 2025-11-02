import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export function signToken({ id, email, role }) {
  if (!id || !email || !role) {
    throw new Error('Missing fields to sign token');
  }
  const payload = {
    sub: String(id),
    email,
    role,
  };
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
