import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config';
import { errorHandler } from './middleware/errorHandler';
import { auditLog } from './middleware/auditLog';
import authRoutes from './routes/authRoutes';
import routeRoutes from './routes/routeRoutes';

const app: Express = express();

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Audit logging middleware
app.use(auditLog);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Pathly Backend Server running on port ${PORT}`);
  console.log(`📁 Environment: ${config.server.nodeEnv}`);
  console.log(`🗄️ Database: ${config.database.database}@${config.database.host}`);
});
