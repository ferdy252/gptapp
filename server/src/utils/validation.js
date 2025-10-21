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
