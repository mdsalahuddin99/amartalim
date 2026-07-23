import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

console.log('Running build for web...');
try {
  execSync('npm run build -w web', { cwd: rootDir, stdio: 'inherit' });
} catch (e) {
  console.log('Build failed:', e.message);
}

console.log('\nChecking for server.js inside .next/standalone...');
function findServerJs(dir, relativePath = '') {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(relativePath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findServerJs(fullPath, relPath);
    } else if (file === 'server.js') {
      console.log(`Found: ${relPath}`);
    }
  }
}

const standalonePath = path.join(rootDir, 'apps', 'web', '.next', 'standalone');
findServerJs(standalonePath);
