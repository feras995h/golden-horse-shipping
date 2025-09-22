const fs = require('fs');
const path = require('path');

console.log('Running post-build tasks...');

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy package.json to dist directory
const packageJson = require('../package.json');
const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  author: packageJson.author,
  license: packageJson.license,
  dependencies: packageJson.dependencies,
  scripts: {
    start: 'node main.js'
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(distPackageJson, null, 2)
);

console.log('Build completed successfully!');