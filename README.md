# 🌬️ AirSafe India

**Real-time Air Quality Intelligence Dashboard for Indian Metropolitan Cities**

A modern, AI-powered dashboard that provides live PM2.5 monitoring, trend analytics, and personalized health advisories for India's major metros.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Components](#-components)
- [Configuration](#-configuration)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔴 Live Air Quality Monitoring
- Real-time PM2.5 data for 5 major Indian cities:
  - **Delhi** | **Mumbai** | **Bengaluru** | **Kolkata** | **Chennai**
- Automatic data refresh with visual indicators
- Dual API fallback system (OpenWeather → Open-Meteo)

### 📊 Interactive Dashboard
- **KPI Cards**: Current PM2.5, Cities Above Limit, Seasonal Average, Cleanest Air
- **3-Month Trend Chart**: Track seasonal pollution patterns
- **City Comparison Chart**: Compare PM2.5 levels across metros
- **Monthly Exposure Outlook**: Visual progress bars for each month

### 🤖 AI-Powered Copilot
- Integrated conversational AI assistant (powered by Google Gemini)
- Context-aware responses based on selected city and current data
- Quick suggestion buttons for common queries
- "Explain" buttons on charts for instant AI analysis
- Markdown-formatted responses with health recommendations

### 🎨 Modern UI/UX
- Clean, responsive design with Tailwind CSS
- Fixed sidebar navigation
- Mobile-friendly layout
- Emerald color theme for environmental focus
- Smooth animations and transitions

### 📍 Multi-City Support
- Switch between cities instantly
- Per-city trend analysis
- Comparative analytics across all metros

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18 with TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **AI** | Google Gemini API (2.5-flash) |
| **Air Quality APIs** | OpenWeather, Open-Meteo |
| **Markdown** | react-markdown |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (for AI copilot)
- OpenWeather API key (optional, has fallback)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/airsafe-india.git
   cd airsafe-india
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
airsafe-india/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── scroll-area.tsx
│   ├── AboutPage.tsx          # About/Mission page
│   ├── AirCharts.tsx          # Line & Bar charts with Explain buttons
│   ├── ChatInterface.tsx      # Legacy chat component
│   ├── CitiesPage.tsx         # City comparison view
│   ├── Footer.tsx             # Footer component
│   ├── InlineCopilotSearch.tsx # AI copilot search bar
│   └── KPICards.tsx           # Key metrics display cards
├── lib/
│   └── utils.ts               # Utility functions (cn for classnames)
├── public/
│   └── air_quality_5_cities_3_months.csv  # Fallback historical data
├── services/
│   ├── dataService.ts         # Air quality data fetching
│   └── geminiService.ts       # Google Gemini AI integration
├── App.tsx                    # Main application component
├── constants.ts               # App constants & system instructions
├── index.css                  # Global styles
├── index.html                 # HTML entry point
├── index.tsx                  # React entry point
├── types.ts                   # TypeScript type definitions
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies & scripts
```

---

## 🌐 API Integration

### Air Quality Data

The app uses a **dual-API fallback system** for maximum reliability:

#### Primary: OpenWeather Air Pollution API
```typescript
https://api.openweathermap.org/data/2.5/air_pollution
?lat={latitude}&lon={longitude}&appid={API_KEY}
```

#### Fallback: Open-Meteo Air Quality API (Free, No Key Required)
```typescript
https://air-quality-api.open-meteo.com/v1/air-quality
?latitude={lat}&longitude={lon}&hourly=pm2_5,pm10
```

#### City Coordinates
| City | Latitude | Longitude |
|------|----------|-----------|
| Delhi | 28.6139 | 77.2090 |
| Mumbai | 19.0760 | 72.8777 |
| Bengaluru | 12.9716 | 77.5946 |
| Kolkata | 22.5726 | 88.3639 |
| Chennai | 13.0827 | 80.2707 |

### AI Copilot

Powered by **Google Gemini 2.5-flash** with context-aware system instructions:

```typescript
// System instruction includes:
// - Current air quality data for all cities
// - Health guidelines (NAAQS limits)
// - User's selected city context
// - Response formatting guidelines
```

---

## 🧩 Components

### InlineCopilotSearch
The main AI interface in the header. Features:
- Expandable search bar with focus states
- Quick suggestion buttons
- Conversation history (last 2 Q&A pairs visible)
- Loading states with spinner
- Auto-collapse after 3 minutes inactivity
- Imperative API for programmatic submissions (via ref)

### KPICards
Four metric cards displaying:
1. **Current PM2.5** - Live reading with severity badge & LIVE indicator
2. **Cities Above Limit** - Count exceeding NAAQS 60 µg/m³
3. **Seasonal Average** - 3-month mean for selected city
4. **Cleanest Air** - Best performing metro

### AirCharts
Two interactive charts:
1. **3-Month PM2.5 Trend** - Line chart with NAAQS reference line
2. **City Comparison** - Bar chart for November readings

Both include "Explain" buttons that trigger AI analysis via the copilot.

---

## ⚙️ Configuration

### Tailwind Theme
Custom emerald color palette:
```typescript
// Primary: emerald-500 (#10b981)
// Accent: emerald-600 (#059669)
// Background: emerald-50/emerald-100
```

### Health Thresholds
```typescript
PM2.5 Levels (µg/m³):
├── Good: 0-30 (Satisfactory)
├── Moderate: 31-60 (Acceptable)
├── Poor: 61-90 (Health risk for sensitive groups)
└── Severe: 91+ (Health advisory for all)

NAAQS Daily Limit: 60 µg/m³
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI copilot |
| `VITE_OPENWEATHER_API_KEY` | No | OpenWeather API key (has Open-Meteo fallback) |
| `VITE_GEMINI_MODEL` | No | Gemini model (defaults to gemini-2.5-flash) |

### Getting API Keys

**Gemini API Key**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add to `.env.local` file

**OpenWeather API Key** (Optional)
1. Visit [OpenWeather](https://openweathermap.org/api)
2. Sign up for free tier
3. Get API key from dashboard

---

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AirSafe India"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/airsafe-india.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to [Vercel](https://vercel.com)** and sign in with GitHub

2. **Click "Add New Project"**

3. **Import your GitHub repository** (`airsafe-india`)

4. **Configure Environment Variables** (IMPORTANT!)
   
   In the Vercel project settings, add these environment variables:
   
   | Name | Value |
   |------|-------|
   | `VITE_GEMINI_API_KEY` | `your-gemini-api-key` |
   | `VITE_OPENWEATHER_API_KEY` | `your-openweather-api-key` |

5. **Click Deploy**

### Step 3: Verify Deployment

After deployment:
- Visit your Vercel URL (e.g., `airsafe-india.vercel.app`)
- Check the browser console for any API errors
- Test the AI copilot feature
- Verify live air quality data is loading

### Updating Environment Variables

To update API keys after deployment:
1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/Edit variables
5. **Redeploy** for changes to take effect

---

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Single column, hamburger menu |
| Tablet (768-1024px) | 2-column grid |
| Desktop (>1024px) | Fixed sidebar + 2-column content |

---

## 🔄 Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  OpenWeather    │────▶│   dataService    │────▶│    App.tsx      │
│  / Open-Meteo   │     │   (fallback)     │     │  (state mgmt)   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
        ┌─────────────────────────────────────────────────┼─────────┐
        │                         │                       │         │
        ▼                         ▼                       ▼         ▼
┌───────────────┐    ┌────────────────┐    ┌──────────────┐    ┌────────┐
│   KPICards    │    │   AirCharts    │    │   Copilot    │    │ Cities │
│   (metrics)   │    │   (visuals)    │    │    (AI)      │    │ (list) │
└───────────────┘    └───────┬────────┘    └──────┬───────┘    └────────┘
                             │                    │
                             ▼                    ▼
                    ┌────────────────┐    ┌───────────────┐
                    │ Explain Button │───▶│ Gemini API    │
                    └────────────────┘    └───────────────┘
```

---

## 🧪 Scripts

```bash
# Development
npm run dev          # Start dev server on localhost:5173

# Build
npm run build        # Production build to /dist
npm run preview      # Preview production build

# Type Checking
npx tsc --noEmit     # Check TypeScript types
```

---

## 📈 Performance Optimizations

- **Parallel API calls**: All city data fetched simultaneously
- **Memoized computations**: useMemo for derived data
- **Debounced interactions**: Prevents excessive re-renders
- **Fallback data**: CSV backup when APIs unavailable
- **forwardRef pattern**: Efficient parent-child communication

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- [OpenWeather](https://openweathermap.org/) - Air pollution API
- [Open-Meteo](https://open-meteo.com/) - Free air quality data
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Recharts](https://recharts.org/) - Chart components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Icon library

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with 💚 for cleaner air in India
</p>
