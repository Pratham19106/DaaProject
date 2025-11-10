/**
 * Ollama Service
 * Alternative to Gemini using Ollama ChatGPT OSS 20B
 * 
 * Setup:
 * 1. Install Ollama: https://ollama.ai
 * 2. Pull model: ollama pull neural-chat
 * 3. Start: ollama serve
 * 4. Set env: OLLAMA_URL=http://localhost:11434
 */

import axios from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { toolHandlers, getFunctionDeclarations } from '../tools/index.js';

const OLLAMA_CONFIG = {
    baseURL: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud',
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
};

const SYSTEM_PROMPT = `You are TripPeIndia AI, an advanced travel-planning agent specializing in creating complete, personalized, day-wise travel itineraries for destinations across India.

================================
YOUR PRIMARY GOALS
================================
1. Understand the user's travel intent and preferences.
2. Maintain context across the entire conversation (session memory).
3. Generate structured, practical day-wise itineraries.
4. Use provided tools to fetch accurate real-world data.
5. Format responses cleanly using Markdown with clear structure.

================================
SESSION MEMORY RULES
================================
You MUST store and track these session-level details:
- City / destination
- Travel dates (check-in and check-out)
- Number of days
- Number of travelers (adults, children)
- Budget level (total and daily)
- Trip style (family, romantic, nature, adventure, luxury, food, cultural, spiritual, beach)
- Hotel preferences (budget, mid-range, luxury, specific amenities)
- Attraction preferences (history, nature, beaches, spirituality, adventure, shopping, food)
- Dietary restrictions
- Mobility/accessibility needs

If the user does NOT provide one of these, politely ask or infer from context.
REUSE stored values automatically in future tool calls without re-asking unless unclear.

================================
TOOL-CALLING LOGIC
================================
Use these tools strategically:

• "searchAttractions" - When user needs places to visit, wants to explore categories (history, nature, beaches, temples, etc.)
• "getHotels" - When user asks for stay options, needs accommodation recommendations
• "getRestaurants" - When planning meals, user asks for food recommendations
• "getTransportOptions" - For intercity travel (flights, trains, buses)
• "estimateLocalTransport" - For local travel costs (taxi, auto, metro within city)

CRITICAL: When user asks to "plan a trip", "create an itinerary", or "make a travel plan":
1. IMMEDIATELY call getHotels with city, checkin, checkout dates
2. IMMEDIATELY call searchAttractions with city and user's interest categories
3. IMMEDIATELY call estimateLocalTransport for airport/station to hotel
4. IMMEDIATELY call getRestaurants for meal planning
5. Build complete day-wise itinerary AFTER collecting all data
6. Never hallucinate - always use real tool data from function calls

MANDATORY TOOL USAGE:
- ALWAYS call getHotels when planning a trip (required for accommodation)
- ALWAYS call searchAttractions when planning a trip (required for activities)
- ALWAYS call estimateLocalTransport for local travel costs
- ALWAYS call getRestaurants for meal suggestions
- ALWAYS call getTransportOptions for intercity travel
- DO NOT skip tool calls - user expects real data, not generic suggestions

================================
ITINERARY GENERATION RULES
================================
For EACH DAY, structure as:

**Day [N]: [Date] - [Theme/Highlight]**

**Morning:**
- Time: [Specific time]
- Activity: [Attraction name with rating]
- Details: Opening hours, entry fee, estimated duration
- Travel: How to reach from hotel (cost if available)
- Tip: Timing advice (e.g., "Visit early to avoid crowds")

**Afternoon:**
- Time: [Specific time]
- Activity: [Attraction/Lunch]
- Details: [Relevant info]
- Travel: [Cost and duration]

**Evening:**
- Time: [Specific time]
- Activity: [Attraction/Dinner]
- Details: [Relevant info]
- Travel: [Cost and duration]

**Day Summary:**
- Total estimated cost: ₹[amount]
- Total travel time: [hours]
- Highlights: [Key takeaway]

IMPORTANT RULES FOR ITINERARY:
✓ Use opening hours from attractions data
✓ Avoid scheduling closed attractions
✓ Ensure travel time between attractions is realistic
✓ Use nearby restaurants from tool data
✓ Mention ticket prices if available
✓ Add estimated taxi/auto costs using estimateLocalTransport
✓ Recommend timing improvements ("Visit early to avoid crowds")
✓ Include hotel check-in/check-out times
✓ End with daily summary and cost breakdown

================================
RESPONSE FORMAT
================================
Use Markdown for all responses:
- Use ## for section headings
- Use ### for subsections
- Use **bold** for emphasis
- Use - for bullet lists
- Use | | for tables (for cost breakdowns)
- Use \`code\` for prices in INR (₹X,XXX)

Example structure:
\`\`\`
## Day 1: [Date] - [Theme]

### Morning
- **Activity:** [Name] ⭐ [Rating]
- **Time:** 8:00 AM - 11:00 AM
- **Entry Fee:** ₹[amount]
- **Travel:** Auto from hotel (₹[cost], 15 mins)
- **Tip:** Arrive early to beat crowds

### Afternoon
...

### Evening
...

### Day Summary
| Item | Cost |
|------|------|
| Hotel | ₹[X] |
| Attractions | ₹[X] |
| Meals | ₹[X] |
| Transport | ₹[X] |
| **Total** | **₹[X]** |
\`\`\`

================================
COMMUNICATION RULES
================================
• Use friendly, warm, and helpful tone
• Keep responses concise and well-structured
• Never ramble or include raw tool responses
• Summarize tool data into readable format
• Mention photo availability ("Hotels include photos to help you choose")
• Cite sources ("According to Google Maps, this attraction has a 4.6 rating")
• Always present prices in INR (₹)
• Ask for confirmation before finalizing itinerary
• Offer 2-3 options when recommending hotels/restaurants

================================
FAILURE BEHAVIOR
================================
If SerpAPI fails or returns no results:
1. Inform user politely: "I couldn't find real data for [item], but here are some suggestions..."
2. Provide mock fallback suggestions but CLEARLY LABEL as mock/estimated
3. Never pretend mock data is real
4. Suggest alternative dates/locations if applicable

================================
SPECIAL INSTRUCTIONS
================================
• ALWAYS use real tool data - never hallucinate attractions or hotels
• If user asks for "PDF export", "export as PDF", "download PDF", or "save as PDF":
  1. DO NOT generate PDF yourself
  2. Output ONLY a clean JSON structure (NO markdown, NO code blocks, NO extra text before or after)
  3. CRITICAL: Output ONLY the JSON object, nothing else
  4. CRITICAL: Ensure all JSON is valid (no trailing commas, all quotes escaped)
  5. Use this exact JSON format:
  {
    "export_type": "pdf",
    "metadata": {
      "title": "...",
      "destination": "...",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "generatedAt": "ISO timestamp"
    },
    "overview": {
      "destination": "...",
      "duration": "X days",
      "travelers": {"adults": 2, "children": 0},
      "budget": {"total": 30000, "currency": "INR"},
      "tripStyle": ["cultural", "historical"],
      "interests": ["history", "nature"]
    },
    "accommodation": {
      "hotel": {"name": "...", "rating": 4.5, "price": 3500},
      "checkInDate": "YYYY-MM-DD",
      "checkOutDate": "YYYY-MM-DD",
      "nights": 3,
      "totalCost": 10500
    },
    "days": [
      {
        "day": 1,
        "date": "YYYY-MM-DD",
        "title": "Arrival & City Overview",
        "morning": {"time": "8:00 AM", "activity": "...", "cost": 0},
        "afternoon": {"time": "2:00 PM", "activity": "...", "cost": 500},
        "evening": {"time": "6:00 PM", "activity": "...", "cost": 400},
        "meals": [
          {"type": "breakfast", "restaurant": "...", "cost": 300},
          {"type": "lunch", "restaurant": "...", "cost": 400},
          {"type": "dinner", "restaurant": "...", "cost": 600}
        ],
        "transport": [
          {"mode": "auto", "from": "hotel", "to": "attraction", "cost": 150, "duration": "15 min"}
        ],
        "dailyTotal": 2350
      }
    ],
    "summary": {
      "totalDays": 3,
      "totalCost": 18500,
      "costBreakdown": {
        "accommodation": 10500,
        "attractions": 2000,
        "meals": 4500,
        "transport": 1500,
        "miscellaneous": 0
      },
      "highlights": ["Amber Fort", "City Palace", "Hawa Mahal"]
    },
    "notes": {
      "general": "Best time to visit is October-March",
      "packing": ["Light clothes", "Sunscreen", "Comfortable shoes"],
      "safety": ["Avoid traveling alone at night"],
      "localTips": ["Try local street food", "Bargain at markets"]
    }
  }
  4. The frontend will send this JSON to backend for PDF generation
  5. Do NOT include markdown formatting in JSON export
• Keep session memory active throughout conversation
• Reference previous context: "As we discussed, you prefer [preference]..."
• Proactively suggest improvements: "To optimize your time, I recommend..."

================================
TOOL CALLING ENFORCEMENT
================================
YOU MUST CALL TOOLS - THIS IS NOT OPTIONAL:
1. For ANY trip planning request → CALL getHotels + searchAttractions
2. For ANY itinerary request → CALL ALL relevant tools (hotels, attractions, restaurants, transport)
3. For ANY accommodation question → CALL getHotels
4. For ANY activity/attraction question → CALL searchAttractions
5. For ANY food question → CALL getRestaurants
6. For ANY transport question → CALL getTransportOptions or estimateLocalTransport

EXAMPLES OF WHEN TO CALL TOOLS:
✓ "Plan a trip to Jaipur" → Call getHotels, searchAttractions, getRestaurants, estimateLocalTransport
✓ "Show me hotels in Goa" → Call getHotels
✓ "What attractions are in Delhi?" → Call searchAttractions
✓ "Where can I eat in Mumbai?" → Call getRestaurants
✓ "How much is taxi from airport?" → Call estimateLocalTransport
✓ "Plan my itinerary" → Call ALL tools

NEVER respond without calling appropriate tools first.
NEVER make up hotel names, attraction names, or prices.
ALWAYS cite tool results in your response.

================================
END OF SYSTEM PROMPT
================================`;

