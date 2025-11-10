/**
 * PDF Export Utility
 * Generates clean JSON structure for PDF conversion
 */

import { logger } from '../utils/logger.js';

/**
 * Generate PDF-ready JSON from itinerary data
 */
export function generatePDFJSON(itineraryData) {
  try {
    logger.info('Generating PDF JSON structure');

    const pdfJSON = {
      // Metadata
      metadata: {
        title: itineraryData.title || 'TripPeIndia Itinerary',
        destination: itineraryData.destination || '',
        startDate: itineraryData.startDate || '',
        endDate: itineraryData.endDate || '',
        generatedAt: new Date().toISOString(),
        version: '1.0',
      },

      // Trip Overview
      overview: {
        destination: itineraryData.destination || '',
        duration: itineraryData.duration || '',
        travelers: {
          adults: itineraryData.adults || 2,
          children: itineraryData.children || 0,
        },
        budget: {
          total: itineraryData.totalBudget || 0,
          currency: 'INR',
          breakdown: itineraryData.budgetBreakdown || {},
        },
        tripStyle: itineraryData.tripStyle || [],
        interests: itineraryData.interests || [],
      },

      // Accommodation
      accommodation: {
        hotel: itineraryData.hotel || null,
        checkInDate: itineraryData.checkInDate || '',
        checkOutDate: itineraryData.checkOutDate || '',
        nights: itineraryData.nights || 0,
        totalCost: itineraryData.hotelCost || 0,
        notes: itineraryData.hotelNotes || '',
      },

      // Day-wise Itinerary
      days: itineraryData.days || [],

      // Summary & Costs
      summary: {
        totalDays: itineraryData.totalDays || 0,
        totalCost: itineraryData.totalCost || 0,
        costBreakdown: {
          accommodation: itineraryData.costBreakdown?.accommodation || 0,
          attractions: itineraryData.costBreakdown?.attractions || 0,
          meals: itineraryData.costBreakdown?.meals || 0,
          transport: itineraryData.costBreakdown?.transport || 0,
          miscellaneous: itineraryData.costBreakdown?.miscellaneous || 0,
        },
        highlights: itineraryData.highlights || [],
      },

      // Important Notes
      notes: {
        general: itineraryData.generalNotes || '',
        packing: itineraryData.packingTips || [],
        safety: itineraryData.safetyTips || [],
        bestTime: itineraryData.bestTimeToVisit || '',
        localTips: itineraryData.localTips || [],
      },

      // Contact Information
      contacts: {
        emergencyNumbers: itineraryData.emergencyNumbers || {},
        hotelContact: itineraryData.hotelContact || '',
        localGuideContact: itineraryData.localGuideContact || '',
      },
    };

    logger.info('PDF JSON structure generated successfully');
    return pdfJSON;
  } catch (error) {
    logger.error(`Error generating PDF JSON: ${error.message}`);
    throw error;
  }
}

/**
 * Parse itinerary text and extract structured data
 * This helps convert AI-generated itinerary into JSON
 */
export function parseItineraryText(text) {
  try {
    logger.info('Parsing itinerary text');

    const itinerary = {
      days: [],
      attractions: [],
      restaurants: [],
      costs: {},
    };

    // Extract days (look for "Day 1:", "Day 2:", etc.)
    const dayPattern = /##\s*Day\s+(\d+):\s*(.+?)(?=##\s*Day\s+\d+:|$)/gs;
    let dayMatch;

    while ((dayMatch = dayPattern.exec(text)) !== null) {
      const dayNumber = parseInt(dayMatch[1]);
      const dayContent = dayMatch[2];

      const day = {
        day: dayNumber,
        title: dayMatch[2].split('\n')[0].trim(),
        activities: [],
        meals: [],
        transport: [],
        cost: 0,
      };

      // Extract morning, afternoon, evening
      const timeSlots = ['Morning', 'Afternoon', 'Evening'];
      timeSlots.forEach(slot => {
        const slotPattern = new RegExp(`###\\s*${slot}([\\s\\S]*?)(?=###|$)`, 'i');
        const slotMatch = slotPattern.exec(dayContent);
        if (slotMatch) {
          day.activities.push({
            time: slot,
            details: slotMatch[1].trim(),
          });
        }
      });

      itinerary.days.push(day);
    }

    logger.info(`Parsed ${itinerary.days.length} days from itinerary`);
    return itinerary;
  } catch (error) {
    logger.error(`Error parsing itinerary: ${error.message}`);
    throw error;
  }
}

/**
 * Create a minimal PDF export template
 */
export function createPDFTemplate(itinerary) {
  return {
    document: {
      title: itinerary.metadata?.title || 'TripPeIndia Itinerary',
      author: 'TripPeIndia',
      subject: `Travel Itinerary - ${itinerary.overview?.destination}`,
      keywords: ['travel', 'itinerary', 'india'],
    },
    content: {
      header: {
        title: itinerary.metadata?.title,
        destination: itinerary.overview?.destination,
        dates: `${itinerary.metadata?.startDate} to ${itinerary.metadata?.endDate}`,
        generatedDate: new Date().toLocaleDateString('en-IN'),
      },
      body: itinerary.days,
      footer: {
        totalCost: itinerary.summary?.totalCost,
        currency: 'INR',
        generatedBy: 'TripPeIndia AI',
      },
    },
  };
}
