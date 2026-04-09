# Brief Analyzer v2.0

IT Role Requirements Analyzer for Project Managers.

Paste a role brief and get an instant AI-powered completeness analysis across 10 key sections, with follow-up questions for gaps.

## Screens

1. **Dashboard** — welcome view with quick stats, analysis history, and hero card to start new analysis
2. **New Analysis** — step-by-step input with textarea, example brief loader, and analysis tips
3. **Results** — bento grid layout with overall score card, per-section progress bars with status badges (Complete/Partial/Missing), and interactive follow-up questions checklist

## Features

- Professional UI with Manrope + Inter fonts, Material Design icons, glassmorphic top bar
- Desktop sidebar navigation + mobile bottom nav
- Questions checked by default — uncheck to exclude from copy
- Copy checked questions to clipboard with toast notifications
- Numbered question format per section when copying
- Analysis history tracked in session
- Responsive: desktop-first with full mobile support

## Tech Stack

- React 19 + Vite
- Tailwind CSS (CDN) with custom Material Design 3 color tokens
- Google Material Symbols Outlined
- OpenAI GPT-4o API

## Getting Started

```bash
cd brief-analyzer
npm install
cp .env.example .env
# paste your OpenAI API key into .env
npm run dev
```

## Scoring

| Score | Badge | Color | Meaning |
|-------|-------|-------|---------|
| 75-100 | Complete | Green | Fully or mostly specified |
| 40-74 | Partial | Yellow | Some information present |
| 0-39 | Missing | Red | Not mentioned or vaguely implied |

## License

Hackathon project — AI Hackathon 2025.
