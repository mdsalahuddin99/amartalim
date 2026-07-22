const fs = require('fs');
const path = require('path');

const srcAppDir = path.join(__dirname, 'src', 'app');

function toPascalCase(str) {
  return str.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Skip if already processed or has "use client" or is the marketing home page we already did
      if (content.includes('"use client"') || content.includes("'use client'")) continue;
      if (dir.endsWith('(marketing)')) continue; // Skip the one we did manually

      // Check if it's a component we should split
      // Most of these are client pages right now
      console.log(`Processing: ${fullPath}`);

      // 1. Rename existing page.tsx to PageClient.tsx
      const clientContent = `"use client";\n\n` + content.replace(/['"]react-router-dom['"]/g, '"@/lib/navigation"');
      
      const clientFileName = 'PageClient.tsx';
      const clientFullPath = path.join(dir, clientFileName);
      fs.writeFileSync(clientFullPath, clientContent, 'utf8');

      // 2. Generate new page.tsx Server Component
      // Extract a plausible title from the directory name
      let dirName = path.basename(dir);
      if (dirName.startsWith('(') && dirName.endsWith(')')) dirName = dirName.slice(1, -1);
      if (dirName.startsWith('[')) dirName = "Detail";
      
      const pageTitle = toPascalCase(dirName) + " | Amar Talim";

      const serverContent = `import { Metadata } from "next";
import PageClient from "./PageClient";

export const metadata: Metadata = {
  title: "${pageTitle}",
};

export default function Page() {
  return <PageClient />;
}
`;
      fs.writeFileSync(fullPath, serverContent, 'utf8');
      console.log(`✅ Split ${dirName}/page.tsx into Server & Client components.`);
    }
  }
}

console.log("Starting Next.js Component Split Migration...");
processDirectory(srcAppDir);
console.log("Migration complete!");
