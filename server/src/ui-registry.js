/**
 * UI Component Registry
 * Loads and serves bundled React components for MCP
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientDistPath = join(__dirname, '../../client/dist');

// Load bundled components
const widgets = {
  diagnosis: {
    js: null,
    css: null,
    uri: 'ui://widget/diagnosis.html'
  },
  steps: {
    js: null,
    css: null,
    uri: 'ui://widget/steps.html'
  }
};

// Load files
try {
  widgets.diagnosis.js = readFileSync(join(clientDistPath, 'diagnosis-widget.js'), 'utf8');
  widgets.steps.js = readFileSync(join(clientDistPath, 'steps-widget.js'), 'utf8');
  
  try {
    const css = readFileSync(join(clientDistPath, 'styles.css'), 'utf8');
    widgets.diagnosis.css = css;
    widgets.steps.css = css;
  } catch {
    console.warn('⚠️  No CSS file found, using inline styles');
  }
  
  console.log('✅ UI components loaded successfully');
} catch (error) {
  console.error('❌ Error loading UI components:', error.message);
  console.error('   Run: cd client && npm run build:mcp');
}

/**
 * Generate HTML template for a widget
 */
function generateTemplate(widget, rootId) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${widget.css ? `<style>${widget.css}</style>` : ''}
</head>
<body>
  <div id="${rootId}"></div>
  <script type="module">${widget.js}</script>
</body>
</html>
  `.trim();
}

/**
 * Get widget HTML
 */
export function getWidget(name) {
  const widget = widgets[name];
  if (!widget || !widget.js) {
    throw new Error(`Widget ${name} not found`);
  }
  
  const rootId = `${name}-root`;
  return {
    uri: widget.uri,
    mimeType: 'text/html+skybridge',
    html: generateTemplate(widget, rootId)
  };
}

/**
 * Get all registered widgets
 */
export function getAllWidgets() {
  return Object.keys(widgets).filter(name => widgets[name].js);
}

export default {
  getWidget,
  getAllWidgets,
  widgets
};
