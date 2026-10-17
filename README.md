# LUCID — AI Financial Scenario Lab

LUCID is a personal fintech prototype that helps users explore how financial decisions may affect their future cash flow. It combines deterministic scenario calculations with an AI copilot that explains the results.

> **Portfolio project / demo only.** LUCID is not a bank, does not connect to bank accounts, and does not provide regulated financial advice. Use fictional data only.

## Features

- Interactive financial scenario dashboard
- Comparison of conservative, expected, and optimistic projections
- Cash-flow and balance analysis
- French-language AI copilot grounded in the application's calculated scenario data
- Deterministic demo fallback when a Gemini API key is not configured
- Responsive React interface

## Tech stack

- React 19 and TypeScript
- Vite
- Express
- Google GenAI SDK (Gemini, optional API key)
- Tailwind CSS
- Lucide React and Motion

## Run locally

Requirements: Node.js 22 or newer and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

The app can run in demo mode without a Gemini API key. To enable Gemini responses, set `GEMINI_API_KEY` in your local `.env` file. **Never commit your real `.env` file or expose API keys in client-side code.**

## Production build

```bash
npm install
npm run build
npm start
```

The Express server serves the Vite build from `dist` when `NODE_ENV=production` and listens on the port provided by the hosting platform.

## Deployment

This repository includes a Dockerfile for container-based hosting such as Google Cloud Run. Configure `GEMINI_API_KEY` as a server-side secret in the hosting provider if you want to enable Gemini. Do not put secrets in source control.

## Screenshots

Add screenshots of the dashboard, scenario comparison, and copilot here when ready.

## Project context

Designed and built as a personal UX/UI and AI product-design project. Financial figures are illustrative and should not be treated as financial recommendations.
