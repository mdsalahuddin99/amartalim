const fs = require('fs');
const path = require('path');

const storesDir = path.join(__dirname, 'src', 'lib', 'stores');
const files = fs.readdirSync(storesDir);

for (const file of files) {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const fullPath = path.join(storesDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes('"use client"')) {
      content = '"use client";\n' + content;
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Added "use client" to ${file}`);
    }
  }
}

// Also let's fix the server component src/app/(marketing)/page.tsx
const marketingPagePath = path.join(__dirname, 'src', 'app', '(marketing)', 'page.tsx');
if (fs.existsSync(marketingPagePath)) {
  let content = fs.readFileSync(marketingPagePath, 'utf8');
  // Replace the import and call of blogStore with direct seed data usage
  content = content.replace(
    'import { blogStore } from "@/lib/stores/blog-store";',
    'import { blogPosts } from "@/lib/seed/blog-data";'
  );
  content = content.replace(/blogStore\.getPublished\(\)/g, 'blogPosts.filter(p => p.status !== "draft")'); // Or just blogPosts for mock
  fs.writeFileSync(marketingPagePath, content, 'utf8');
  console.log("Fixed src/app/(marketing)/page.tsx to avoid server-side store execution.");
}

console.log("Stores fixed!");
