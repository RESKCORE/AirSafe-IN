# 🌬️ AirSafe India

**Real-time Air Quality Intelligence for Indian Metropolitan Regions**

A production-ready dashboard that combines live particulate readings from certified Indian monitoring stations with AI-generated health briefings and actionable insights.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![WAQI](https://img.shields.io/badge/Data-WAQI%20Geo%20Feed-10b981)

---

## 📚 Table of Contents

1. [Product Highlights](#-product-highlights)
2. [System Architecture](#-system-architecture)
3. [Tech Stack](#-tech-stack)
4. [Quick Start](#-quick-start)
5. [Environment Configuration](#-environment-configuration)
6. [Data Services](#-data-services)
7. [AI Copilot](#-ai-copilot)
8. [UI Modules](#-ui-modules)
9. [Project Structure](#-project-structure)
10. [NPM Scripts](#-npm-scripts)
11. [Deployment](#-deployment)
12. [Troubleshooting](#-troubleshooting)
13. [Contributing](#-contributing)
14. [License](#-license)
15. [Acknowledgments](#-acknowledgments)

---

## ✨ Product Highlights

- **Live WAQI Data Pipeline** – Pulls PM2.5 readings via the World Air Quality Index geo-feed (lat/lon) to guarantee India-based stations by default.
- **Multi-layer Resilience** – Automatically falls back to OpenWeather, Open-Meteo, then a curated CSV snapshot if upstream services fail.
- **AI Health Briefings** – Google Gemini 2.5-flash produces concise advisories with trend explanations and NAAQS compliance checks.
- **Executive Dashboard** – KPI cards, trendlines, and peer comparisons for Delhi, Mumbai, Bengaluru, Kolkata, and Chennai.
- **Rapid Operator Experience** – Tailwind-powered UI, keyboard-friendly header search, and “Explain” shortcuts for instant analysis.

---

## 🏗️ System Architecture

```
┌──────────────────────────┐        ┌──────────────────────────┐
│  WAQI Geo API (Primary)  │        │ OpenWeather Air Pollution │
│  (lat/lon station data)  │        │ & Open-Meteo (Fallbacks) │
└──────────────┬───────────┘        └──────────────┬───────────┘
               │                                   │
               ▼                                   ▼
        ┌────────────────┐                 ┌────────────────┐
        │  dataService   │◀────────────────│  CSV Snapshot  │
        │  (services/)   │    offline      │  (public/)     │
        └───────┬────────┘                 └────────────────┘
                │
                ▼
         ┌──────────────┐
         │   App.tsx    │  React state & memoized selectors
         └──────┬───────┘
                │
  ┌─────────────┼─────────────────────────────────────────────┐
  │             │                     │                       │
  ▼             ▼                     ▼                       ▼
KPICards   AirCharts          InlineCopilotSearch        CitiesPage
(metrics)  (visuals)          (Gemini interface)          (roll-ups)
```

---

## 🛠️ Tech Stack

| Layer | Tooling |
|-------|---------|
| SPA Framework | React 19 + TypeScript 5.8 |
| Bundler | Vite 6 |
| Styling | Tailwind CSS 3.4, tailwind-merge, clsx |
| UI Atoms | Custom components + Radix UI (Avatar, Scroll Area, Slot) |
| Data Visualization | Recharts 3.5 |
| Air Quality Data | WAQI Geo feed (primary), OpenWeather, Open-Meteo, CSV fallback |
| AI Copilot | Google Gemini (2.5-flash) via `@google/genai` |
| Markdown Rendering | `react-markdown` |

---

## ⚡ Quick Start

### Prerequisites

- Node.js **18+**
- npm (ships with Node) or Yarn
- WAQI data token (required for live metrics)
- Google Gemini API key (enables AI copilot)
- Optional: OpenWeather key for secondary live feed

### Clone & Install

```bash
git clone https://github.com/yourusername/airsafe-india.git
cd airsafe-india
npm install
```

### Configure Environment

Copy the template and populate required keys:

```bash
cp .env.example .env
```

Edit `.env` (or `.env.local` when using Vite dev server):

```env
VITE_WAQI_API_KEY=your_waqi_token_here          # Required
VITE_GEMINI_API_KEY=your_gemini_api_key_here    # Required for AI
VITE_OPENWEATHER_API_KEY=optional_secondary_key # Optional fallback
VITE_GEMINI_MODEL=gemini-2.5-flash              # Optional override
```

### Run Locally

```bash
npm run dev
# Vite prints the URL (default http://localhost:5173 or 3000)
```

### Build & Preview

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Configuration

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `VITE_WAQI_API_KEY` | ✅ | — | Auth token for World Air Quality Index geo feed |
| `VITE_GEMINI_API_KEY` | ✅ | — | Secures AI copilot requests to Google Gemini |
| `VITE_OPENWEATHER_API_KEY` | ➖ | — | Enables OpenWeather fallback when WAQI unavailable |
| `VITE_GEMINI_MODEL` | ➖ | `gemini-2.5-flash` | Adjusts model variant if needed |

Keep environment files (`.env`, `.env.local`) outside version control. For Vercel deployments, mirror the same keys in Project Settings → Environment Variables.

---

## 🌐 Data Services

### Fetch Priority

1. **WAQI Geo Feed** – `https://api.waqi.info/feed/geo:{lat};{lon}/?token=...`
2. **OpenWeather Air Pollution** – `https://api.openweathermap.org/data/2.5/air_pollution`
3. **Open-Meteo Air Quality** – `https://air-quality-api.open-meteo.com/v1/air-quality`
4. **Curated CSV Snapshot** – `public/air_quality_5_cities_3_months.csv`

```ts
const dataset = await fetchAirQualityData();
// Returns Record<CityName, CityData>
// Each CityData contains [September, October, Current Month] rows
```

### Notes

- WAQI geo queries ensure the closest certified Indian station is used for each metro.
- When only AQI is returned, values are converted to approximate PM2.5 (µg/m³) using US EPA formulas.
- Historical months (September, October) are generated from seasonal deltas to contextualize the live reading.
- Console logs trace which provider supplied data—useful for diagnostics during production incidents.

---

## 🤖 AI Copilot

- **Component**: `InlineCopilotSearch` (header search bar)
- **Model**: Gemini 2.5-flash via `@google/genai`
- **Context**: Dynamic system prompt includes:
  - Latest live reading for every tracked city
  - Indian NAAQS (PM2.5 ≤ 60 µg/m³) and WHO guidelines
  - Conversational tone and formatting rules (`Summary`, `Trend`, `Health Impact`, `Recommendations`)
- **Explain Buttons**: Charts trigger pre-built prompts such as “Explain the 3-month PM2.5 trend for Delhi.”
- **Historical Memory**: Short-term conversation history retained within the component for continuity.

---

## 🖥️ UI Modules

| Module | Description |
|--------|-------------|
| `KPICards` | Displays live PM2.5, cities over NAAQS, 3-month average, and cleanest city badges. |
| `AirCharts` | Renders trend line (with NAAQS marker) and inter-city comparison bar chart. |
| `InlineCopilotSearch` | Collapsible AI console with quick prompts, loading states, and keyboard access. |
| `CitiesPage` | Tabular comparison including risk badges and change deltas. |
| `AboutPage` | Mission statement, data provenance, and policy context. |

All UI elements are responsive, keyboard navigable, and styled with Tailwind + shadcn-inspired primitives.

---

## 📁 Project Structure

```
airsafe-india/
├─ App.tsx
├─ components/
│  ├─ AirCharts.tsx
│  ├─ KPICards.tsx
│  ├─ CitiesPage.tsx
│  ├─ InlineCopilotSearch.tsx
│  └─ ui/
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     └─ scroll-area.tsx
├─ services/
│  ├─ dataService.ts    // WAQI + fallback retrieval logic
│  └─ geminiService.ts  // Gemini API wrapper
├─ constants.ts         // System prompt builder & fallback dataset
├─ public/
│  └─ air_quality_5_cities_3_months.csv
├─ types.ts             // Shared type definitions
└─ ...                  // Tailwind, Vite, TypeScript configs
```

---

## 🧾 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Produce production bundle in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx tsc --noEmit` | Type-check project (manual invocation) |

No automated test suite ships with the template—add your preferred runner (Vitest/Jest/Cypress) as needed.

---

## ☁️ Deployment

### Vercel (Recommended)

1. Push your repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel and select the `main` branch.
3. Configure environment variables:

   | Key | Value |
   |-----|-------|
   | `VITE_WAQI_API_KEY` | `your_waqi_token` |
   | `VITE_GEMINI_API_KEY` | `your_gemini_key` |
   | `VITE_OPENWEATHER_API_KEY` | (optional fallback) |
   | `VITE_GEMINI_MODEL` | `gemini-2.5-flash` (optional) |

4. Trigger the build (Vercel detects Vite automatically).
5. Verify live data and AI responses on the deployed URL.

### Self-Hosted / Other Platforms

- Serve the static `dist/` folder via any CDN or static host.
- Proxy rules are not required; all external calls originate from the browser to public APIs.
- Remember to inject environment variables at build time.

---

## 🛠️ Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| Dashboard stuck on “Loading live air quality data…” | Missing WAQI token or failing API key | Verify `VITE_WAQI_API_KEY` and check browser console for 401/429 errors |
| Values look lower than other trackers | Fallback provider in use | Console logs indicate provider; ensure WAQI quota not exceeded |
| Gemini responses disabled | Missing or invalid Gemini API key | Confirm `VITE_GEMINI_API_KEY` and billing status in Google AI Studio |
| Deploy succeeds but live data fails | Environment variables not set in hosting platform | Add keys in hosting dashboard and redeploy |

Enable verbose logging by checking DevTools console—`dataService.ts` logs the provider and readings for every fetch cycle.

---

## 🤝 Contributing

```bash
git checkout -b feature/my-improvement
# make changes
git commit -m "feat: describe improvement"
git push origin feature/my-improvement
```

1. Fork the repository.
2. Create a feature branch (see example above).
3. Open a Pull Request with screenshots/logs where relevant.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 🙏 Acknowledgments

- [World Air Quality Index (WAQI)](https://aqicn.org/) for real-time station feeds.
- [OpenWeather](https://openweathermap.org/) and [Open-Meteo](https://open-meteo.com/) for complimentary data layers.
- [Google Gemini](https://ai.google.dev/) for conversational insights.
- [Recharts](https://recharts.org/), [Tailwind CSS](https://tailwindcss.com/), and [Lucide](https://lucide.dev/) for the front-end toolkit.

<p align="center">
  Crafted with 💚 to help Indian cities breathe easier.
</p>
