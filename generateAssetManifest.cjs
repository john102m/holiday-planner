// generateAssetManifest.js
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const manifest = {};

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      const relativePath = path.relative(distDir, fullPath).replace(/\\/g, '/');
      manifest[`/${relativePath}`] = `/${relativePath}`;
    }
  });
}

walk(distDir);

fs.writeFileSync(
  path.join(distDir, 'asset-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ asset-manifest.json generated.');
