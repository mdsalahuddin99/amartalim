const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/web/src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@/lib/seed/mock-data')) {
    content = content.replace(/@\/lib\/seed\/mock-data/g, '@/types/course');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});
