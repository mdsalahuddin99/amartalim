import fs from 'fs';
import path from 'path';

const dirs = [
  'apps/web/src/components/ui',
  'apps/web/src/contexts',
  'apps/admin/src/components/ui',
  'apps/admin/src/contexts'
];

let count = 0;

for (const dir of dirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(fullPath, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Check if it already has "use client"
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
          content = '"use client";\n\n' + content;
          fs.writeFileSync(filePath, content);
          console.log('Added use client to', file);
          count++;
        }
      }
    }
  }
}

console.log(`Finished. Added "use client" to ${count} files.`);
