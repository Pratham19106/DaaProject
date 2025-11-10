import { getJson } from 'serpapi';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';

/**
 * Get tourist attractions using SerpAPI Google Local Results
 * Returns real attraction data with images, ratings, and descriptions
 */
export async function getAttractionsWithSerpAPI(params) {
  const {
    city,
    categories = [],
    minRating = 4.0,
    maxResults = 10,
  } = params;

  // Check if SerpAPI key is configured
  if (!config.serpapi.apiKey) {
    logger.warn('SerpAPI key not configured for attractions');
    return null;
  }

  const cacheKey = generateCacheKey('serpapi-attractions', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: SerpAPI attractions for ${city}`);
    return cached;
  }

  try {
    logger.info(`Fetching attractions from SerpAPI for ${city}`);

    // Build search query based on categories
    let query = `tourist attractions in ${city}, India`;
    if (categories.length > 0) {
      const categoryMap = {
        'history': 'historical sites monuments',
        'nature': 'parks gardens nature',
        'beaches': 'beaches',
        'spirituality': 'temples churches mosques',
        'adventure': 'adventure activities',
        'shopping': 'shopping markets',
      };
      const categoryTerms = categories.map(cat => categoryMap[cat] || cat).join(' ');
      query = `${categoryTerms} in ${city}, India`;
    }

    // Search for attractions using Google Local Results
    const searchParams = {
      engine: 'google_maps',
      q: query,
      type: 'search',
      gl: 'in', // India
      hl: 'en', // English
      api_key: config.serpapi.apiKey,
    };

    const response = await getJson(searchParams);

    if (!response.local_results || response.local_results.length === 0) {
      logger.warn(`No attractions found in SerpAPI for ${city}`);
      return null;
    }

    // Transform SerpAPI response to our format
    const attractions = response.local_results
      .filter(place => {
        // Filter by rating if specified
        if (minRating && place.rating) {
          return place.rating >= minRating;
        }
        return true;
      })
      .slice(0, maxResults)
      .map((place) => {
        // Determine category based on types or description
        let category = 'general';
        const types = place.type?.toLowerCase() || '';
        const description = (place.description || '').toLowerCase();
        
        if (types.includes('temple') || types.includes('church') || types.includes('mosque') || 
            description.includes('temple') || description.includes('shrine')) {
          category = 'spirituality';
        } else if (types.includes('museum') || types.includes('monument') || 
                   description.includes('fort') || description.includes('palace')) {
          category = 'history';
        } else if (types.includes('park') || types.includes('garden') || 
                   description.includes('park') || description.includes('garden')) {
          category = 'nature';
        } else if (types.includes('beach') || description.includes('beach')) {
          category = 'beaches';
        } else if (types.includes('market') || types.includes('shopping') || 
                   description.includes('market') || description.includes('shopping')) {
          category = 'shopping';
        }

        return {
          name: place.title,
          description: place.description || place.type || 'Tourist attraction',
          rating: place.rating || 0,
          reviews: place.reviews || 0,
          category: category,
          
          // Pricing (if available)
          price: place.price ? parseInt(place.price.replace(/[^0-9]/g, '')) : 0,
          priceLevel: place.price_level || null,
          
          // Images
          thumbnail: place.thumbnail || null,
          images: place.photos?.map(photo => photo.thumbnail) || [],
          
          // Location
          address: place.address || `${city}, India`,
          gpsCoordinates: place.gps_coordinates || null,
          
          // Additional info
          hours: place.hours || null,
          phone: place.phone || null,
          website: place.website || null,
          placeId: place.place_id || null,
          
          // Source
          source: 'SerpAPI Google Maps',
        };
      });

    logger.info(`Found ${attractions.length} attractions from SerpAPI for ${city}`);
    cache.set(cacheKey, attractions);
    return attractions;

  } catch (error) {
    logger.error(`SerpAPI attractions error for ${city}:`, error.message);
    return null;
  }
}

/**
 * Get popular destinations from a location
 */
export async function getPopularDestinations(fromLocation) {
  if (!config.serpapi.apiKey) {
    return null;
  }

  const cacheKey = generateCacheKey('serpapi-popular-destinations', { fromLocation });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    logger.info(`Fetching popular destinations from ${fromLocation}`);

    const searchParams = {
      engine: 'google',
      q: `popular destinations from ${fromLocation}`,
      gl: 'in',
      hl: 'en',
      api_key: config.serpapi.apiKey,
    };

    const response = await getJson(searchParams);

    if (response.popular_destinations?.destinations) {
      const destinations = response.popular_destinations.destinations.map(dest => ({
        title: dest.title,
        description: dest.description,
        flightPrice: dest.extracted_flight_price,
        hotelPrice: dest.extracted_hotel_price,
        thumbnail: dest.thumbnail,
        link: dest.link,
      }));

      cache.set(cacheKey, destinations);
      return destinations;
    }

    return null;
  } catch (error) {
    logger.error('SerpAPI popular destinations error:', error.message);
    return null;
  }
}
