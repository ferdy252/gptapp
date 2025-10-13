import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Lazy initialization - create client when first needed
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

export async function generateBOM({ issue_type }) {
  try {
    logger.info('Generating bill of materials', { issue_type });
    
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a home repair expert creating a bill of materials (BOM) for DIY repairs.

REQUIREMENTS:
- List all parts and tools needed
- For each item provide:
  * Name (specific product type)
  * Category (part or tool)
  * Quantity needed
  * Price range (min-max in USD, realistic retail prices)
  * Optional flag (true if not strictly required)
  * Notes (size, specifications, alternatives)

- Separate parts (consumed) from tools (reusable)
- Include common household items if needed
- Price ranges should be current retail (Home Depot, Lowe's, Amazon)
- Be specific: "1/2 inch PVC pipe" not just "pipe"

Return JSON format:
{
  "parts": [
    {
      "name": "...",
      "category": "part",
      "quantity": 2,
      "unit": "piece|foot|gallon|etc",
      "price_min": 5.99,
      "price_max": 12.99,
      "optional": false,
      "notes": "..."
    }
  ],
  "tools": [
    {
      "name": "...",
      "category": "tool",
      "quantity": 1,
      "price_min": 15.00,
      "price_max": 50.00,
      "optional": false,
      "notes": "Can use alternatives like..."
    }
  ],
  "total_cost_min": 50.00,
  "total_cost_max": 150.00
}`
        },
        {
          role: 'user',
          content: `Create a bill of materials for: ${issue_type}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    
    const bom = JSON.parse(response.choices[0].message.content);
    
    // Add purchase status tracking (for UI toggle)
    const itemsWithStatus = (list) => list.map(item => ({
      ...item,
      have_it: false // Default: user doesn't have it
    }));
    
    const result = {
      success: true,
      parts: itemsWithStatus(bom.parts || []),
      tools: itemsWithStatus(bom.tools || []),
      total_cost_min: bom.total_cost_min,
      total_cost_max: bom.total_cost_max,
      item_count: (bom.parts?.length || 0) + (bom.tools?.length || 0)
    };
    
    logger.info('BOM generated successfully', {
      partCount: result.parts.length,
      toolCount: result.tools.length,
      estimatedCost: `$${result.total_cost_min}-$${result.total_cost_max}`
    });
    
    return result;
    
  } catch (error) {
    logger.error('BOM generation failed', error);
    throw new Error(`Failed to generate BOM: ${error.message}`);
  }
}
