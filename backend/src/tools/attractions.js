import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';
import { getAttractionsWithSerpAPI } from './serpapi-attractions.js';
import { searchAttractions as searchMockAttractions } from './ai-generated-data.js';

/**
 * Map interest categories to Google Places types
 */
const categoryToPlaceTypes = {
  history: ['museum', 'historical_landmark', 'monument'],
  nature: ['park', 'natural_feature', 'zoo', 'botanical_garden'],
  beaches: ['beach'],
  spirituality: ['hindu_temple', 'church', 'mosque', 'place_of_worship'],
  adventure: ['amusement_park', 'water_park', 'adventure_sports'],
  shopping: ['shopping_mall', 'market', 'store'],
};

/**
 * Search for attractions using Google Places API
 */
export async function searchAttractions(params) {
  const { city, categories = [], minRating = 4.0, maxResults = 10 } = params;
  
  const cacheKey = generateCacheKey('searchAttractions', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: searchAttractions for ${city}`);
    return cached;
  }

  try {
    logger.info(`Searching attractions in ${city}, categories: ${categories.join(', ')}`);

    // Try SerpAPI first (best option - real data with images)
    if (config.serpapi.apiKey) {
      logger.info('Using SerpAPI for attractions search');
      const serpApiAttractions = await getAttractionsWithSerpAPI({
        city,
        categories,
        minRating,
        maxResults,
      });
      
      if (serpApiAttractions && serpApiAttractions.length >= 2) {
        logger.info(`Found ${serpApiAttractions.length} attractions from SerpAPI`);
        cache.set(cacheKey, serpApiAttractions);
        return serpApiAttractions;
      } else if (serpApiAttractions && serpApiAttractions.length > 0) {
        logger.info(`Found only ${serpApiAttractions.length} attraction(s) from SerpAPI, supplementing with mock data`);
        // Supplement with mock data if less than 2 results
        const mockAttractions = await searchMockAttractions({ 
          city, 
          categories, 
          minRating, 
          maxResults: maxResults - serpApiAttractions.length 
        });
        const combined = [...serpApiAttractions, ...mockAttractions].slice(0, maxResults);
        cache.set(cacheKey, combined);
        return combined;
      } else {
        logger.info('No attractions found from SerpAPI, using mock data');
        const mockAttractions = await searchMockAttractions({ city, categories, minRating, maxResults });
        cache.set(cacheKey, mockAttractions);
        return mockAttractions;
      }
    }

    // Fallback to Google Places API if SerpAPI not configured
    if (!config.googleMaps?.apiKey) {
      logger.warn('No Google Maps API configured, using mock data');
      const mockAttractions = await searchMockAttractions({ city, categories, minRating, maxResults });
      cache.set(cacheKey, mockAttractions);
      return mockAttractions;
    }

    // First, geocode the city to get coordinates
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
    logger.debug(`Geocoded ${city} to: ${location.lat}, ${location.lng}`);

    // Determine place types from categories
    let placeTypes = ['tourist_attraction', 'point_of_interest'];
    if (categories.length > 0) {
      const mappedTypes = categories.flatMap(cat => categoryToPlaceTypes[cat] || []);
      if (mappedTypes.length > 0) {
        placeTypes = mappedTypes;
      }
    }

    // Search nearby places
    const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const placesRes = await axios.get(placesUrl, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius: 15000, // 15km radius
        type: placeTypes[0], // API accepts single type
        key: config.googleMaps.apiKey,
      },
    });

    let places = placesRes.data.results || [];

    // Filter by rating and limit results
    places = places
      .filter(p => (p.rating || 0) >= minRating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, maxResults);

    // Format results
    const attractions = places.map(place => ({
      name: place.name,
      rating: place.rating || null,
      userRatingsTotal: place.user_ratings_total || 0,
      address: place.vicinity,
      location: place.geometry.location,
      placeId: place.place_id,
      types: place.types,
      openNow: place.opening_hours?.open_now,
      photoReference: place.photos?.[0]?.photo_reference,
    }));

    logger.info(`Found ${attractions.length} attractions in ${city}`);
    cache.set(cacheKey, attractions);
    return attractions;

  } catch (error) {
    logger.error(`Error searching attractions in ${city}: ${error.message}`);
    throw error;
  }
}
