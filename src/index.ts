import express from 'express';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Dynamic Knowledge Base API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// API routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌐 API base URL: http://localhost:${port}/api`);
});