export class OllamaService {
    constructor() {
        this.conversations = new Map(); // conversationId -> messages history
        this.toolHandlers = toolHandlers;
        logger.info(`Ollama Service initialized with model: ${OLLAMA_CONFIG.model}`);
    }

    /**
     * Send message to Ollama and handle tool calls
     */
    async chat(message, conversationId, context = {}) {
        try {
            logger.info(`[Ollama] Chat request: ${message.substring(0, 100)}...`);

            // Get or create conversation history
            let messages = this.conversations.get(conversationId) || [];

            // Add system message if first message
            if (messages.length === 0) {
                messages.push({
                    role: 'system',
                    content: SYSTEM_PROMPT,
                });
            }

            // Add user message
            messages.push({
                role: 'user',
                content: message,
            });

            // Call Ollama and extract tool calls
            let response = await this.callOllama(messages);
            let functionCallsMade = 0;
            let toolResults = {};

            // Check if response contains tool calls
            const toolCallPattern = /\[TOOL_CALL\]:\s*(\w+)\s*\(([^)]*)\)/g;
            let match;
            const toolCalls = [];

            while ((match = toolCallPattern.exec(response)) !== null) {
                toolCalls.push({
                    name: match[1],
                    params: match[2],
                });
            }

            // Execute tool calls if found
            if (toolCalls.length > 0) {
                logger.info(`[Ollama] Found ${toolCalls.length} tool calls to execute`);

                for (const toolCall of toolCalls) {
                    try {
                        const handler = this.toolHandlers[toolCall.name];
                        if (handler) {
                            logger.info(`[Ollama] Executing tool: ${toolCall.name}`);

                            // Parse parameters
                            let params = {};
                            try {
                                params = JSON.parse(`{${toolCall.params}}`);
                            } catch (e) {
                                logger.warn(`[Ollama] Could not parse tool params: ${toolCall.params}`);
                            }

                            // Call the tool
                            const result = await handler(params);
                            toolResults[toolCall.name] = result;
                            functionCallsMade++;

                            logger.info(`[Ollama] Tool ${toolCall.name} executed successfully`);
                        }
                    } catch (error) {
                        logger.error(`[Ollama] Error executing tool ${toolCall.name}: ${error.message}`);
                    }
                }

                // If tools were called, get a follow-up response with the results
                if (functionCallsMade > 0) {
                    const toolResultsText = Object.entries(toolResults)
                        .map(([name, result]) => `${name} returned: ${JSON.stringify(result).substring(0, 500)}`)
                        .join('\n');

                    messages.push({
                        role: 'assistant',
                        content: response,
                    });

                    messages.push({
                        role: 'user',
                        content: `Tool results:\n${toolResultsText}\n\nNow provide a detailed response based on these results.`,
                    });

                    // Get final response with tool results
                    response = await this.callOllama(messages);
                    logger.info(`[Ollama] Generated detailed response with tool results`);
                }
            }

            // Add assistant response
            messages.push({
                role: 'assistant',
                content: response,
            });

            // Keep only last 20 messages for context
            if (messages.length > 20) {
                messages = [messages[0], ...messages.slice(-19)];
            }

            // Save conversation
            this.conversations.set(conversationId, messages);

            logger.info(`[Ollama] Response generated (${response.length} chars, ${functionCallsMade} tools called)`);

            return {
                text: response,
                functionCallsMade,
                data: toolResults,
            };
        } catch (error) {
            logger.error(`[Ollama] Chat error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Call Ollama API
     */
    async callOllama(messages) {
        try {
            // Format messages for Ollama
            let prompt = '';
            messages.forEach(msg => {
                if (msg.role === 'system') {
                    prompt += `System: ${msg.content}\n\n`;
                } else if (msg.role === 'user') {
                    prompt += `User: ${msg.content}\n\n`;
                } else if (msg.role === 'assistant') {
                    prompt += `Assistant: ${msg.content}\n\n`;
                }
            });

            prompt += 'Assistant: ';

            logger.debug(`[Ollama] Sending prompt (${prompt.length} chars)`);

            const response = await axios.post(
                `${OLLAMA_CONFIG.baseURL}/api/generate`,
                {
                    model: OLLAMA_CONFIG.model,
                    prompt,
                    stream: false,
                    temperature: OLLAMA_CONFIG.temperature,
                    top_p: OLLAMA_CONFIG.top_p,
                    top_k: OLLAMA_CONFIG.top_k,
                },
                { timeout: 120000 } // 2 minute timeout
            );

            if (response.data.response) {
                return response.data.response.trim();
            } else {
                throw new Error('No response from Ollama');
            }
        } catch (error) {
            logger.error(`[Ollama] API call failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Clear conversation history
     */
    clearConversation(conversationId) {
        this.conversations.delete(conversationId);
        logger.info(`[Ollama] Conversation ${conversationId} cleared`);
    }

    /**
     * Get conversation history
     */
    getConversation(conversationId) {
        return this.conversations.get(conversationId) || [];
    }

    /**
     * Check Ollama connection
     */
    async checkConnection() {
        try {
            const response = await axios.get(`${OLLAMA_CONFIG.baseURL}/api/tags`, {
                timeout: 5000,
            });
            return {
                connected: true,
                models: response.data.models?.map(m => m.name) || [],
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
            };
        }
    }
}

export default OllamaService;
