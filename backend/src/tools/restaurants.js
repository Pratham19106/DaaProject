import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';

/**
 * Search for restaurants using Google Places API
 */
export async function getRestaurants(params) {
  const {
    city,
    cuisines = [],
    diet = 'any',
    minRating = 4.0,
    priceLevel,
    maxResults = 8,
  } = params;

  const cacheKey = generateCacheKey('getRestaurants', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: getRestaurants for ${city}`);
    return cached;
  }

  try {
    logger.info(`Searching restaurants in ${city}, diet: ${diet}, cuisines: ${cuisines.join(', ')}`);

    // Geocode city
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    const geocodeRes = await axios.get(geocodeUrl, {
      params: {
        address: `${city}, India`,
        key: config.googleMaps.apiKey,
      },
    });

    if (!geocodeRes.data.results?.[0]) {
      throw new Error(`City not found: ${city}`);
    }

    const location = geocodeRes.data.results[0].geometry.location;

    // Build search query
    let keyword = 'restaurant';
    if (diet === 'vegetarian') keyword = 'vegetarian restaurant';
    else if (diet === 'vegan') keyword = 'vegan restaurant';
    else if (diet === 'halal') keyword = 'halal restaurant';
    else if (diet === 'non-veg') keyword = 'non-vegetarian restaurant';
    
    if (cuisines.length > 0) {
      keyword = `${cuisines[0]} ${keyword}`;
    }

    // Search nearby restaurants
    const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const placesRes = await axios.get(placesUrl, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius: 10000, // 10km
        type: 'restaurant',
        keyword,
        key: config.googleMaps.apiKey,
      },
    });

    let places = placesRes.data.results || [];

    // Filter by rating and price level
    places = places.filter(p => {
      const meetsRating = (p.rating || 0) >= minRating;
      const meetsPrice = priceLevel ? p.price_level === priceLevel : true;
      return meetsRating && meetsPrice;
    });

    // Sort by rating and limit
    places = places
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, maxResults);

    // Format results
    const restaurants = places.map(place => ({
      name: place.name,
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      priceLevel: place.price_level || null,
      address: place.vicinity,
      location: place.geometry.location,
      placeId: place.place_id,
      cuisineTypes: place.types,
      openNow: place.opening_hours?.open_now,
      photoReference: place.photos?.[0]?.photo_reference,
    }));

    logger.info(`Found ${restaurants.length} restaurants in ${city}`);
    cache.set(cacheKey, restaurants);
    return restaurants;

  } catch (error) {
    logger.error(`Error searching restaurants in ${city}: ${error.message}`);
    throw error;
  }
}
