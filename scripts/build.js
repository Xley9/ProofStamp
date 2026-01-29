const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..");
const dest = path.resolve(__dirname, "..", "www");

const toCopy = [
  "index.html",
  "manifest.json",
  "sw.js",
  "css/style.css",
  "js/app.js",
  "js/i18n.js",
  "js/categories.js",
  "img/favicon.svg",
  "img/icon-192.svg",
  "img/icon-512.svg"
];

for (const file of toCopy) {
  const srcFile = path.join(src, file);
  const destFile = path.join(dest, file);
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcFile, destFile);
}

console.log("Build complete: files copied to www/");
