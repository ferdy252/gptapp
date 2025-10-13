// Simple logger with PII redaction
export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...redactSensitive(meta)
    }));
  },
  
  error: (message, error = null) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    }));
  },
  
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...redactSensitive(meta)
    }));
  }
};

// Redact PII from logs
function redactSensitive(obj) {
  const sensitiveKeys = ['photos', 'photo', 'image', 'buffer', 'email', 'phone', 'address', 'zip'];
  const redacted = { ...obj };
  
  for (const key of sensitiveKeys) {
    if (key in redacted) {
      if (Array.isArray(redacted[key])) {
        redacted[key] = `[REDACTED: ${redacted[key].length} items]`;
      } else {
        redacted[key] = '[REDACTED]';
      }
    }
  }
  
  return redacted;
}
