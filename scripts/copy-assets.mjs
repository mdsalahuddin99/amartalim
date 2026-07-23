import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appName = process.argv[2];
if (!appName) {
  console.error("Error: Please provide an app name (e.g., 'web' or 'admin')");
  process.exit(1);
}

const basePath = path.join(__dirname, '..', 'apps', appName);
const standalonePath = path.join(basePath, '.next', 'standalone', 'apps', appName);

// Copy public folder
const publicSrc = path.join(basePath, 'public');
const publicDest = path.join(standalonePath, 'public');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log(`Copied public folder for ${appName}`);
}

// Copy .next/static folder
const staticSrc = path.join(basePath, '.next', 'static');
const staticDest = path.join(standalonePath, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log(`Copied .next/static folder for ${appName}`);
}

console.log(`Successfully copied standalone static assets for ${appName}`);
