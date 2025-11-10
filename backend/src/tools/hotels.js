import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';
import { getHotelsWithSerpAPI } from './serpapi-hotels.js';
import { getHotels as getMockHotelsData } from './ai-generated-data.js';

/**
 * Search for hotels using Booking.com API (via RapidAPI)
 * Falls back to mock data if API key not configured
 */
export async function getHotels(params) {
  const {
    city,
    checkin,
    checkout,
    adults = 2,
    children = 0,
    rooms = 1,
    stars = [],
    maxPriceInr,
    maxResults = 6,
  } = params;

  const cacheKey = generateCacheKey('getHotels', params);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`Cache HIT: getHotels for ${city}`);
    return cached;
  }

  try {
    logger.info(`Searching hotels in ${city}, ${checkin} to ${checkout}, ${adults} adults`);

    // Try SerpAPI first (best option - real data with images)
    if (config.serpapi.apiKey) {
      logger.info('Using SerpAPI for hotel search');
      const serpApiHotels = await getHotelsWithSerpAPI({
        city,
        checkInDate: checkin,
        checkOutDate: checkout,
        adults,
        children,
        minRating: 3.5,
        priceLevel: maxPriceInr,
        maxResults,
      });
      
      if (serpApiHotels && serpApiHotels.length >= 2) {
        logger.info(`Found ${serpApiHotels.length} hotels from SerpAPI`);
        cache.set(cacheKey, serpApiHotels);
        return serpApiHotels;
      } else if (serpApiHotels && serpApiHotels.length > 0) {
        logger.info(`Found only ${serpApiHotels.length} hotel(s) from SerpAPI, supplementing with mock data`);
        // Supplement with mock data if less than 2 results
        const mockHotels = await getMockHotelsData({ city, maxResults: maxResults - serpApiHotels.length });
        const combined = [...serpApiHotels, ...mockHotels].slice(0, maxResults);
        cache.set(cacheKey, combined);
        return combined;
      } else {
        logger.info('No hotels found from SerpAPI, using mock data');
        const mockHotels = await getMockHotelsData({ city, maxResults });
        cache.set(cacheKey, mockHotels);
        return mockHotels;
      }
    }

    // Fallback to Booking.com API if SerpAPI fails
    if (!config.booking.apiKey) {
      logger.warn('No hotel APIs configured, returning mock data');
      return getMockHotels(city, stars, maxPriceInr, maxResults);
    }

    // Step 1: Get destination ID from city name
    const searchUrl = 'https://booking-com.p.rapidapi.com/v1/hotels/locations';
    const searchRes = await axios.get(searchUrl, {
      params: {
        name: city,
        locale: 'en-gb',
      },
      headers: {
        'X-RapidAPI-Key': config.booking.apiKey,
        'X-RapidAPI-Host': config.booking.host,
      },
    });

    const destination = searchRes.data?.[0];
    if (!destination) {
      throw new Error(`Destination not found: ${city}`);
    }

    // Step 2: Search hotels
    const hotelsUrl = 'https://booking-com.p.rapidapi.com/v1/hotels/search';
    const hotelsRes = await axios.get(hotelsUrl, {
      params: {
        dest_id: destination.dest_id,
        dest_type: destination.dest_type,
        checkin_date: checkin,
        checkout_date: checkout,
        adults_number: adults,
        children_number: children,
        room_number: rooms,
        order_by: 'popularity',
        filter_by_currency: 'INR',
        locale: 'en-gb',
        units: 'metric',
      },
      headers: {
        'X-RapidAPI-Key': config.booking.apiKey,
        'X-RapidAPI-Host': config.booking.host,
      },
    });

    let hotels = hotelsRes.data?.result || [];

    // Filter by stars and price
    if (stars.length > 0) {
      hotels = hotels.filter(h => stars.includes(h.class));
    }
    if (maxPriceInr) {
      hotels = hotels.filter(h => (h.min_total_price || 0) <= maxPriceInr);
    }

    // Sort by review score and limit
    hotels = hotels
      .sort((a, b) => (b.review_score || 0) - (a.review_score || 0))
      .slice(0, maxResults);

    // Format results
    const formattedHotels = hotels.map(hotel => ({
      name: hotel.hotel_name,
      stars: hotel.class || null,
      rating: hotel.review_score ? hotel.review_score / 2 : null, // Convert 0-10 to 0-5
      reviewCount: hotel.review_nr || 0,
      pricePerNight: hotel.min_total_price || null,
      currency: 'INR',
      address: hotel.address,
      city: hotel.city,
      distance: hotel.distance ? `${hotel.distance} km from center` : null,
      hotelId: hotel.hotel_id,
      photoUrl: hotel.main_photo_url,
      amenities: hotel.hotel_facilities?.slice(0, 5) || [],
    }));

    logger.info(`Found ${formattedHotels.length} hotels in ${city}`);
    cache.set(cacheKey, formattedHotels);
    return formattedHotels;

  } catch (error) {
    logger.error(`Error searching hotels in ${city}: ${error.message}`);
    // Fallback to mock data on error
    return getMockHotels(city, stars, maxPriceInr, maxResults);
  }
}

/**
 * Mock hotel data for development/testing
 */
function getMockHotels(city, stars = [], maxPriceInr, maxResults = 6) {
  const mockData = [
    { name: 'Taj Palace', stars: 5, rating: 4.8, pricePerNight: 8500, distance: '2 km from center' },
    { name: 'ITC Grand', stars: 5, rating: 4.7, pricePerNight: 7200, distance: '1.5 km from center' },
    { name: 'Radisson Blu', stars: 4, rating: 4.5, pricePerNight: 4500, distance: '3 km from center' },
    { name: 'Lemon Tree Premier', stars: 4, rating: 4.3, pricePerNight: 3800, distance: '4 km from center' },
    { name: 'OYO Flagship', stars: 3, rating: 4.0, pricePerNight: 2200, distance: '5 km from center' },
    { name: 'FabHotel Prime', stars: 3, rating: 3.9, pricePerNight: 1800, distance: '6 km from center' },
  ];

  let filtered = mockData;
  if (stars.length > 0) {
    filtered = filtered.filter(h => stars.includes(h.stars));
  }
  if (maxPriceInr) {
    filtered = filtered.filter(h => h.pricePerNight <= maxPriceInr);
  }

  return filtered.slice(0, maxResults).map(h => ({
    ...h,
    city,
    currency: 'INR',
    reviewCount: Math.floor(Math.random() * 500) + 100,
    address: `${city}, India`,
    hotelId: `mock-${h.name.toLowerCase().replace(/\s+/g, '-')}`,
    amenities: ['WiFi', 'Parking', 'Restaurant', 'Room Service'],
    isMockData: true,
  }));
}
