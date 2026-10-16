# METHORE Standalone UI Handoff

This directory is the standalone Frontend-Only UI Handoff package for the **METHORE Offline LoRa Mesh Emergency Communication System**.

## Highlights
- **Zero Backend Dependency in Mock Mode**: Runs out of the box with `npm run dev`. Pre-seeded with realistic demo data in `localStorage`.
- **Instant Backend Toggle**: Change `VITE_USE_MOCK=false` in `.env` to connect directly to the Express/SQLite REST API.
- **Apple / DEVit Minimalist Design System**: Slate-50 canvas, rounded-2xl/3xl surfaces, zero visual clutter.
- **Comprehensive Integration Guide**: See `BACKEND_INTEGRATION_GUIDE.md` for screen-to-endpoint mappings, expected JSON payloads, and backend business logic checklists.

## Getting Started
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
