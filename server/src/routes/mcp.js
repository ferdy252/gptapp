import express from 'express';
import multer from 'multer';
import { analyzeIssue } from '../tools/analyze.js';
import { generatePlan } from '../tools/plan.js';
import { generateBOM } from '../tools/bom.js';
import { requestQuotes } from '../tools/quotes.js';
import { submitOutcome } from '../tools/submit-outcome.js';
import { validateToolInput } from '../utils/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for photo uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Max 5 photos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP allowed.'));
    }
  }
});

// MCP tool manifest
router.get('/manifest', (req, res) => {
  res.json({
    name: 'Home Repair Diagnosis',
    version: '1.0.0',
    description: 'Analyzes home repair issues and provides DIY vs hire recommendations',
    tools: [
      {
        name: 'analyze_issue',
        description: 'Analyzes photos and description to diagnose a home repair issue',
        inputSchema: {
          type: 'object',
          properties: {
            photos: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 5,
              description: 'Base64-encoded photos of the issue'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Short description of the problem'
            }
          },
          required: ['photos', 'description']
        }
      },
      {
        name: 'generate_plan',
        description: 'Generates a step-by-step repair plan based on issue analysis',
        inputSchema: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              description: 'Type of repair issue'
            },
            risk_level: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Safety risk level'
            }
          },
          required: ['issue_type', 'risk_level']
        }
      },
      {
        name: 'generate_bom',
        description: 'Generates a bill of materials with parts, tools, and price ranges',
        inputSchema: {
          type: 'object',
          properties: {
            issue_type: {
              type: 'string',
              description: 'Type of repair issue'
            }
          },
          required: ['issue_type']
        }
      },
      {
        name: 'request_quotes',
        description: 'Prepares contractor quote request (requires user confirmation)',
        inputSchema: {
          type: 'object',
          properties: {
            zip: {
              type: 'string',
              pattern: '^[0-9]{5}$',
              description: '5-digit ZIP code'
            },
            scope: {
              type: 'string',
              maxLength: 1000,
              description: 'Work scope summary'
            },
            confirmed: {
              type: 'boolean',
              description: 'User confirmation for contractor outreach'
            }
          },
          required: ['zip', 'scope', 'confirmed']
        }
      },
      {
        name: 'submit_outcome',
        description: 'Submit repair outcome and feedback for continuous improvement',
        inputSchema: {
          type: 'object',
          properties: {
            diagnosis_id: {
              type: 'string',
              description: 'ID of the original diagnosis'
            },
            outcome: {
              type: 'string',
              enum: ['success', 'partial', 'failed', 'hired_pro'],
              description: 'Repair outcome'
            },
            actual_time_minutes: {
              type: 'number',
              description: 'Actual time spent on repair'
            },
            actual_cost: {
              type: 'number',
              description: 'Actual cost of repair'
            },
            difficulty_rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Difficulty rating (1-5)'
            },
            tips: {
              type: 'string',
              maxLength: 1000,
              description: 'Tips for others attempting this repair'
            },
            would_recommend_diy: {
              type: 'boolean',
              description: 'Would recommend DIY for this repair'
            }
          },
          required: ['diagnosis_id', 'outcome']
        }
      }
    ]
  });
});

// Tool execution endpoint
router.post('/execute', upload.array('photos', 5), async (req, res) => {
  try {
    const { tool, input } = req.body;
    
    logger.info(`Executing tool: ${tool}`);
    
    // Parse input if it's a string
    const parsedInput = typeof input === 'string' ? JSON.parse(input) : input;
    
    // Add uploaded files to input if present
    if (req.files && req.files.length > 0) {
      parsedInput.photos = req.files.map(file => ({
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size
      }));
    }
    
    // Validate input
    const validation = validateToolInput(tool, parsedInput);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    // Execute tool
    let result;
    switch (tool) {
      case 'analyze_issue':
        result = await analyzeIssue(parsedInput);
        break;
      case 'generate_plan':
        result = await generatePlan(parsedInput);
        break;
      case 'generate_bom':
        result = await generateBOM(parsedInput);
        break;
      case 'request_quotes':
        result = await requestQuotes(parsedInput);
        break;
      case 'submit_outcome':
        result = await submitOutcome(parsedInput);
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
    
    logger.info(`Tool ${tool} executed successfully`);
    res.json(result);
    
  } catch (error) {
    logger.error(`Tool execution error: ${error.message}`);
    res.status(500).json({
      error: 'Tool execution failed',
      message: process.env.NODE_ENV === 'production' ? 'Internal error' : error.message
    });
  }
});

export default router;
