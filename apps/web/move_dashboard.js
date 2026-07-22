const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'src', 'app', '(learn)');
const dest = path.join(__dirname, 'src', 'app', '(dashboard)');
fs.mkdirSync(dest, { recursive: true });
const folders = ['dashboard', 'my-courses', 'certificates', 'orders', 'leaderboard', 'wishlist'];
folders.forEach(f => {
  const sourceFolder = path.join(src, f);
  const destFolder = path.join(dest, f);
  if (fs.existsSync(sourceFolder)) {
    fs.renameSync(sourceFolder, destFolder);
    console.log(`Moved ${f}`);
  } else {
    console.log(`${f} not found`);
  }
});
console.log('All done');
