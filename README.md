# Brief Analyzer v1.0

IT Role Requirements Analyzer for Project Managers.

Paste a role brief and get an instant completeness analysis across 10 key sections, with follow-up questions for gaps.

## Features

- **Input Screen** — paste any role brief or load an example
- **Dashboard** — overall score + 10 section progress bars (green/yellow/red)
- **Checklist** — follow-up questions grouped by section, with checkboxes and copy-all

## Tech Stack

- React + Vite
- Tailwind CSS (CDN)
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

| Score | Color | Meaning |
|-------|-------|---------|
| 75-100 | Green | Fully or mostly specified |
| 40-74 | Yellow | Partial information |
| 0-39 | Red | Missing or vaguely implied |

## License

Hackathon project — AI Hackathon 2025.
