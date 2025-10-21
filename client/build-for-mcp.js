#!/usr/bin/env node

/**
 * Build script for MCP components
 * Bundles React components into single JS files that can be embedded in MCP server
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');

// Ensure dist directory exists
mkdirSync(distDir, { recursive: true });

// Bundle MCP widget wrappers
const components = [
  {
    name: 'DiagnosisWidget',
    entry: 'src/mcp-wrappers/DiagnosisWidget.jsx',
    output: 'dist/diagnosis-widget.js'
  },
  {
    name: 'StepsWidget',
    entry: 'src/mcp-wrappers/StepsWidget.jsx',
    output: 'dist/steps-widget.js'
  }
];

console.log('🔨 Building MCP components...\n');

async function buildComponent(component) {
  try {
    const result = await esbuild.build({
      entryPoints: [component.entry],
      bundle: true,
      format: 'esm',
      outfile: component.output,
      jsx: 'automatic',
      minify: true,
      external: [], // Bundle everything
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx'
      },
      logLevel: 'info'
    });
    
    console.log(`✅ ${component.name} → ${component.output}`);
    return true;
  } catch (error) {
    console.error(`❌ Error building ${component.name}:`, error);
    return false;
  }
}

// Build all components
Promise.all(components.map(buildComponent))
  .then(results => {
    const success = results.every(r => r);
    if (success) {
      console.log('\n✅ All components built successfully!');
      
      // Copy CSS
      try {
        const css = readFileSync('src/index.css', 'utf8');
        writeFileSync('dist/styles.css', css);
        console.log('✅ CSS copied to dist/styles.css');
      } catch (err) {
        console.warn('⚠️  Could not copy CSS:', err.message);
      }
      
      process.exit(0);
    } else {
      console.error('\n❌ Some components failed to build');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
