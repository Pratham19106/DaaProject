import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Gemini API (Only required API)
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  // SerpAPI (Optional - for real hotel data with images)
  serpapi: {
    apiKey: process.env.SERPAPI_KEY,
  },

  // Booking.com
  booking: {
    apiKey: process.env.BOOKING_API_KEY,
    host: process.env.BOOKING_API_HOST || 'booking-com.p.rapidapi.com',
  },

  // Amadeus
  amadeus: {
    apiKey: process.env.AMADEUS_API_KEY,
    apiSecret: process.env.AMADEUS_API_SECRET,
    baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com',
  },

  // Indian Railways
  railways: {
    apiKey: process.env.RAPIDAPI_KEY,
    host: process.env.RAILWAYS_API_HOST || 'indian-railway-irctc.p.rapidapi.com',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Caching
  cache: {
    ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 3600, // 1 hour
  },
};

// Validate critical config
const requiredEnvVars = [
  'GEMINI_API_KEY', // Only Gemini API required!
];

const missing = requiredEnvVars.filter(key => !process.env[key]);
if (missing.length > 0 && config.nodeEnv !== 'test') {
  console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
  console.warn('Some features may not work. See .env.example');
}
