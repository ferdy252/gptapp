/**
 * Home Repair Diagnosis - MCP Server
 * Official MCP SDK implementation with UI components
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDistPath = join(__dirname, '../../client/dist');

// Load bundled UI components
const DIAGNOSIS_WIDGET_JS = readFileSync(join(clientDistPath, 'diagnosis-widget.js'), 'utf8');
const STEPS_WIDGET_JS = readFileSync(join(clientDistPath, 'steps-widget.js'), 'utf8');
const WIDGET_CSS = (() => {
  try {
    return readFileSync(join(clientDistPath, 'styles.css'), 'utf8');
  } catch {
    return '';
  }
})();

// Create MCP server
const server = new McpServer({
  name: 'home-repair-diagnosis',
  version: '1.0.0',
  description: 'AI-powered home repair diagnosis with photo analysis'
});

// ========================================
// REGISTER UI RESOURCES
// ========================================

// Diagnosis widget resource
server.registerResource(
  'diagnosis-widget',
  'ui://widget/diagnosis.html',
  {},
  async () => ({
    contents: [{
      uri: 'ui://widget/diagnosis.html',
      mimeType: 'text/html+skybridge',
      text: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${WIDGET_CSS ? `<style>${WIDGET_CSS}</style>` : ''}
</head>
<body>
  <div id="diagnosis-root"></div>
  <script type="module">${DIAGNOSIS_WIDGET_JS}</script>
</body>
</html>
      `.trim()
    }]
  })
);

// Steps widget resource
server.registerResource(
  'steps-widget',
  'ui://widget/steps.html',
  {},
  async () => ({
    contents: [{
      uri: 'ui://widget/steps.html',
      mimeType: 'text/html+skybridge',
      text: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${WIDGET_CSS ? `<style>${WIDGET_CSS}</style>` : ''}
</head>
<body>
  <div id="steps-root"></div>
  <script type="module">${STEPS_WIDGET_JS}</script>
</body>
</html>
      `.trim()
    }]
  })
);

// ========================================
// TOOL: ANALYZE ISSUE
// ========================================

server.registerTool(
  'analyze_issue',
  {
    title: 'Analyze Home Repair Issue',
    description: 'Analyzes photos and description to diagnose a home repair issue',
    _meta: {
      'openai/outputTemplate': 'ui://widget/diagnosis.html',
      'openai/toolInvocation/invoking': 'Analyzing your issue...',
      'openai/toolInvocation/invoked': 'Analysis complete'
    },
    inputSchema: z.object({
      photos: z.array(z.string()).min(1).max(5).describe('Base64-encoded photos of the issue'),
      description: z.string().max(500).describe('Short description of the problem')
    })
  },
  async ({ photos, description }) => {
    // Import analyze function
    const { analyzeIssue } = await import('./tools/analyze.js');
    
    const diagnosis = await analyzeIssue(photos, description);
    
    // Get BOM for the diagnosis
    const { generateBOM } = await import('./tools/bom.js');
    const bom = await generateBOM(diagnosis.issue_type);
    
    return {
      structuredContent: {
        diagnosis: {
          issue_type: diagnosis.issue_type,
          severity: diagnosis.severity,
          summary: diagnosis.summary,
          recommendation: diagnosis.recommendation,
          risk_level: diagnosis.risk_level,
          safety_notes: diagnosis.safety_notes.slice(0, 3) // Keep concise for model
        },
        bom: {
          parts: bom.parts.slice(0, 5),
          tools: bom.tools.slice(0, 5),
          estimated_total: bom.estimated_total
        }
      },
      content: [{
        type: 'text',
        text: `${diagnosis.summary}\n\nRecommendation: ${diagnosis.recommendation.action === 'hire' ? 'Hire a professional' : 'DIY repair possible'}\nRisk Level: ${diagnosis.risk_level}`
      }],
      _meta: {
        fullBOM: bom, // Complete BOM for component
        fullDiagnosis: diagnosis // Complete diagnosis data
      }
    };
  }
);

// ========================================
// TOOL: GENERATE PLAN
// ========================================

server.registerTool(
  'generate_plan',
  {
    title: 'Generate Repair Plan',
    description: 'Generates a step-by-step repair plan based on issue analysis',
    _meta: {
      'openai/outputTemplate': 'ui://widget/steps.html',
      'openai/toolInvocation/invoking': 'Creating repair plan...',
      'openai/toolInvocation/invoked': 'Plan ready'
    },
    inputSchema: z.object({
      issue_type: z.string().describe('Type of repair issue'),
      risk_level: z.enum(['low', 'medium', 'high', 'critical']).describe('Safety risk level')
    })
  },
  async ({ issue_type, risk_level }) => {
    const { generatePlan } = await import('./tools/plan.js');
    const { generateBOM } = await import('./tools/bom.js');
    
    const plan = await generatePlan(issue_type, risk_level);
    const bom = await generateBOM(issue_type);
    
    return {
      structuredContent: {
        plan: {
          title: plan.title,
          estimated_time: plan.estimated_time,
          difficulty: plan.difficulty,
          steps: plan.steps.map(step => ({
            step_number: step.step_number,
            title: step.title,
            description: step.description.substring(0, 200), // Truncate for model
            safety_note: step.safety_note
          }))
        },
        bom: {
          parts: bom.parts,
          tools: bom.tools
        }
      },
      content: [{
        type: 'text',
        text: `${plan.title} - ${plan.estimated_time} - Difficulty: ${plan.difficulty}/5\n\n${plan.steps.length} steps total. See the interactive plan above for details.`
      }],
      _meta: {
        fullPlan: plan,
        fullBOM: bom
      }
    };
  }
);

// ========================================
// TOOL: GENERATE BOM
// ========================================

server.registerTool(
  'generate_bom',
  {
    title: 'Generate Bill of Materials',
    description: 'Generates a bill of materials with parts, tools, and price ranges',
    _meta: {
      'openai/toolInvocation/invoking': 'Calculating materials...',
      'openai/toolInvocation/invoked': 'BOM ready'
    },
    inputSchema: z.object({
      issue_type: z.string().describe('Type of repair issue')
    })
  },
  async ({ issue_type }) => {
    const { generateBOM } = await import('./tools/bom.js');
    const bom = await generateBOM(issue_type);
    
    return {
      structuredContent: {
        parts: bom.parts,
        tools: bom.tools,
        estimated_total: bom.estimated_total
      },
      content: [{
        type: 'text',
        text: `Parts: ${bom.parts.length} items\nTools: ${bom.tools.length} items\nEstimated Total: $${bom.estimated_total.min}-$${bom.estimated_total.max}`
      }]
    };
  }
);

// ========================================
// TOOL: REQUEST QUOTES
// ========================================

server.registerTool(
  'request_quotes',
  {
    title: 'Request Contractor Quotes',
    description: 'Prepares contractor quote request (requires user confirmation)',
    _meta: {
      'openai/toolInvocation/invoking': 'Finding contractors...',
      'openai/toolInvocation/invoked': 'Quotes requested'
    },
    inputSchema: z.object({
      zip: z.string().regex(/^[0-9]{5}$/).describe('5-digit ZIP code'),
      scope: z.string().max(1000).describe('Work scope summary'),
      confirmed: z.boolean().describe('User confirmation for contractor outreach')
    })
  },
  async ({ zip, scope, confirmed }) => {
    const { requestQuotes } = await import('./tools/quotes.js');
    const quotes = await requestQuotes(zip, scope, confirmed);
    
    return {
      structuredContent: {
        contractors: quotes.contractors
      },
      content: [{
        type: 'text',
        text: `Found ${quotes.contractors.length} contractors in ${zip}. They will contact you within 24-48 hours.`
      }]
    };
  }
);

// ========================================
// TOOL: SUBMIT OUTCOME
// ========================================

server.registerTool(
  'submit_outcome',
  {
    title: 'Submit Repair Outcome',
    description: 'Submit repair outcome and feedback for continuous improvement',
    _meta: {
      'openai/toolInvocation/invoking': 'Saving feedback...',
      'openai/toolInvocation/invoked': 'Thank you for your feedback!'
    },
    inputSchema: z.object({
      diagnosis_id: z.string().describe('ID of the original diagnosis'),
      outcome: z.enum(['success', 'partial', 'failed', 'hired_pro']).describe('Repair outcome'),
      actual_time_minutes: z.number().optional().describe('Actual time spent on repair'),
      actual_cost: z.number().optional().describe('Actual cost of repair'),
      difficulty_rating: z.number().min(1).max(5).optional().describe('Difficulty rating (1-5)'),
      tips: z.string().max(1000).optional().describe('Tips for others attempting this repair'),
      would_recommend_diy: z.boolean().optional().describe('Would recommend DIY for this repair')
    })
  },
  async (input) => {
    const { submitOutcome } = await import('./tools/submit-outcome.js');
    const result = await submitOutcome(input);
    
    return {
      structuredContent: {
        saved: true,
        feedback_id: result.feedback_id
      },
      content: [{
        type: 'text',
        text: 'Thank you for your feedback! This helps us improve our recommendations.'
      }]
    };
  }
);

export default server;
