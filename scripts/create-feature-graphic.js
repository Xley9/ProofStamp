const sharp = require('sharp');
const path = require('path');

const WIDTH = 1024;
const HEIGHT = 500;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C63FF"/>
      <stop offset="100%" style="stop-color:#4834d4"/>
    </linearGradient>
    <!-- Subtle circle accents -->
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.12)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.08)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="850" cy="80" r="200" fill="url(#glow1)"/>
  <circle cx="150" cy="420" r="160" fill="url(#glow2)"/>
  <circle cx="950" cy="400" r="120" fill="url(#glow2)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 55}" y1="0" x2="${i * 55}" y2="${HEIGHT}" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({length: 10}, (_, i) => `<line x1="0" y1="${i * 55}" x2="${WIDTH}" y2="${i * 55}" stroke="white" stroke-width="1"/>`).join('')}
  </g>

  <!-- Shield / App Icon (centered-left area) -->
  <g transform="translate(180, 120)">
    <!-- Shield shape -->
    <path d="M75 0 L150 30 L150 100 C150 160 75 200 75 200 C75 200 0 160 0 100 L0 30 Z"
          fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
    <!-- Checkmark inside shield -->
    <path d="M45 110 L70 135 L115 75" fill="none" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Document lines -->
    <rect x="35" y="140" width="80" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="50" y="152" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  </g>

  <!-- App Name -->
  <text x="420" y="195" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="62" fill="white" letter-spacing="-1">
    ProofStamp
  </text>

  <!-- Tagline -->
  <text x="420" y="245" font-family="Segoe UI, Arial, sans-serif" font-weight="400" font-size="24" fill="rgba(255,255,255,0.85)">
    Digital Evidence Protector
  </text>

  <!-- Divider line -->
  <rect x="420" y="270" width="60" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>

  <!-- Feature highlights -->
  <g font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">
    <!-- Row 1 -->
    <g transform="translate(420, 310)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">SHA-256 Hashing</text>
    </g>
    <g transform="translate(650, 310)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">GPS &amp; Timestamp</text>
    </g>
    <!-- Row 2 -->
    <g transform="translate(420, 348)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">100% Offline</text>
    </g>
    <g transform="translate(650, 348)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">PDF Export</text>
    </g>
    <!-- Row 3 -->
    <g transform="translate(420, 386)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">No Ads · No Tracking</text>
    </g>
    <g transform="translate(650, 386)">
      <circle cx="8" cy="-5" r="4" fill="#7cf5a0"/>
      <text x="22" y="0">Open Source</text>
    </g>
  </g>

  <!-- Bottom accent line -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="rgba(255,255,255,0.2)"/>
</svg>
`;

async function createFeatureGraphic() {
  const outputPath = path.join(__dirname, '..', 'store-assets', 'feature-graphic.png');

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Feature graphic created: ${outputPath}`);
  console.log(`Size: ${WIDTH}x${HEIGHT}px`);
}

createFeatureGraphic().catch(console.error);
