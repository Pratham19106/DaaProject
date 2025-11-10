import NodeCache from 'node-cache';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: 600, // Check for expired keys every 10 min
  useClones: false,
});

cache.on('set', (key) => {
  logger.debug(`Cache SET: ${key}`);
});

cache.on('expired', (key) => {
  logger.debug(`Cache EXPIRED: ${key}`);
});

/**
 * Generate cache key from function name and params
 */
export const generateCacheKey = (toolName, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${toolName}:${JSON.stringify(sortedParams)}`;
};
