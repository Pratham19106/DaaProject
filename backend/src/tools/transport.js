import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { cache, generateCacheKey } from '../utils/cache.js';

/**
 * Get intercity transport options (flights, trains, buses)
 */
export async function getTransportOptions(params) {
  const { origin, destination, date, mode, maxPriceInr, maxResults = 5 } = params;

  const cacheKey = generateCacheKey('getTransportOptions', params);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    logger.info(`Searching ${mode} from ${origin} to ${destination} on ${date}`);

    let results;
    if (mode === 'flight') {
      results = await searchFlights(origin, destination, date, maxPriceInr, maxResults);
    } else if (mode === 'train') {
      results = await searchTrains(origin, destination, date, maxPriceInr, maxResults);
    } else {
      results = getMockTransport(origin, destination, mode, maxPriceInr, maxResults);
    }

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    logger.error(`Error searching ${mode}: ${error.message}`);
    return getMockTransport(origin, destination, mode, maxPriceInr, maxResults);
  }
}

async function searchFlights(origin, destination, date, maxPrice, maxResults) {
  if (!config.amadeus.apiKey) {
    return getMockTransport(origin, destination, 'flight', maxPrice, maxResults);
  }
  // Amadeus API integration here
  return getMockTransport(origin, destination, 'flight', maxPrice, maxResults);
}

async function searchTrains(origin, destination, date, maxPrice, maxResults) {
  if (!config.railways.apiKey) {
    return getMockTransport(origin, destination, 'train', maxPrice, maxResults);
  }
  // Indian Railways API integration here
  return getMockTransport(origin, destination, 'train', maxPrice, maxResults);
}

function getMockTransport(origin, destination, mode, maxPrice, maxResults) {
  const mocks = {
    flight: [
      { carrier: 'IndiGo', number: '6E-123', departure: '08:00', arrival: '10:30', price: 4500, duration: '2h 30m' },
      { carrier: 'Air India', number: 'AI-456', departure: '14:00', arrival: '16:45', price: 5200, duration: '2h 45m' },
    ],
    train: [
      { name: 'Shatabdi Express', number: '12001', departure: '06:00', arrival: '12:30', price: 1200, class: 'AC Chair' },
      { name: 'Rajdhani Express', number: '12301', departure: '16:00', arrival: '22:00', price: 1800, class: '2AC' },
    ],
  };

  let results = mocks[mode] || [];
  if (maxPrice) results = results.filter(r => r.price <= maxPrice);
  return results.slice(0, maxResults).map(r => ({ ...r, origin, destination, isMockData: true }));
}

export async function estimateLocalTransport(params) {
  const { city, origin, destination, mode = 'taxi' } = params;

  try {
    const distanceUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    const res = await axios.get(distanceUrl, {
      params: {
        origins: `${origin}, ${city}, India`,
        destinations: `${destination}, ${city}, India`,
        key: config.googleMaps.apiKey,
      },
    });

    const element = res.data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== 'OK') {
      throw new Error('Route not found');
    }

    const distanceKm = element.distance.value / 1000;
    const durationMin = element.duration.value / 60;

    const baseFare = 50;
    const perKm = mode === 'rideshare' ? 12 : 18;
    const estimatedFare = Math.round(baseFare + distanceKm * perKm);

    return {
      mode,
      distance: `${distanceKm.toFixed(1)} km`,
      duration: `${Math.round(durationMin)} min`,
      estimatedFare,
      currency: 'INR',
    };
  } catch (error) {
    logger.error(`Error estimating local transport: ${error.message}`);
    return { mode, estimatedFare: 500, currency: 'INR', isMockData: true };
  }
}
