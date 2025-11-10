/**
 * Export Routes
 * Handles PDF and other export formats
 */

import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/export/pdf
 * Generates PDF from itinerary JSON
 */
router.post('/pdf', async (req, res) => {
  try {
    const itineraryData = req.body;

    logger.info('PDF export request received');
    logger.debug(`Itinerary data: ${JSON.stringify(itineraryData).substring(0, 200)}...`);

    // Validate required fields
    if (!itineraryData.metadata) {
      logger.error('Missing metadata in PDF export request');
      return res.status(400).json({
        error: 'Invalid itinerary data: missing metadata',
        details: 'Metadata field is required with title, destination, startDate, endDate',
      });
    }

    if (!itineraryData.days || !Array.isArray(itineraryData.days)) {
      logger.error('Missing or invalid days in PDF export request');
      return res.status(400).json({
        error: 'Invalid itinerary data: missing or invalid days',
        details: 'Days must be an array of day objects',
      });
    }

    if (itineraryData.days.length === 0) {
      logger.error('Empty days array in PDF export request');
      return res.status(400).json({
        error: 'Invalid itinerary data: empty days array',
        details: 'At least one day must be included',
      });
    }

    // For now, return the JSON as a downloadable file
    // In production, you would use a library like pdfkit or puppeteer
    // to generate an actual PDF

    // Create HTML content from JSON
    const htmlContent = generateHTMLFromJSON(itineraryData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${itineraryData.metadata.destination || 'itinerary'}-${new Date().toISOString().split('T')[0]}.html"`
    );

    res.send(htmlContent);

    logger.info('PDF export completed successfully');
  } catch (error) {
    logger.error(`PDF export error: ${error.message}`);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message,
    });
  }
});

/**
 * Generate HTML from itinerary JSON
 * This can be converted to PDF using tools like wkhtmltopdf or puppeteer
 */
