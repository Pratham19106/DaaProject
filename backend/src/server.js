import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { validateChatMessage } from './utils/validators.js';
import { GeminiService } from './services/gemini.js';
import exportRoutes from './routes/export.js';

const app = express();
const aiService = new GeminiService();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const validated = validateChatMessage(req.body);
    const { message, conversationId, context } = validated;

    const response = await aiService.chat(message, conversationId, context);

    res.json({
      success: true,
      data: response,
    });

  } catch (error) {
    logger.error(`Chat endpoint error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear conversation
app.delete('/api/conversation/:id', (req, res) => {
  const { id } = req.params;
  aiService.clearConversation(id);
  res.json({ success: true, message: 'Conversation cleared' });
});

// Export routes
app.use('/api/export', exportRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 TripPeIndia backend running on port ${PORT}`);
  logger.info(`AI Service: Google Gemini`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`CORS origin: ${config.corsOrigin}`);
});

export default app;
