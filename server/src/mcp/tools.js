import { z } from 'zod';
import { RESOURCE_URIS } from './resources.js';
import { analyzeIssue } from '../tools/analyze.js';
import { generatePlan } from '../tools/plan.js';
import { generateBOM } from '../tools/bom.js';
import { requestQuotes } from '../tools/quotes.js';
import { submitOutcome } from '../tools/submit-outcome.js';

const riskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

const photoAnnotationSchema = z.object({
  x: z.number(),
  y: z.number(),
  label: z.string().optional()
});

const photoInputSchema = z.union([
  z.string().min(1),
  z.object({
    data: z.string().min(1),
    mimeType: z.string().optional(),
    annotations: z.array(photoAnnotationSchema).optional()
  })
]);

const analyzeInputSchema = z.object({
  description: z.string().min(10).max(600),
  photos: z.array(photoInputSchema).min(1).max(5)
});

const diagnosisSchema = z.object({
  issue_type: z.string(),
  risk_level: riskLevelSchema,
  recommendation: z.enum(['diy', 'hire']),
  confidence: z.number(),
  safety_concerns: z.array(z.string()),
  summary: z.string(),
  diy_disabled: z.boolean(),
  safety_gate: z.string().optional()
});

const bomItemSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string().nullable(),
  price_min: z.number(),
  price_max: z.number(),
  optional: z.boolean(),
  notes: z.string(),
  have_it: z.boolean()
});

const bomSchema = z.object({
  parts: z.array(bomItemSchema),
  tools: z.array(bomItemSchema),
  total: z.object({
    min: z.number(),
    max: z.number()
  })
});

const analyzeOutputSchema = z.object({
  diagnosis: diagnosisSchema,
  bom: bomSchema.optional(),
  raw_analysis: z.string().optional()
});

const planInputSchema = z.object({
  issue_type: z.string().min(3).max(120),
  risk_level: riskLevelSchema
});

const planStepSchema = z.object({
  step_number: z.number(),
  title: z.string(),
  description: z.string(),
  duration_minutes: z.number(),
  safety_note: z.string().optional(),
  tools_needed: z.array(z.string()).optional(),
  parts_needed: z.array(z.string()).optional()
});

const planSchema = z.object({
  title: z.string(),
  issue_type: z.string(),
  risk_level: riskLevelSchema,
  steps: z.array(planStepSchema),
  total_time_minutes: z.number(),
  difficulty: z.string(),
  safety_warning: z.string().nullable()
});

const progressSchema = z.object({
  started_at: z.string().nullable(),
  completed_steps: z.array(z.number()),
  paused_at: z.string().nullable(),
  actual_costs: z.object({
    parts: z.number(),
    tools: z.number()
  }),
  notes: z.array(z.string())
});

const planOutputSchema = z.object({
  plan: planSchema,
  bom: bomSchema,
  progress: progressSchema
});

const quotesInputSchema = z.object({
  zip: z.string().regex(/^[0-9]{5}$/),
  scope: z.string().min(20).max(1000),
  confirmed: z.boolean()
});

const contractorSchema = z.object({
  name: z.string(),
  rating: z.number(),
  review_count: z.number(),
  years_in_business: z.number(),
  licensed: z.boolean(),
  insured: z.boolean(),
  specialties: z.array(z.string()),
  typical_response_time: z.string(),
  distance_miles: z.number()
});

const quoteOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  message: z.string().optional(),
  confirmation_needed: z.boolean().optional(),
  quote_request: z.object({
    zip_code: z.string(),
    work_scope: z.string(),
    requested_at: z.string(),
    status: z.string(),
    message: z.string()
  }).optional(),
  contractors: z.array(contractorSchema).optional(),
  next_steps: z.array(z.string()).optional(),
  privacy_note: z.string().optional()
});

const outcomeInputSchema = z.object({
  diagnosis_id: z.string().min(5),
  outcome: z.enum(['success', 'partial', 'failed', 'hired_pro']),
  actual_time_minutes: z.number().nullable().optional(),
  actual_cost: z.number().nullable().optional(),
  difficulty_rating: z.number().min(1).max(5).nullable().optional(),
  after_photos: z.array(photoInputSchema).optional(),
  tips: z.string().max(1000).nullable().optional(),
  would_recommend_diy: z.boolean().nullable().optional()
});

