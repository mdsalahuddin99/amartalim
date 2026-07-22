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
      
      const regex = /from\s+['"]react-router-dom['"]/g;
      if (regex.test(content)) {
        console.log(`Fixing imports in: ${fullPath}`);
        content = content.replace(regex, 'from "@/lib/navigation"');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

console.log("Fixing react-router-dom imports globally...");
processDirectory(srcDir);

console.log("Removing obsolete Vite files...");
const obsoleteFiles = [
  path.join(srcDir, 'main.tsx'),
  path.join(srcDir, 'vite-env.d.ts'),
  path.join(srcDir, 'components', 'shared', 'seo.tsx')
];
for (const file of obsoleteFiles) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Deleted: ${file}`);
  }
}

console.log("Done!");
