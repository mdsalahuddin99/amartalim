const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Remove SEO import
      const importRegex = /import\s+SEO\s+from\s+['"]@\/components\/shared\/seo['"];?\n?/g;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, '');
        modified = true;
      }
      
      const importRegex2 = /import\s+SEO\s+from\s+['"]\.\.\/.*?seo['"];?\n?/g;
      if (importRegex2.test(content)) {
        content = content.replace(importRegex2, '');
        modified = true;
      }

      // Remove <SEO /> component tags (including multiline)
      const seoTagRegex = /<SEO[\s\S]*?\/>/g;
      if (seoTagRegex.test(content)) {
        content = content.replace(seoTagRegex, '');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Removed SEO component from: ${fullPath}`);
      }
    }
  }
}

console.log("Removing obsolete SEO components globally...");
processDirectory(srcDir);
console.log("Done!");
