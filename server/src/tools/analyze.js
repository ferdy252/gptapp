import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { sanitizeInput } from '../utils/validation.js';

let openai = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];
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
    const cleanDescription = sanitizeInput(description);
    const normalizedPhotos = (photos || []).map(normalizePhoto);

    logger.info('Starting issue analysis', { photoCount: normalizedPhotos.length });

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
      buildUserMessage(cleanDescription, normalizedPhotos)
    ];

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.3
    });

    const analysis = response.choices[0].message.content;
    const safetyGate = checkSafetyGate(`${cleanDescription} ${analysis}`);
    const diagnosis = parseAnalysis(analysis, safetyGate);

    logger.info('Analysis complete', {
      issueType: diagnosis.issue_type,
      recommendation: diagnosis.recommendation,
      riskLevel: diagnosis.risk_level
    });

    return {
      diagnosis,
      raw_analysis: analysis,
      photos: normalizedPhotos
    };
  } catch (error) {
    logger.error('Analysis failed', error);
    throw new Error(`Vision analysis failed: ${error.message}`);
  }
}

function normalizePhoto(photo, index) {
  if (typeof photo === 'string') {
    return dataStringToPhoto({ data: photo }, index);
  }

  if (photo && typeof photo === 'object' && typeof photo.data === 'string') {
    return dataStringToPhoto(photo, index);
  }

  throw new Error(`Invalid photo payload at index ${index}`);
}

function dataStringToPhoto(photo, index) {
  const { data, mimeType = 'image/jpeg', annotations = [] } = photo;
  const trimmed = data.trim();

  let detectedMime = mimeType;
  let base64Payload = trimmed;

  if (trimmed.startsWith('data:')) {
    const [header, payload] = trimmed.split(',', 2);
    if (!payload) {
      throw new Error(`Invalid data URI at index ${index}`);
    }
    base64Payload = payload;
    const mimeMatch = header.match(/^data:(.*?);base64$/i);
    if (mimeMatch?.[1]) {
      detectedMime = mimeMatch[1];
    }
  }

  if (!ALLOWED_MIMETYPES.includes(detectedMime)) {
    throw new Error(`Unsupported image mime type: ${detectedMime}`);
  }

  return {
    buffer: Buffer.from(base64Payload, 'base64'),
    mimetype: detectedMime,
    annotations: annotations || []
  };
}

function buildUserMessage(cleanDescription, photos) {
  const annotationLines = photos
    .map((photo, idx) =>
      photo.annotations?.map(a =>
        `Photo ${idx + 1}: ${a.label || 'Marked area'} at position (${Math.round(a.x)}, ${Math.round(a.y)})`
      )?.join('\n')
    )
    .filter(Boolean)
    .join('\n');

  const textContent = `Description: ${cleanDescription}\n\nAnalyze these photos and provide a diagnosis.${
    annotationLines ? `\n\nIMPORTANT: User has marked specific problem areas:\n${annotationLines}` : ''
  }`;

  return {
    role: 'user',
    content: [
      {
        type: 'text',
        text: textContent
      },
      ...photos.map(photo => ({
        type: 'image_url',
        image_url: {
          url: `data:${photo.mimetype};base64,${photo.buffer.toString('base64')}`
        }
      }))
    ]
  };
}

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

function parseAnalysis(text, safetyGate) {
  const lines = text.split('\n').filter(l => l.trim());
  const issueType = lines[0]?.substring(0, 100) || 'Unknown issue';

  let riskLevel = 'low';
  const lowerText = text.toLowerCase();

  if (safetyGate.triggered || lowerText.includes('critical') || lowerText.includes('dangerous')) {
    riskLevel = 'critical';
  } else if (lowerText.includes('high risk') || lowerText.includes('professional required')) {
    riskLevel = 'high';
  } else if (lowerText.includes('medium risk') || lowerText.includes('caution')) {
    riskLevel = 'medium';
  }

  const recommendation = safetyGate.triggered || riskLevel === 'critical' || riskLevel === 'high' ? 'hire' : 'diy';

  const confidenceMatch = text.match(/(\d{1,3})%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 75;

  const safetyConcerns = [];
  if (safetyGate.triggered) {
    safetyConcerns.push(safetyGate.reason);
  }

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