const successMetricsSchema = z.object({
  total_attempts: z.number(),
  success_rate: z.number(),
  avg_time_minutes: z.number(),
  avg_cost: z.number(),
  diy_recommendation_rate: z.number(),
  common_tips: z.array(z.string())
});

const outcomeOutputSchema = z.object({
  success: z.boolean(),
  outcome_id: z.string().optional(),
  thank_you_message: z.string().optional(),
  community_insight: z.string().optional(),
  success_metrics: successMetricsSchema.optional(),
  next_steps: z.array(z.string()).optional(),
  tip_shared: z.boolean().optional(),
  tip_impact: z.string().optional()
});

const defaultProgressState = {
  started_at: null,
  completed_steps: [],
  paused_at: null,
  actual_costs: { parts: 0, tools: 0 },
  notes: []
};

const TOOL_DEFINITIONS = [
  {
    name: 'analyze_issue',
    title: 'Analyze Home Repair Issue',
    description: 'Analyze photos and description to produce a safety-aware diagnosis with a starter materials list.',
    inputSchema: analyzeInputSchema,
    outputSchema: analyzeOutputSchema,
    meta: {
      'openai/outputTemplate': RESOURCE_URIS.diagnosis
    },
    handler: async ({ description, photos }) => {
      const analysis = await analyzeIssue({ description, photos });
      const bom = await generateBOM({ issue_type: analysis.diagnosis.issue_type });

      return {
        content: [
          {
            type: 'text',
            text: `Identified ${analysis.diagnosis.issue_type} (${analysis.diagnosis.risk_level} risk).`
          }
        ],
        structuredContent: {
          diagnosis: analysis.diagnosis,
          bom,
          raw_analysis: analysis.raw_analysis
        }
      };
    }
  },
  {
    name: 'generate_repair_plan',
    title: 'Generate Repair Plan',
    description: 'Create a step-by-step repair plan with live progress tracking and bill of materials.',
    inputSchema: planInputSchema,
    outputSchema: planOutputSchema,
    meta: {
      'openai/outputTemplate': RESOURCE_URIS.steps
    },
    handler: async ({ issue_type, risk_level }) => {
      const plan = await generatePlan({ issue_type, risk_level });
      const bom = await generateBOM({ issue_type });

      return {
        content: [
          {
            type: 'text',
            text: `Generated plan with ${plan.steps.length} steps (${plan.difficulty}).`
          }
        ],
        structuredContent: {
          plan,
          bom,
          progress: defaultProgressState
        }
      };
    }
  },
  {
    name: 'request_quotes',
    title: 'Request Contractor Quotes',
    description: 'Prepare or send contractor quote requests for the scoped repair.',
    inputSchema: quotesInputSchema,
    outputSchema: quoteOutputSchema,
    meta: {},
    handler: async ({ zip, scope, confirmed }) => {
      const result = await requestQuotes({ zip, scope, confirmed });

      const content = result.success
        ? [{ type: 'text', text: 'Quote request prepared with recommended contractors.' }]
        : [{ type: 'text', text: result.message || result.error || 'Unable to process quote request.' }];

      return {
        content,
        structuredContent: result,
        isError: !result.success
      };
    }
  },
  {
    name: 'submit_outcome',
    title: 'Submit Repair Outcome',
    description: 'Share the repair outcome to improve future recommendations.',
    inputSchema: outcomeInputSchema,
    outputSchema: outcomeOutputSchema,
    meta: {},
    handler: async (payload) => {
      const result = await submitOutcome(payload);

      return {
        content: [
          {
            type: 'text',
            text: result.thank_you_message || 'Thanks for sharing your experience!'
          }
        ],
        structuredContent: result
      };
    }
  }
];

export function registerTools(server) {
  TOOL_DEFINITIONS.forEach(({ name, title, description, inputSchema, outputSchema, meta, handler }) => {
    server.registerTool(
      name,
      {
        title,
        description,
        inputSchema,
        outputSchema,
        _meta: meta
      },
      handler
    );
  });
}

export const toolManifest = TOOL_DEFINITIONS.map(({ name, title, description, meta }) => ({
  name,
  title,
  description,
  _meta: meta
}));
