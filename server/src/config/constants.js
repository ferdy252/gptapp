// Application constants

export const SAFETY_KEYWORDS = {
  GAS: ['gas', 'natural gas', 'propane', 'gas line', 'gas leak', 'gas smell'],
  ELECTRICAL: ['electrical panel', 'breaker box', 'main panel', 'service panel', 'live wire', 'electrical shock'],
  STRUCTURAL: ['structural', 'foundation', 'load bearing', 'beam', 'joist', 'support beam', 'foundation crack'],
  ROOF: ['roof', 'roofing', 'shingles', 'flashing', 'chimney', 'roof height'],
  HAZMAT: ['asbestos', 'mold', 'black mold', 'toxic', 'hazardous material'],
  PLUMBING_MAJOR: ['sewer', 'main water line', 'septic', 'sewer backup', 'main drain']
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
};

export const DATA_RETENTION = {
  PHOTOS: 0, // Immediate deletion (in-memory only)
  DIAGNOSES: 30, // Days
  QUOTE_REQUESTS: 90, // Days
  LOGS: 7 // Days
};
