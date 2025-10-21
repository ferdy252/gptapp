import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIST_DIR = join(__dirname, '../../../client/dist');

export const RESOURCE_URIS = {
  diagnosis: 'ui://home-repair/diagnosis/v1.html',
  steps: 'ui://home-repair/steps/v1.html'
};

const RESOURCE_DEFINITIONS = [
  {
    key: 'diagnosis',
    uri: RESOURCE_URIS.diagnosis,
    bundle: 'diagnosis-widget.js',
    rootId: 'diagnosis-root'
  },
  {
    key: 'steps',
    uri: RESOURCE_URIS.steps,
    bundle: 'steps-widget.js',
    rootId: 'steps-root'
  }
];

function loadBundle(filename) {
  try {
    return readFileSync(join(DIST_DIR, filename), 'utf8');
  } catch (error) {
    throw new Error(`Missing MCP UI bundle: ${filename}. Run "npm run build:mcp" inside client/.\n${error.message}`);
  }
}

function loadStyles() {
  try {
    return readFileSync(join(DIST_DIR, 'styles.css'), 'utf8');
  } catch {
    return '';
  }
}

export function registerResources(server) {
  const styles = loadStyles();

  RESOURCE_DEFINITIONS.forEach(({ key, uri, bundle, rootId }) => {
    const script = loadBundle(bundle);

    server.registerResource(
      key,
      uri,
      {},
      async () => ({
        contents: [
          {
            uri,
            mimeType: 'text/html+skybridge',
            text: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${styles ? `<style>${styles}</style>` : ''}
  </head>
  <body>
    <div id="${rootId}"></div>
    <script type="module">${script}</script>
  </body>
</html>`
          }
        ]
      })
    );
  });
}

export const resourceManifest = RESOURCE_DEFINITIONS.map(({ uri }) => ({
  uri,
  mimeType: 'text/html+skybridge'
}));
