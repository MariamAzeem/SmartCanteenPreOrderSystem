import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import queueRoutes from './routes/queue';
import analyticsRoutes from './routes/analytics';
import managerAiRoutes from './routes/managerAi';
import adminReportsRoutes from './routes/adminReports';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Security & CORS Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Idempotency-Key, X-User-Role');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Smart Canteen Pre-Order & Queue Engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular REST routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/manager', managerAiRoutes);
app.use('/api/admin/reports', adminReportsRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Canteen API Error]', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Canteen Server Error',
  });
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Smart Canteen Backend Server running on http://localhost:${PORT}`);
  });
}

export { app, server };
