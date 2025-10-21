import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

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
          content: `You are a home repair expert creating a detailed bill of materials (BOM) for DIY repairs.

REQUIREMENTS:
- Separate consumable parts from reusable tools
- Provide quantity with units, realistic min/max cost, and concise notes
- Flag optional items (true/false)
- Keep the list focused (max 10 items per category)
- Use JSON format exactly as specified

Return JSON format:
{
  "parts": [
    { "name": "...", "quantity": 2, "unit": "piece", "price_min": 5.99, "price_max": 12.99, "optional": false, "notes": "..." }
  ],
  "tools": [
    { "name": "...", "quantity": 1, "price_min": 15.00, "price_max": 50.00, "optional": false, "notes": "..." }
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
    const parts = normalizeItems(bom.parts || []);
    const tools = normalizeItems(bom.tools || []);
    const totals = {
      min: normalizeCurrency(bom.total_cost_min, sumCosts(parts, tools, 'min')),
      max: normalizeCurrency(bom.total_cost_max, sumCosts(parts, tools, 'max'))
    };

    logger.info('BOM generated successfully', {
      partCount: parts.length,
      toolCount: tools.length,
      estimatedCost: `$${totals.min}-${totals.max}`
    });

    return {
      parts,
      tools,
      total: totals
    };
  } catch (error) {
    logger.error('BOM generation failed', error);
    throw new Error(`Failed to generate BOM: ${error.message}`);
  }
}

function normalizeItems(items) {
  return items.slice(0, 10).map(item => ({
    name: item.name,
    quantity: item.quantity ?? 1,
    unit: item.unit || null,
    price_min: normalizeCurrency(item.price_min, 0),
    price_max: normalizeCurrency(item.price_max, 0),
    optional: Boolean(item.optional),
    notes: item.notes || '',
    have_it: false
  }));
}

function sumCosts(parts, tools, field) {
  return [...parts, ...tools].reduce((total, item) => {
    const value = field === 'min' ? item.price_min : item.price_max;
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

function normalizeCurrency(value, fallback) {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isFinite(parsed)) {
    return Number(parsed.toFixed(2));
  }
  return Number.isFinite(fallback) ? Number(fallback.toFixed(2)) : 0;
}
