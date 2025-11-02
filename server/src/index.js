import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { bootstrapSchema } from './db.js';

const app = express();

// Security, CORS, logging, and JSON body parsing
app.use(helmet());
app.use(
  cors({
    origin: '*', // TODO: Restrict origins in production
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import bookingsRoutes from './routes/bookings.js';
import favoritesRoutes from './routes/favorites.js';
import messagesRoutes from './routes/messages.js';
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await bootstrapSchema();
    console.log('MySQL initialized and schema ensured.');
    app.listen(PORT, () => {
      console.log(`Dwello API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database', err);
    process.exit(1);
  }
})();
