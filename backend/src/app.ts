import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import routes from './routes/index';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', apiRateLimiter);

// Base Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
