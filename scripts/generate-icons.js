const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svgInput = path.resolve(__dirname, "..", "img", "icon-512.svg");
const outDir = path.resolve(__dirname, "..", "store-assets");
const androidRes = path.resolve(__dirname, "..", "android", "app", "src", "main", "res");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// SVG source
const svg = fs.readFileSync(svgInput);

async function generate() {
  // 1. Play Store icon: 512x512 PNG (no alpha)
  await sharp(svg)
    .resize(512, 512)
    .flatten({ background: "#4834d4" })
    .png()
    .toFile(path.join(outDir, "icon-512.png"));
  console.log("Created: store-assets/icon-512.png (512x512)");

  // 2. Android adaptive icon foreground (432x432 with padding for safe zone)
  // The foreground needs to be 108dp = 432px at xxxhdpi, with content in center 66dp = 264px
  const foregroundSizes = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
  };

  for (const [folder, size] of Object.entries(foregroundSizes)) {
    const dir = path.join(androidRes, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Foreground with padding (icon content is ~66% of total)
    const iconSize = Math.round(size * 0.6);
    const padding = Math.round((size - iconSize) / 2);

    const resizedIcon = await sharp(svg)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: resizedIcon, left: padding, top: padding }])
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    // Legacy launcher icon (non-adaptive)
    const legacySize = Math.round(size * 48 / 108);
    await sharp(svg)
      .resize(legacySize, legacySize)
      .png()
      .toFile(path.join(dir, "ic_launcher.png"));

    await sharp(svg)
      .resize(legacySize, legacySize)
      .png()
      .toFile(path.join(dir, "ic_launcher_round.png"));

    console.log(`Created: ${folder} icons (${size}px foreground, ${legacySize}px legacy)`);
  }

  console.log("\nAll icons generated!");
}

generate().catch(console.error);
