import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { sanitizeInput } from '../utils/validation.js';

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

// Safety gate: high-risk issues that force "Hire"
const HIGH_RISK_KEYWORDS = [
  'gas', 'natural gas', 'propane', 'gas line', 'gas leak',
  'electrical panel', 'breaker box', 'main panel', 'service panel',
  'roof', 'roofing', 'shingles', 'flashing', 'chimney',
  'structural', 'foundation', 'load bearing', 'beam', 'joist',
  'asbestos', 'mold', 'black mold',
  'sewer', 'main water line', 'septic'
];

export async function analyzeIssue({ photos, description }) {
  try {
    // Sanitize description
    const cleanDescription = sanitizeInput(description);
    
    logger.info('Starting issue analysis', { photoCount: photos.length });
    
    // Prepare messages for OpenAI Vision API
    const messages = [
      {
        role: 'system',
        content: `You are a home repair expert. Analyze the photos and description to:
1. Identify the exact issue
2. Assess risk level (low/medium/high/critical)
3. Determine if DIY is safe or if professional help is required
4. Provide confidence score (0-100%)
5. List key safety concerns

CRITICAL SAFETY RULES:
- Gas/electrical panel/structural/roof height issues → FORCE "Hire a Professional"
- High-risk issues → Disable all DIY options
- Be conservative: when in doubt, recommend professional help`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Description: ${cleanDescription}\n\nAnalyze these photos and provide a diagnosis.${
              photos.some(p => p.annotations && p.annotations.length > 0) 
                ? '\n\nIMPORTANT: User has marked specific problem areas:\n' + 
                  photos.map((p, idx) => 
                    p.annotations?.map(a => 
                      `Photo ${idx + 1}: ${a.label || 'Marked area'} at position (${Math.round(a.x)}, ${Math.round(a.y)})`
                    ).join('\n')
                  ).filter(Boolean).join('\n')
                : ''
            }`
          },
          ...photos.map(photo => ({
            type: 'image_url',
            image_url: {
              url: photo.buffer 
                ? `data:${photo.mimetype};base64,${photo.buffer.toString('base64')}`
                : photo.url || photo
            }
          }))
        ]
      }
    ];
    
    // Call OpenAI Vision API
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.3 // Lower temperature for more consistent diagnosis
    });
    
    const analysis = response.choices[0].message.content;
    
    // Parse analysis and apply safety gates
    const safetyGate = checkSafetyGate(cleanDescription + ' ' + analysis);
    
    // Extract structured data from analysis
    const diagnosis = parseAnalysis(analysis, safetyGate);
    
    logger.info('Analysis complete', {
      issueType: diagnosis.issue_type,
      recommendation: diagnosis.recommendation,
      riskLevel: diagnosis.risk_level
    });
    
    return {
      success: true,
      diagnosis,
      raw_analysis: analysis
    };
    
  } catch (error) {
    logger.error('Analysis failed', error);
    throw new Error(`Vision analysis failed: ${error.message}`);
  }
}

// Safety gate check
function checkSafetyGate(text) {
  const lowerText = text.toLowerCase();
  
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        triggered: true,
        reason: `Detected high-risk category: ${keyword}`,
        force_hire: true
      };
    }
  }
  
  return { triggered: false };
}

// Parse GPT response into structured diagnosis
function parseAnalysis(text, safetyGate) {
  // Extract issue type (first sentence usually contains it)
  const lines = text.split('\n').filter(l => l.trim());
  const issueType = lines[0]?.substring(0, 100) || 'Unknown issue';
  
  // Determine risk level from keywords
  let riskLevel = 'low';
  const lowerText = text.toLowerCase();
  
  if (safetyGate.triggered || lowerText.includes('critical') || lowerText.includes('dangerous')) {
    riskLevel = 'critical';
  } else if (lowerText.includes('high risk') || lowerText.includes('professional required')) {
    riskLevel = 'high';
  } else if (lowerText.includes('medium risk') || lowerText.includes('caution')) {
    riskLevel = 'medium';
  }
  
  // Determine recommendation
  const recommendation = (safetyGate.triggered || riskLevel === 'critical' || riskLevel === 'high')
    ? 'hire'
    : 'diy';
  
  // Extract confidence (look for percentage)
  const confidenceMatch = text.match(/(\d{1,3})%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
  
  // Extract safety concerns
  const safetyConcerns = [];
  if (safetyGate.triggered) {
    safetyConcerns.push(safetyGate.reason);
  }
  
  // Look for safety-related sentences
  const safetyLines = lines.filter(line => 
    line.toLowerCase().includes('safety') ||
    line.toLowerCase().includes('danger') ||
    line.toLowerCase().includes('risk') ||
    line.toLowerCase().includes('warning')
  );
  
  safetyConcerns.push(...safetyLines.slice(0, 3));
  
  return {
    issue_type: issueType,
    risk_level: riskLevel,
    recommendation,
    confidence,
    safety_concerns: safetyConcerns,
    summary: text.substring(0, 300),
    diy_disabled: safetyGate.triggered || riskLevel === 'critical',
    ...(safetyGate.triggered && { safety_gate: safetyGate.reason })
  };
}
