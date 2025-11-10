/**
 * Function calling schemas for Gemini
 * These define the tools the LLM can invoke
 */

export const toolSchemas = [
  {
    name: 'searchAttractions',
    description: 'MUST CALL THIS for any attraction/activity request. Search for tourist attractions, landmarks, and points of interest in a city using real data from Google Maps. Returns actual places with images, ratings, reviews, descriptions, opening hours, contact info, and GPS coordinates. Use this to get real attraction data, not mock data. ALWAYS include user interest categories.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name in India (REQUIRED, e.g., "Jaipur", "Goa")',
        },
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Interest categories (RECOMMENDED): history, nature, beaches, spirituality, adventure, shopping, food',
        },
        minRating: {
          type: 'number',
          description: 'Minimum rating filter (1-5, default: 4.0)',
          default: 4.0,
        },
        maxResults: {
          type: 'integer',
          description: 'Number of attractions to return (default: 10)',
          default: 10,
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'getRestaurants',
    description: 'Find restaurants and dining options in a city with cuisine, ratings, and price levels.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name in India',
        },
        cuisines: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preferred cuisines (e.g., "North Indian", "South Indian", "Chinese")',
        },
        diet: {
          type: 'string',
          enum: ['any', 'vegetarian', 'vegan', 'halal', 'non-veg'],
          description: 'Dietary restriction',
          default: 'any',
        },
        minRating: {
          type: 'number',
          description: 'Minimum rating (1-5)',
          default: 4.0,
        },
        priceLevel: {
          type: 'integer',
          description: 'Price level: 1=budget, 2=moderate, 3=expensive, 4=luxury',
        },
        maxResults: {
          type: 'integer',
          default: 8,
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'getHotels',
    description: 'MUST CALL THIS for any hotel/accommodation request. Search for hotels and accommodations with real hotel data including images, logos, availability, prices, ratings, amenities, and guest reviews. Returns hotels from Google Hotels API with photos and detailed information. ALWAYS include checkin and checkout dates.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name in India (REQUIRED)',
        },
        checkin: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format (REQUIRED)',
        },
        checkout: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format (REQUIRED)',
        },
        adults: {
          type: 'integer',
          description: 'Number of adults (REQUIRED, default: 2)',
          default: 2,
        },
        children: {
          type: 'integer',
          description: 'Number of children (default: 0)',
          default: 0,
        },
        rooms: {
          type: 'integer',
          description: 'Number of rooms (default: 1)',
          default: 1,
        },
        stars: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Hotel star ratings to filter (3, 4, 5)',
        },
        maxPriceInr: {
          type: 'number',
          description: 'Maximum price per night in INR',
        },
        maxResults: {
          type: 'integer',
          description: 'Number of hotels to return (default: 6)',
          default: 6,
        },
      },
      required: ['city', 'checkin', 'checkout', 'adults'],
    },
  },
  {
    name: 'getTransportOptions',
    description: 'MUST CALL THIS for intercity travel. Find intercity transport options (flights, trains, buses) with schedules and fares. Returns real transport data with prices, timings, and availability.',
    parameters: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'Origin city or airport code (REQUIRED)',
        },
        destination: {
          type: 'string',
          description: 'Destination city or airport code (REQUIRED)',
        },
        date: {
          type: 'string',
          description: 'Travel date in YYYY-MM-DD format (REQUIRED)',
        },
        mode: {
          type: 'string',
          enum: ['flight', 'train', 'bus'],
          description: 'Transport mode (REQUIRED): flight, train, or bus',
        },
        maxPriceInr: {
          type: 'number',
          description: 'Maximum fare in INR',
        },
        maxResults: {
          type: 'integer',
          description: 'Number of options to return (default: 5)',
          default: 5,
        },
      },
      required: ['origin', 'destination', 'date', 'mode'],
    },
  },
  {
    name: 'estimateLocalTransport',
    description: 'MUST CALL THIS for local travel costs. Estimate local transport costs (taxi, rideshare, metro) within a city or from airport. Returns estimated fares and travel times.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name (REQUIRED)',
        },
        origin: {
          type: 'string',
          description: 'Starting point (REQUIRED, e.g., "airport", "railway station", hotel address)',
        },
        destination: {
          type: 'string',
          description: 'Destination address or landmark (REQUIRED)',
        },
        mode: {
          type: 'string',
          enum: ['taxi', 'rideshare', 'metro', 'bus'],
          description: 'Transport mode (default: taxi)',
          default: 'taxi',
        },
      },
      required: ['city', 'origin', 'destination'],
    },
  },
];

/**
 * Convert schemas to Gemini function declarations format
 */
export const getFunctionDeclarations = () => {
  return toolSchemas.map(schema => ({
    name: schema.name,
    description: schema.description,
    parameters: schema.parameters,
  }));
};
