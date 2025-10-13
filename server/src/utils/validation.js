import { z } from 'zod';

// Validation schemas
const schemas = {
  analyze_issue: z.object({
    photos: z.array(z.any()).min(1).max(5),
    description: z.string().min(10).max(500)
  }),
  
  generate_plan: z.object({
    issue_type: z.string().min(3).max(100),
    risk_level: z.enum(['low', 'medium', 'high', 'critical'])
  }),
  
  generate_bom: z.object({
    issue_type: z.string().min(3).max(100)
  }),
  
  request_quotes: z.object({
    zip: z.string().regex(/^[0-9]{5}$/),
    scope: z.string().min(20).max(1000),
    confirmed: z.boolean().refine(val => val === true, {
      message: 'User confirmation required for contractor outreach'
    })
  })
};

export function validateToolInput(toolName, input) {
  const schema = schemas[toolName];
  
  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown tool: ${toolName}`]
    };
  }
  
  try {
    schema.parse(input);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}

// Sanitize user input to prevent injection attacks
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 10000); // Hard limit
  }
  return input;
}