function generateHTMLFromJSON(data) {
  const destination = data.metadata?.destination || 'Travel Itinerary';
  const startDate = data.metadata?.startDate || '';
  const endDate = data.metadata?.endDate || '';
  const totalCost = data.summary?.totalCost || 0;

  let daysHTML = '';
  if (data.days && Array.isArray(data.days)) {
    data.days.forEach((day) => {
      daysHTML += `
        <div class="day-section">
          <h2>Day ${day.day}: ${day.title || ''}</h2>
          <p class="date">${day.date || ''}</p>
          
          ${day.morning ? `
            <div class="time-slot">
              <h3>🌅 Morning</h3>
              <p><strong>Time:</strong> ${day.morning.time || ''}</p>
              <p><strong>Activity:</strong> ${day.morning.activity || ''}</p>
              ${day.morning.cost ? `<p><strong>Cost:</strong> ₹${day.morning.cost}</p>` : ''}
            </div>
          ` : ''}
          
          ${day.afternoon ? `
            <div class="time-slot">
              <h3>☀️ Afternoon</h3>
              <p><strong>Time:</strong> ${day.afternoon.time || ''}</p>
              <p><strong>Activity:</strong> ${day.afternoon.activity || ''}</p>
              ${day.afternoon.cost ? `<p><strong>Cost:</strong> ₹${day.afternoon.cost}</p>` : ''}
            </div>
          ` : ''}
          
          ${day.evening ? `
            <div class="time-slot">
              <h3>🌆 Evening</h3>
              <p><strong>Time:</strong> ${day.evening.time || ''}</p>
              <p><strong>Activity:</strong> ${day.evening.activity || ''}</p>
              ${day.evening.cost ? `<p><strong>Cost:</strong> ₹${day.evening.cost}</p>` : ''}
            </div>
          ` : ''}
          
          ${day.meals && day.meals.length > 0 ? `
            <div class="meals-section">
              <h3>🍽️ Meals</h3>
              <ul>
                ${day.meals.map(meal => `
                  <li>${meal.type}: ${meal.restaurant} - ₹${meal.cost}</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${day.transport && day.transport.length > 0 ? `
            <div class="transport-section">
              <h3>🚗 Transport</h3>
              <ul>
                ${day.transport.map(t => `
                  <li>${t.mode}: ${t.from} → ${t.to} (₹${t.cost}, ${t.duration})</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${day.dailyTotal ? `
            <div class="daily-total">
              <strong>Daily Total: ₹${day.dailyTotal}</strong>
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  const costBreakdown = data.summary?.costBreakdown || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${destination} Itinerary</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        
        h1 {
          font-size: 2.5em;
          color: #2563eb;
          margin-bottom: 10px;
        }
        
        .trip-info {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 8px;
        }
        
        .info-box {
          text-align: center;
        }
        
        .info-box strong {
          display: block;
          color: #2563eb;
          margin-bottom: 5px;
        }
        
        .day-section {
          margin-bottom: 40px;
          padding: 20px;
          background: #f9fafb;
          border-left: 4px solid #2563eb;
          border-radius: 4px;
        }
        
        .day-section h2 {
          color: #2563eb;
          margin-bottom: 5px;
          font-size: 1.5em;
        }
        
        .date {
          color: #666;
          font-size: 0.9em;
          margin-bottom: 15px;
        }
        
        .time-slot {
          margin-bottom: 15px;
          padding: 15px;
          background: white;
          border-radius: 4px;
          border-left: 3px solid #10b981;
        }
        
        .time-slot h3 {
          color: #10b981;
          margin-bottom: 8px;
          font-size: 1.1em;
        }
        
        .time-slot p {
          margin-bottom: 5px;
          font-size: 0.95em;
        }
        
        .meals-section, .transport-section {
          margin-top: 15px;
          padding: 15px;
          background: white;
          border-radius: 4px;
          border-left: 3px solid #f59e0b;
        }
        
        .meals-section h3, .transport-section h3 {
          color: #f59e0b;
          margin-bottom: 10px;
        }
        
        .meals-section ul, .transport-section ul {
          list-style: none;
          padding-left: 0;
        }
        
        .meals-section li, .transport-section li {
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .daily-total {
          margin-top: 15px;
          padding: 15px;
          background: #ecfdf5;
          border-left: 3px solid #10b981;
          font-size: 1.1em;
          color: #10b981;
        }
        
        .summary {
          margin-top: 40px;
          padding: 20px;
          background: #f0f9ff;
          border-radius: 8px;
        }
        
        .summary h2 {
          color: #2563eb;
          margin-bottom: 15px;
        }
        
        .cost-breakdown {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .cost-item {
          padding: 10px;
          background: white;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
        }
        
        .total-cost {
          font-size: 1.5em;
          color: #2563eb;
          font-weight: bold;
          text-align: center;
          padding: 20px;
          background: #dbeafe;
          border-radius: 4px;
          margin-top: 15px;
        }
        
        footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>🇮🇳 ${destination}</h1>
          <p>Your TripPeIndia Itinerary</p>
        </header>
        
        <div class="trip-info">
          <div class="info-box">
            <strong>📅 Dates</strong>
            <span>${startDate} to ${endDate}</span>
          </div>
          <div class="info-box">
            <strong>👥 Travelers</strong>
            <span>${data.overview?.travelers?.adults || 2} adults, ${data.overview?.travelers?.children || 0} children</span>
          </div>
          <div class="info-box">
            <strong>💰 Budget</strong>
            <span>₹${data.overview?.budget?.total || 0}</span>
          </div>
        </div>
        
        <div class="days-container">
          ${daysHTML}
        </div>
        
        <div class="summary">
          <h2>📊 Trip Summary</h2>
          <div class="cost-breakdown">
            <div class="cost-item">
              <span>🏨 Accommodation</span>
              <strong>₹${costBreakdown.accommodation || 0}</strong>
            </div>
            <div class="cost-item">
              <span>🎯 Attractions</span>
              <strong>₹${costBreakdown.attractions || 0}</strong>
            </div>
            <div class="cost-item">
              <span>🍽️ Meals</span>
              <strong>₹${costBreakdown.meals || 0}</strong>
            </div>
            <div class="cost-item">
              <span>🚗 Transport</span>
              <strong>₹${costBreakdown.transport || 0}</strong>
            </div>
          </div>
          <div class="total-cost">
            Total Estimated Cost: ₹${totalCost}
          </div>
        </div>
        
        <footer>
          <p>Generated by TripPeIndia AI on ${new Date().toLocaleDateString('en-IN')}</p>
          <p>Have a wonderful trip! 🌍✈️</p>
        </footer>
      </div>
    </body>
    </html>
  `;
}

export default router;
