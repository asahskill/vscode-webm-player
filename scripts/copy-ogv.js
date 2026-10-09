'use strict';
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'node_modules', 'ogv', 'dist');
const target = path.join(__dirname, '..', 'vendor');
if (!fs.existsSync(source)) throw new Error(`Missing ogv.js distribution: ${source}`);
fs.mkdirSync(target, { recursive: true });
for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  if (entry.isFile()) fs.copyFileSync(path.join(source, entry.name), path.join(target, entry.name));
}
console.log(`Copied ogv.js assets to ${target}`);
