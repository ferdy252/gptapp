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

export async function generatePlan({ issue_type, risk_level }) {
  try {
    logger.info('Generating repair plan', { issue_type, risk_level });
    
    // If critical/high risk, return "hire professional" plan
    if (risk_level === 'critical' || risk_level === 'high') {
      return {
        success: true,
        steps: [
          {
            step_number: 1,
            title: 'Do Not Attempt DIY Repair',
            description: 'This repair involves significant safety risks and should only be performed by licensed professionals.',
            duration_minutes: 0,
            safety_note: '⚠️ CRITICAL: This is a high-risk repair. Attempting DIY could result in injury, property damage, or code violations.',
            tools_needed: [],
            parts_needed: []
          },
          {
            step_number: 2,
            title: 'Contact Licensed Professionals',
            description: 'Get multiple quotes from certified contractors who are licensed and insured for this type of work.',
            duration_minutes: 30,
            safety_note: 'Verify contractor licenses and insurance before hiring.',
            tools_needed: [],
            parts_needed: []
          }
        ],
        total_time_minutes: 30,
        difficulty: 'Professional Required',
        safety_warning: `This repair is classified as ${risk_level} risk and requires professional expertise.`
      };
    }
    
    // Generate DIY plan for low/medium risk
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a home repair expert creating step-by-step DIY repair instructions.

REQUIREMENTS:
- Provide 5-10 clear, actionable steps
- Each step must include:
  * Step number
  * Title (brief, action-oriented)
  * Description (2-3 sentences)
  * Estimated duration in minutes
  * Safety note (specific hazards or precautions)
  * Tools needed for this step
  * Parts needed for this step

- Keep instructions simple and beginner-friendly
- Emphasize safety at every step
- Include specific measurements and details
- Total time should be realistic (including prep and cleanup)

Return JSON format:
{
  "steps": [
    {
      "step_number": 1,
      "title": "...",
      "description": "...",
      "duration_minutes": 15,
      "safety_note": "...",
      "tools_needed": ["..."],
      "parts_needed": ["..."]
    }
  ],
  "total_time_minutes": 120,
  "difficulty": "Beginner|Intermediate|Advanced"
}`
        },
        {
          role: 'user',
          content: `Create a repair plan for: ${issue_type}\nRisk level: ${risk_level}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });
    
    const plan = JSON.parse(response.choices[0].message.content);
    
    logger.info('Plan generated successfully', {
      stepCount: plan.steps?.length,
      totalTime: plan.total_time_minutes
    });
    
    return {
      success: true,
      ...plan,
      risk_level
    };
    
  } catch (error) {
    logger.error('Plan generation failed', error);
    throw new Error(`Failed to generate plan: ${error.message}`);
  }
}
