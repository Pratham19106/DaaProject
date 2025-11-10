import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';

/**
 * AI-Generated Mock Data
 * These functions return realistic data based on common knowledge
 * No external APIs required - all data is generated locally
 */

/**
 * Search for attractions using AI-generated data
 */
export async function searchAttractions(params) {
  const { city, categories = [], minRating = 4.0, maxResults = 10 } = params;
  
  const cacheKey = generateCacheKey('searchAttractions', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: searchAttractions for ${city}`);
    return cached;
  }

  logger.info(`Generating attractions for ${city}, categories: ${categories.join(', ')}`);

  // Database of popular attractions by city
  const attractionsDB = {
    'jaipur': [
      { name: 'Amber Fort', rating: 4.6, category: 'history', price: 500, description: 'Majestic hilltop fort with stunning architecture' },
      { name: 'Hawa Mahal', rating: 4.4, category: 'history', price: 200, description: 'Palace of Winds with unique facade' },
      { name: 'City Palace', rating: 4.5, category: 'history', price: 700, description: 'Royal residence with museums' },
      { name: 'Jantar Mantar', rating: 4.3, category: 'history', price: 200, description: 'Astronomical observatory' },
      { name: 'Nahargarh Fort', rating: 4.5, category: 'history', price: 200, description: 'Fort with panoramic city views' },
      { name: 'Jal Mahal', rating: 4.2, category: 'nature', price: 0, description: 'Water palace in Man Sagar Lake' },
      { name: 'Albert Hall Museum', rating: 4.4, category: 'history', price: 150, description: 'Oldest museum in Rajasthan' },
      { name: 'Jaigarh Fort', rating: 4.4, category: 'history', price: 100, description: 'Fort with world\'s largest cannon' },
    ],
    'goa': [
      { name: 'Baga Beach', rating: 4.3, category: 'beaches', price: 0, description: 'Popular beach with water sports' },
      { name: 'Calangute Beach', rating: 4.2, category: 'beaches', price: 0, description: 'Queen of beaches' },
      { name: 'Fort Aguada', rating: 4.4, category: 'history', price: 25, description: '17th century Portuguese fort' },
      { name: 'Basilica of Bom Jesus', rating: 4.6, category: 'spirituality', price: 0, description: 'UNESCO World Heritage church' },
      { name: 'Dudhsagar Falls', rating: 4.7, category: 'nature', price: 400, description: 'Spectacular four-tiered waterfall' },
      { name: 'Anjuna Beach', rating: 4.4, category: 'beaches', price: 0, description: 'Beach with flea market' },
      { name: 'Palolem Beach', rating: 4.5, category: 'beaches', price: 0, description: 'Crescent-shaped beach' },
      { name: 'Chapora Fort', rating: 4.3, category: 'history', price: 0, description: 'Fort with scenic views' },
    ],
    'delhi': [
      { name: 'Red Fort', rating: 4.4, category: 'history', price: 500, description: 'Iconic Mughal fort' },
      { name: 'Qutub Minar', rating: 4.5, category: 'history', price: 500, description: 'Tallest brick minaret' },
      { name: 'India Gate', rating: 4.5, category: 'history', price: 0, description: 'War memorial monument' },
      { name: 'Lotus Temple', rating: 4.6, category: 'spirituality', price: 0, description: 'Bahai House of Worship' },
      { name: 'Humayun\'s Tomb', rating: 4.5, category: 'history', price: 500, description: 'Mughal architecture masterpiece' },
      { name: 'Akshardham Temple', rating: 4.7, category: 'spirituality', price: 0, description: 'Modern Hindu temple complex' },
      { name: 'Chandni Chowk', rating: 4.3, category: 'shopping', price: 0, description: 'Historic market area' },
      { name: 'Lodhi Gardens', rating: 4.4, category: 'nature', price: 0, description: 'City park with tombs' },
    ],
    'mumbai': [
      { name: 'Gateway of India', rating: 4.5, category: 'history', price: 0, description: 'Iconic arch monument' },
      { name: 'Marine Drive', rating: 4.6, category: 'nature', price: 0, description: 'Scenic coastal road' },
      { name: 'Elephanta Caves', rating: 4.4, category: 'history', price: 600, description: 'Ancient rock-cut temples' },
      { name: 'Chhatrapati Shivaji Terminus', rating: 4.5, category: 'history', price: 0, description: 'UNESCO heritage railway station' },
      { name: 'Haji Ali Dargah', rating: 4.5, category: 'spirituality', price: 0, description: 'Mosque on island' },
      { name: 'Juhu Beach', rating: 4.2, category: 'beaches', price: 0, description: 'Popular city beach' },
      { name: 'Siddhivinayak Temple', rating: 4.6, category: 'spirituality', price: 0, description: 'Famous Ganesh temple' },
    ],
    'agra': [
      { name: 'Taj Mahal', rating: 4.8, category: 'history', price: 1000, description: 'Wonder of the world' },
      { name: 'Agra Fort', rating: 4.5, category: 'history', price: 650, description: 'Red sandstone fort' },
      { name: 'Fatehpur Sikri', rating: 4.6, category: 'history', price: 550, description: 'Abandoned Mughal city' },
      { name: 'Mehtab Bagh', rating: 4.3, category: 'nature', price: 200, description: 'Garden with Taj view' },
      { name: 'Itmad-ud-Daulah', rating: 4.4, category: 'history', price: 310, description: 'Baby Taj tomb' },
    ],
  };

  // Get attractions for the city (case-insensitive)
  const cityKey = city.toLowerCase();
  let attractions = attractionsDB[cityKey] || [];

  // If city not in database, generate generic attractions
  if (attractions.length === 0) {
    attractions = [
      { name: `${city} Fort`, rating: 4.3, category: 'history', price: 300, description: 'Historic fort' },
      { name: `${city} Palace`, rating: 4.4, category: 'history', price: 400, description: 'Royal palace' },
      { name: `${city} Temple`, rating: 4.5, category: 'spirituality', price: 0, description: 'Ancient temple' },
      { name: `${city} Market`, rating: 4.2, category: 'shopping', price: 0, description: 'Local bazaar' },
      { name: `${city} Museum`, rating: 4.3, category: 'history', price: 200, description: 'City museum' },
    ];
  }

  // Filter by categories if specified
  if (categories.length > 0) {
    attractions = attractions.filter(a => 
      categories.some(cat => a.category === cat.toLowerCase())
    );
  }

  // Filter by rating
  attractions = attractions.filter(a => a.rating >= minRating);

  // Limit results
  attractions = attractions.slice(0, maxResults);

  // Format output
  const results = attractions.map(a => ({
    name: a.name,
    rating: a.rating,
    userRatingsTotal: Math.floor(Math.random() * 50000) + 1000,
    address: `${city}, India`,
    location: { lat: 0, lng: 0 }, // Placeholder
    placeId: `ai-generated-${a.name.toLowerCase().replace(/\s+/g, '-')}`,
    types: [a.category, 'tourist_attraction'],
    openNow: Math.random() > 0.2, // 80% chance open
    entryFee: a.price,
    description: a.description,
    isAIGenerated: true,
  }));

  logger.info(`Generated ${results.length} attractions for ${city}`);
  cache.set(cacheKey, results);
  return results;
}

/**
 * Get hotels using AI-generated data
 */
export async function getHotels(params) {
  const { city, maxResults = 6 } = params;

  const cacheKey = generateCacheKey('getHotels', params);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  logger.info(`Generating hotels for ${city}`);

  const hotelsDB = {
    'jaipur': [
      { name: 'Taj Jai Mahal Palace', stars: 5, rating: 4.7, pricePerNight: 8500, description: 'Luxury palace hotel' },
      { name: 'ITC Grand Bharat', stars: 5, rating: 4.6, pricePerNight: 7800, description: 'Premium heritage hotel' },
      { name: 'Radisson Blu Jaipur', stars: 4, rating: 4.5, pricePerNight: 4500, description: 'Business hotel' },
      { name: 'Lemon Tree Premier', stars: 4, rating: 4.3, pricePerNight: 3800, description: 'Modern comfort hotel' },
      { name: 'OYO Flagship Jaipur', stars: 3, rating: 4.0, pricePerNight: 2200, description: 'Budget hotel' },
      { name: 'FabHotel Prime', stars: 3, rating: 3.9, pricePerNight: 1800, description: 'Economy hotel' },
    ],
    'goa': [
      { name: 'Taj Exotica Resort', stars: 5, rating: 4.8, pricePerNight: 12000, description: 'Luxury beach resort' },
      { name: 'Park Hyatt Goa', stars: 5, rating: 4.7, pricePerNight: 10500, description: 'Premium resort' },
      { name: 'Radisson Blu Resort Goa', stars: 4, rating: 4.5, pricePerNight: 6500, description: 'Beach resort' },
      { name: 'Sunbeam Holiday Resort', stars: 4, rating: 4.3, pricePerNight: 4200, description: 'Comfort resort' },
      { name: 'OYO Rooms Goa', stars: 3, rating: 4.0, pricePerNight: 2500, description: 'Budget rooms' },
    ],
    'delhi': [
      { name: 'The Oberoi New Delhi', stars: 5, rating: 4.7, pricePerNight: 9500, description: 'Luxury hotel' },
      { name: 'ITC Maurya', stars: 5, rating: 4.6, pricePerNight: 8800, description: 'Premium hotel' },
      { name: 'Radisson Blu Delhi', stars: 4, rating: 4.4, pricePerNight: 5200, description: 'Business hotel' },
      { name: 'Lemon Tree Hotel Delhi', stars: 4, rating: 4.2, pricePerNight: 3900, description: 'Comfort hotel' },
      { name: 'OYO Hotel Delhi', stars: 3, rating: 3.9, pricePerNight: 2100, description: 'Budget hotel' },
    ],
    'agra': [
      { name: 'The Oberoi Amarvilas', stars: 5, rating: 4.8, pricePerNight: 11000, description: 'Taj view luxury hotel' },
      { name: 'ITC Mughal', stars: 5, rating: 4.7, pricePerNight: 9200, description: 'Heritage hotel' },
      { name: 'Radisson Blu Agra', stars: 4, rating: 4.5, pricePerNight: 5500, description: 'Premium hotel' },
      { name: 'Lemon Tree Hotel Agra', stars: 4, rating: 4.3, pricePerNight: 4000, description: 'Comfort hotel' },
    ],
    'mumbai': [
      { name: 'The Taj Mahal Palace', stars: 5, rating: 4.8, pricePerNight: 13000, description: 'Iconic luxury hotel' },
      { name: 'Oberoi Mumbai', stars: 5, rating: 4.7, pricePerNight: 11500, description: 'Premium hotel' },
      { name: 'Radisson Blu Mumbai', stars: 4, rating: 4.5, pricePerNight: 6800, description: 'Business hotel' },
      { name: 'Lemon Tree Hotel Mumbai', stars: 4, rating: 4.3, pricePerNight: 4500, description: 'Comfort hotel' },
    ],
  };

  const cityKey = city.toLowerCase();
  let hotels = hotelsDB[cityKey] || [
    { name: `${city} Palace Hotel`, stars: 5, rating: 4.5, pricePerNight: 8000, description: 'Luxury hotel' },
    { name: `${city} Grand Hotel`, stars: 4, rating: 4.3, pricePerNight: 4500, description: 'Premium hotel' },
    { name: `${city} Comfort Inn`, stars: 3, rating: 4.0, pricePerNight: 2500, description: 'Budget hotel' },
  ];

  hotels = hotels.slice(0, maxResults);

  const results = hotels.map(h => ({
    name: h.name,
    stars: h.stars,
    rating: h.rating,
    reviews: Math.floor(Math.random() * 500) + 100,
    pricePerNight: h.pricePerNight,
    currency: 'INR',
    address: `${city}, India`,
    city,
    description: h.description,
    amenities: ['WiFi', 'Parking', 'Restaurant', 'Room Service', 'Gym'],
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    isAIGenerated: true,
  }));

  logger.info(`Generated ${results.length} hotels for ${city}`);
  cache.set(cacheKey, results);
  return results;
}

/**
 * Get restaurants using AI-generated data
 */
export async function getRestaurants(params) {
  const { city, cuisines = [], diet = 'any', minRating = 4.0, priceLevel, maxResults = 8 } = params;

  const cacheKey = generateCacheKey('getRestaurants', params);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  logger.info(`Generating restaurants for ${city}, diet: ${diet}`);

  const restaurantsDB = {
    'jaipur': [
      { name: 'Laxmi Mishthan Bhandar', rating: 4.5, cuisine: 'Rajasthani', price: 2, veg: true },
      { name: 'Chokhi Dhani', rating: 4.3, cuisine: 'Rajasthani', price: 3, veg: true },
      { name: 'Peacock Rooftop Restaurant', rating: 4.4, cuisine: 'Multi-cuisine', price: 3, veg: false },
      { name: 'Rawat Mishthan', rating: 4.5, cuisine: 'Rajasthani', price: 1, veg: true },
      { name: 'Spice Court', rating: 4.3, cuisine: 'North Indian', price: 2, veg: false },
      { name: 'Handi Restaurant', rating: 4.4, cuisine: 'Mughlai', price: 2, veg: false },
    ],
    'goa': [
      { name: 'Fisherman\'s Wharf', rating: 4.4, cuisine: 'Seafood', price: 3, veg: false },
      { name: 'Thalassa', rating: 4.5, cuisine: 'Greek', price: 3, veg: false },
      { name: 'Britto\'s', rating: 4.3, cuisine: 'Goan', price: 2, veg: false },
      { name: 'Vinayak Family Restaurant', rating: 4.4, cuisine: 'Goan', price: 2, veg: false },
      { name: 'Infantaria', rating: 4.3, cuisine: 'Bakery', price: 2, veg: true },
    ],
    'delhi': [
      { name: 'Karim\'s', rating: 4.4, cuisine: 'Mughlai', price: 2, veg: false },
      { name: 'Paranthe Wali Gali', rating: 4.3, cuisine: 'North Indian', price: 1, veg: true },
      { name: 'Indian Accent', rating: 4.6, cuisine: 'Modern Indian', price: 4, veg: false },
      { name: 'Saravana Bhavan', rating: 4.4, cuisine: 'South Indian', price: 2, veg: true },
      { name: 'Bukhara', rating: 4.5, cuisine: 'North Indian', price: 4, veg: false },
    ],
  };

  const cityKey = city.toLowerCase();
  let restaurants = restaurantsDB[cityKey] || [
    { name: `${city} Dhaba`, rating: 4.2, cuisine: 'North Indian', price: 2, veg: true },
    { name: `${city} Cafe`, rating: 4.3, cuisine: 'Multi-cuisine', price: 2, veg: false },
    { name: `${city} Restaurant`, rating: 4.4, cuisine: 'Local', price: 2, veg: false },
  ];

  // Filter by diet
  if (diet === 'vegetarian' || diet === 'vegan') {
    restaurants = restaurants.filter(r => r.veg);
  } else if (diet === 'non-veg') {
    restaurants = restaurants.filter(r => !r.veg);
  }

  // Filter by rating
  restaurants = restaurants.filter(r => r.rating >= minRating);

  // Filter by price level
  if (priceLevel) {
    restaurants = restaurants.filter(r => r.price === priceLevel);
  }

  // Limit results
  restaurants = restaurants.slice(0, maxResults);

  const results = restaurants.map(r => ({
    name: r.name,
    rating: r.rating,
    userRatingsTotal: Math.floor(Math.random() * 5000) + 100,
    priceLevel: r.price,
    address: `${city}, India`,
    location: { lat: 0, lng: 0 },
    placeId: `ai-generated-${r.name.toLowerCase().replace(/\s+/g, '-')}`,
    cuisineTypes: [r.cuisine],
    openNow: Math.random() > 0.1,
    vegetarian: r.veg,
    isAIGenerated: true,
  }));

  cache.set(cacheKey, results);
  return results;
}

/**
 * Estimate local transport costs
 */
export async function estimateLocalTransport(params) {
  const { city, origin, destination, mode = 'taxi' } = params;

  // Approximate distances for common routes
  const distanceEstimates = {
    'airport': 15, // km from airport to city center
    'railway station': 5,
    'bus stand': 3,
  };

  const distance = distanceEstimates[origin.toLowerCase()] || 10;
  const baseFare = 50;
  const perKm = mode === 'rideshare' ? 12 : 18;
  const estimatedFare = Math.round(baseFare + distance * perKm);

  return {
    mode,
    distance: `${distance} km`,
    duration: `${Math.round(distance * 3)} min`,
    estimatedFare,
    currency: 'INR',
    isAIGenerated: true,
  };
}
