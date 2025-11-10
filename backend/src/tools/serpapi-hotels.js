import { getJson } from 'serpapi';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';

/**
 * Get hotels using SerpAPI Google Hotels API
 * Returns real hotel data with images, prices, ratings, and amenities
 */
export async function getHotelsWithSerpAPI(params) {
  const {
    city,
    checkInDate,
    checkOutDate,
    adults = 2,
    children = 0,
    minRating = 4.0,
    priceLevel,
    maxResults = 8,
  } = params;

  // Check if SerpAPI key is configured
  if (!config.serpapi.apiKey) {
    logger.warn('SerpAPI key not configured, falling back to mock data');
    return null; // Will use mock data
  }

  const cacheKey = generateCacheKey('serpapi-hotels', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: SerpAPI hotels for ${city}`);
    return cached;
  }

  try {
    logger.info(`Fetching hotels from SerpAPI for ${city}`);

    // Build SerpAPI query
    const searchParams = {
      engine: 'google_hotels',
      q: `hotels in ${city}, India`,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: adults,
      currency: 'INR',
      gl: 'in', // India
      hl: 'en', // English
      api_key: config.serpapi.apiKey,
    };

    // Add children if specified
    if (children > 0) {
      searchParams.children = children;
    }

    // Add rating filter
    if (minRating >= 4.5) {
      searchParams.rating = 9; // 4.5+
    } else if (minRating >= 4.0) {
      searchParams.rating = 8; // 4.0+
    } else if (minRating >= 3.5) {
      searchParams.rating = 7; // 3.5+
    }

    // Add price sorting
    if (priceLevel) {
      searchParams.sort_by = 3; // Lowest price
    }

    // Make API call
    const response = await getJson(searchParams);

    if (!response.properties || response.properties.length === 0) {
      logger.warn(`No hotels found in SerpAPI for ${city}`);
      return null;
    }

    // Transform SerpAPI response to our format
    const hotels = response.properties.slice(0, maxResults).map((property) => {
      // Get the first image or use a placeholder
      const thumbnail = property.images && property.images.length > 0
        ? property.images[0].thumbnail
        : null;

      // Get logo if available
      const logo = property.logo || thumbnail;

      // Extract price information
      const pricePerNight = property.rate_per_night?.extracted_lowest || 
                           property.total_rate?.extracted_lowest || 
                           0;

      // Calculate total price for the stay
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalPrice = pricePerNight * nights;

      return {
        name: property.name,
        description: property.description || `${property.hotel_class || 'Hotel'} in ${city}`,
        rating: property.overall_rating || 0,
        reviews: property.reviews || 0,
        stars: property.extracted_hotel_class || 0,
        pricePerNight: Math.round(pricePerNight),
        totalPrice: Math.round(totalPrice),
        currency: 'INR',
        
        // Images
        thumbnail: thumbnail,
        logo: logo,
        images: property.images?.map(img => ({
          thumbnail: img.thumbnail,
          original: img.original_image,
        })) || [],

        // Location
        address: `${city}, India`,
        gpsCoordinates: property.gps_coordinates || null,

        // Amenities
        amenities: property.amenities || [],
        excludedAmenities: property.excluded_amenities || [],

        // Check-in/out times
        checkInTime: property.check_in_time || '2:00 PM',
        checkOutTime: property.check_out_time || '12:00 PM',

        // Additional info
        link: property.link || null,
        ecoCertified: property.eco_certified || false,
        sponsored: property.sponsored || false,

        // Nearby places
        nearbyPlaces: property.nearby_places || [],

        // Source
        source: 'SerpAPI Google Hotels',
        propertyToken: property.property_token,
      };
    });

    logger.info(`Found ${hotels.length} hotels from SerpAPI for ${city}`);
    cache.set(cacheKey, hotels);
    return hotels;

  } catch (error) {
    logger.error(`SerpAPI hotels error for ${city}:`, error.message);
    return null; // Fall back to mock data
  }
}

/**
 * Get detailed hotel information
 */
export async function getHotelDetails(propertyToken) {
  if (!config.serpapi.apiKey) {
    return null;
  }

  const cacheKey = generateCacheKey('serpapi-hotel-details', { propertyToken });
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await getJson({
      engine: 'google_hotels',
      property_token: propertyToken,
      api_key: config.serpapi.apiKey,
    });

    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    logger.error('SerpAPI hotel details error:', error.message);
    return null;
  }
}
