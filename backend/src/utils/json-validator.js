/**
 * JSON Validation Utilities
 * Helps validate and clean JSON from AI responses
 */

import { logger } from './logger.js';

/**
 * Validate PDF export JSON structure
 */
export function validatePDFJSON(data) {
  const errors = [];

  // Check metadata
  if (!data.metadata) {
    errors.push('Missing metadata object');
  } else {
    if (!data.metadata.title) errors.push('Missing metadata.title');
    if (!data.metadata.destination) errors.push('Missing metadata.destination');
    if (!data.metadata.startDate) errors.push('Missing metadata.startDate');
    if (!data.metadata.endDate) errors.push('Missing metadata.endDate');
  }

  // Check overview
  if (!data.overview) {
    errors.push('Missing overview object');
  } else {
    if (!data.overview.destination) errors.push('Missing overview.destination');
    if (!data.overview.travelers) errors.push('Missing overview.travelers');
    if (!data.overview.budget) errors.push('Missing overview.budget');
  }

  // Check accommodation
  if (!data.accommodation) {
    errors.push('Missing accommodation object');
  } else {
    if (!data.accommodation.hotel) errors.push('Missing accommodation.hotel');
    if (!data.accommodation.checkInDate) errors.push('Missing accommodation.checkInDate');
    if (!data.accommodation.checkOutDate) errors.push('Missing accommodation.checkOutDate');
  }

  // Check days
  if (!data.days || !Array.isArray(data.days)) {
    errors.push('Missing or invalid days array');
  } else if (data.days.length === 0) {
    errors.push('Days array is empty');
  } else {
    data.days.forEach((day, idx) => {
      if (!day.day) errors.push(`Day ${idx}: missing day number`);
      if (!day.date) errors.push(`Day ${idx}: missing date`);
      if (!day.title) errors.push(`Day ${idx}: missing title`);
    });
  }

  // Check summary
  if (!data.summary) {
    errors.push('Missing summary object');
  } else {
    if (data.summary.totalCost === undefined) errors.push('Missing summary.totalCost');
    if (!data.summary.costBreakdown) errors.push('Missing summary.costBreakdown');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clean JSON string from common issues
 */
export function cleanJSONString(jsonStr) {
  try {
    // Remove markdown code blocks
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Remove leading/trailing whitespace
    jsonStr = jsonStr.trim();

    // Remove any text before the first {
    const firstBrace = jsonStr.indexOf('{');
    if (firstBrace > 0) {
      jsonStr = jsonStr.substring(firstBrace);
    }

    // Remove any text after the last }
    const lastBrace = jsonStr.lastIndexOf('}');
    if (lastBrace >= 0 && lastBrace < jsonStr.length - 1) {
      jsonStr = jsonStr.substring(0, lastBrace + 1);
    }

    // Fix trailing commas before closing braces/brackets
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

    // Fix common quote issues
    // Replace smart quotes with regular quotes
    jsonStr = jsonStr.replace(/["]/g, '"').replace(/["]/g, '"');
    jsonStr = jsonStr.replace(/[']/g, "'").replace(/[']/g, "'");

    // Fix newlines in strings (escape them)
    jsonStr = jsonStr.replace(/:\s*"([^"]*\n[^"]*)"/g, (match) => {
      return match.replace(/\n/g, '\\n');
    });

    return jsonStr;
  } catch (error) {
    logger.error(`Error cleaning JSON: ${error.message}`);
    return jsonStr;
  }
}

/**
 * Parse JSON with detailed error reporting
 */
export function parseJSONSafely(jsonStr) {
  try {
    // Clean the string first
    const cleaned = cleanJSONString(jsonStr);

    // Try to parse
    const parsed = JSON.parse(cleaned);

    // Validate structure
    const validation = validatePDFJSON(parsed);
    if (!validation.isValid) {
      logger.warn(`PDF JSON validation warnings: ${validation.errors.join(', ')}`);
    }

    return {
      success: true,
      data: parsed,
      warnings: validation.errors,
    };
  } catch (error) {
    logger.error(`JSON parse error: ${error.message}`);

    // Try to find the error location
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const start = Math.max(0, position - 50);
      const end = Math.min(jsonStr.length, position + 50);
      const context = jsonStr.substring(start, end);
      logger.error(`Error context: ...${context}...`);
    }

    return {
      success: false,
      error: error.message,
      position: error.message.match(/position (\d+)/) ? parseInt(error.message.match(/position (\d+)/)[1]) : null,
    };
  }
}

/**
 * Generate sample PDF JSON for testing
 */
export function generateSamplePDFJSON() {
  return {
    export_type: 'pdf',
    metadata: {
      title: 'Sample Jaipur Trip',
      destination: 'Jaipur',
      startDate: '2024-12-01',
      endDate: '2024-12-03',
      generatedAt: new Date().toISOString(),
    },
    overview: {
      destination: 'Jaipur',
      duration: '3 days',
      travelers: {
        adults: 2,
        children: 0,
      },
      budget: {
        total: 30000,
        currency: 'INR',
      },
      tripStyle: ['cultural', 'historical'],
      interests: ['history', 'spirituality'],
    },
    accommodation: {
      hotel: {
        name: 'Taj Jai Mahal Palace',
        rating: 4.7,
        price: 8500,
      },
      checkInDate: '2024-12-01',
      checkOutDate: '2024-12-03',
      nights: 2,
      totalCost: 17000,
    },
    days: [
      {
        day: 1,
        date: '2024-12-01',
        title: 'Arrival & City Overview',
        morning: {
          time: '8:00 AM',
          activity: 'Arrive in Jaipur',
          cost: 0,
        },
        afternoon: {
          time: '2:00 PM',
          activity: 'City Palace - ⭐ 4.5',
          cost: 700,
        },
        evening: {
          time: '6:00 PM',
          activity: 'Dinner at Peacock Rooftop',
          cost: 600,
        },
        meals: [
          {
            type: 'breakfast',
            restaurant: 'Hotel Restaurant',
            cost: 300,
          },
          {
            type: 'lunch',
            restaurant: 'Local Dhaba',
            cost: 400,
          },
          {
            type: 'dinner',
            restaurant: 'Peacock Rooftop',
            cost: 600,
          },
        ],
        transport: [
          {
            mode: 'auto',
            from: 'airport',
            to: 'hotel',
            cost: 450,
            duration: '30 min',
          },
        ],
        dailyTotal: 3050,
      },
    ],
    summary: {
      totalDays: 3,
      totalCost: 18500,
      costBreakdown: {
        accommodation: 10500,
        attractions: 2000,
        meals: 4500,
        transport: 1500,
        miscellaneous: 0,
      },
      highlights: ['Amber Fort', 'City Palace', 'Hawa Mahal'],
    },
    notes: {
      general: 'Best time to visit is October-March',
      packing: ['Light clothes', 'Sunscreen', 'Comfortable shoes'],
      safety: ['Avoid traveling alone at night'],
      localTips: ['Try local street food', 'Bargain at markets'],
    },
  };
}
