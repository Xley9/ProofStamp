# ProofStamp – Digital Evidence Protector

ProofStamp is a privacy-first Progressive Web App (PWA) that lets you capture, hash, and securely store digital evidence — entirely offline and on your device.

Take a photo or upload a file, and ProofStamp automatically generates a **SHA-256 fingerprint**, records the **timestamp** and **GPS location**, and stores everything locally in your browser. Later, you can verify that a file hasn't been tampered with, or export a professional **PDF certificate** with a QR code.

## Features

- **Capture & Upload** — Take photos with your camera or upload any file (images, PDFs, documents)
- **SHA-256 Hashing** — Every file gets a unique cryptographic fingerprint via the Web Crypto API
- **Combined Hash** — A tamper-proof combined hash is generated from all file hashes + timestamp + GPS + random salt
- **GPS Location** — Optionally record the exact coordinates where the evidence was captured
- **Verification** — Re-upload a file to verify its hash matches the stored proof
- **PDF Export** — Generate a professional PDF with photo, metadata, all hashes, and a QR code
- **Categories** — Organize proofs: Apartment, Vehicle, Purchase, Communication, Contract, Workplace, Other
- **Search & Filter** — Find proofs by title, description, or category
- **Gallery & List View** — Switch between visual gallery and compact list layout
- **Dark / Light / System Theme** — Automatic or manual theme switching
- **5 Languages** — German, English, Turkish, Spanish, French
- **Offline-Ready** — Full PWA with Service Worker, works without internet
- **Privacy-First** — Zero data leaves your device. No server, no cloud, no tracking
- **Export / Import** — JSON backup and restore of all your proofs
- **IndexedDB Storage** — Handles large files that wouldn't fit in localStorage

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Storage | IndexedDB |
| Hashing | Web Crypto API (`crypto.subtle.digest`) |
| Camera | MediaDevices API / `<input capture>` |
| GPS | Geolocation API |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) (CDN) |
| QR Code | [qrcode](https://github.com/soldair/node-qrcode) (CDN) |
| Offline | Service Worker (Cache-First) |
| PWA | Web App Manifest |

No build tools, no npm, no bundler — just open `index.html`.

## Getting Started

### Option 1: Direct file
Open `index.html` in your browser. Most features work, but GPS requires a secure context.

### Option 2: Local server (recommended)
```bash
npx serve .
```
Then open `http://localhost:3000`. This enables GPS, Service Worker, and PWA install.

## Usage

1. **Onboarding** — First launch shows a 3-step introduction
2. **Create a proof** — Tap the `+` button, add files/photos, title, category, and optionally GPS
3. **View details** — Tap any proof to see full metadata, file hashes, and combined hash
4. **Export PDF** — Generate a signed PDF certificate with QR code from any proof
5. **Verify** — Tap the `✓` button, select a stored proof, upload the same file — hashes are compared
6. **Settings** — Switch theme, language, export/import data, or delete all

## Data Model

Each proof contains:

```
{
  id, title, description, category,
  files: [{ name, type, dataUrl, hash }],
  timestamp,
  location: { lat, lng } | null,
  combinedHash,    // SHA-256 of: all file hashes + timestamp + location + salt
  salt,            // Random value for extra security
  createdAt
}
```

The **combined hash** ensures that even if someone knows the file and timestamp, they cannot predict the hash without the random salt.

## Project Structure

```
ProofStamp/
├── index.html          # Single-page app
├── css/
│   └── style.css       # Dark/Light theme, responsive
├── js/
│   ├── app.js          # Core logic (IIFE pattern)
│   ├── i18n.js         # Translations (DE, EN, TR, ES, FR)
│   └── categories.js   # Categories & constants
├── img/
│   ├── favicon.svg
│   ├── icon-192.svg
│   └── icon-512.svg
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
└── LICENSE             # MIT
```

## License

MIT
