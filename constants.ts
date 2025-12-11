import { CityData, CityName } from './types';

// Data from the provided context
export const FALLBACK_AIR_QUALITY_DATA: Record<CityName, CityData> = {
  Delhi: {
    name: 'Delhi',
    data: [
      { month: 'September', pm25: 75, note: 'Moderate–Poor air; start of crop‑burning season.' },
      { month: 'October', pm25: 130, note: 'Very Poor; festival season and stubble burning.' },
      { month: 'November', pm25: 215, note: 'Severe; frequent health advisories.' },
    ],
  },
  Mumbai: {
    name: 'Mumbai',
    data: [
      { month: 'September', pm25: 40, note: 'Satisfactory–Moderate coastal air.' },
      { month: 'October', pm25: 48, note: 'Moderate; some construction and traffic impact.' },
      { month: 'November', pm25: 54, note: 'Moderate; still below Indian NAAQS (60).' },
    ],
  },
  Bengaluru: {
    name: 'Bengaluru',
    data: [
      { month: 'September', pm25: 32, note: 'Satisfactory; relatively cleaner air.' },
      { month: 'October', pm25: 35, note: 'Satisfactory–Moderate.' },
      { month: 'November', pm25: 38, note: 'Satisfactory–Moderate.' },
    ],
  },
  Kolkata: {
    name: 'Kolkata',
    data: [
      { month: 'September', pm25: 60, note: 'At Indian NAAQS limit.' },
      { month: 'October', pm25: 72, note: 'Poor; rising winter inversion.' },
      { month: 'November', pm25: 82, note: 'Very Poor; health risk for sensitive groups.' },
    ],
  },
  Chennai: {
    name: 'Chennai',
    data: [
      { month: 'September', pm25: 35, note: 'Satisfactory–Moderate.' },
      { month: 'October', pm25: 40, note: 'Moderate.' },
      { month: 'November', pm25: 43, note: 'Moderate; still better than Delhi/Kolkata.' },
    ],
  },
};

const KNOWLEDGE_RULES = `Knowledge Rules:
1. Indian NAAQS daily limit for PM2.5 is 60 µg/m³.
2. WHO long-term guideline is 5–10 µg/m³.
3. Higher PM2.5 = higher risk (breathing problems, asthma, heart disease).
4. Vulnerable groups: Children, elderly, pregnant women.`;

const RESPONSE_STYLE = `Response Style:
1. Keep answers short (3-6 sentences).
2. Use sections: **Summary**, **Trend**, **Health Impact**, **Recommendations**.
3. Simple, friendly language.
4. Mention if values are above/below the NAAQS limit (60).
5. NO medical diagnoses. Give general advice (masks, air purifiers, avoid outdoor exercise).
6. If asked about outside data, refuse politely and state known data coverage.`;

const buildContextSection = (data: Record<CityName, CityData>) => {
  const now = new Date();
  const currentTime = now.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return `Current Time (India): ${currentTime}

Live Air Quality Data:
${Object.values(data)
    .map((city) => {
      const latestMonth = city.data[city.data.length - 1];
      const monthSummary = city.data
        .map((entry) => `${entry.month.slice(0, 3)}(${entry.pm25})`)
        .join(', ');
      const isLive = latestMonth.note.includes('Live data');
      return `- ${city.name}: ${monthSummary}. Current: ${latestMonth.pm25} µg/m³ ${isLive ? '[LIVE]' : '[Historical]'}. ${latestMonth.note}`;
    })
    .join('\n')}`;
};

export const buildSystemInstruction = (data: Record<CityName, CityData>) => {
  const contextSection = buildContextSection(data);
  return `You are an "Air Quality & Health Advisor for Indian Cities".
Your goal is to explain air quality trends and health impacts to a non-technical audience in India.

${contextSection}

IMPORTANT: The data marked [LIVE] is real-time from government AQI monitoring stations. Use this for current conditions.

${KNOWLEDGE_RULES}

${RESPONSE_STYLE}`;
};

export const DEFAULT_SYSTEM_INSTRUCTION = buildSystemInstruction(FALLBACK_AIR_QUALITY_DATA);

export const INITIAL_CHAT_MESSAGE = "Namaste! I'm your Air Quality Copilot. Ask me about the air in your city or how to stay healthy during pollution spikes.";
