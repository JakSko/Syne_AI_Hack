# Claude Code — Starter Prompt
*Wklej to jako pierwsze polecenie w Claude Code*

---

## PROMPT DO WKLEJENIA:

```
Build a React single-page app called "Brief Analyzer" — an IT Role Requirements Analyzer for Project Managers.

TECH STACK:
- React + Vite
- Tailwind CSS (via CDN in index.html)
- Anthropic API (fetch to https://api.anthropic.com/v1/messages)
- API key from import.meta.env.VITE_ANTHROPIC_API_KEY

THE APP HAS 3 SCREENS (conditional render, no router):
1. INPUT SCREEN — textarea for brief text, "Analyze Brief" button, "Load Example" button
2. DASHBOARD SCREEN — overall score (big %), summary sentence, 10 section progress bars colored green/yellow/red
3. CHECKLIST SCREEN — follow-up questions grouped by section, checkboxes, "Copy All Questions" button

STATE:
- brief (string)
- loading (boolean)  
- error (string|null)
- results (null or { overall_score, summary, sections[] })
- checked (Set of question strings)

ANTHROPIC API CALL:
- model: claude-sonnet-4-20250514
- max_tokens: 1000
- system prompt: (see below)
- user message: "Analyze this role brief:\n\n" + brief

SYSTEM PROMPT:
"""
You are an IT Role Requirements Analyst. Analyze the role brief and evaluate completeness across 10 sections. Return ONLY valid JSON, no markdown, no preamble.

JSON structure:
{
  "overall_score": 0-100,
  "summary": "one sentence assessment",
  "sections": [
    { "id": "job_title", "label": "Job Title / Role / Profile", "score": 0-100, "found": "string or null", "questions": ["q1","q2"] },
    { "id": "summary", "label": "Summary — We are looking for", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "cooperation", "label": "Form of Cooperation", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "competency", "label": "Key Competency", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "project", "label": "Project Description", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "role_description", "label": "Role Description", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "responsibilities", "label": "Main Responsibilities", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "must_have", "label": "Must Have Requirements", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "nice_to_have", "label": "Nice to Have", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "tech_stack", "label": "Tech Stack & Additional Info", "score": 0-100, "found": "string or null", "questions": [] }
  ]
}

SCORING: 0=not mentioned, 25=vaguely implied, 50=partial, 75=mostly complete, 100=fully specified.
Generate 2-4 questions for sections scoring below 75. Generate 0-1 for sections 75+.
"""

EXAMPLE BRIEF (for Load Example button):
"We need a senior backend developer for a fintech project. Must know Java and Spring Boot. Nice to have Kafka experience. The team is 6 people, working in sprints. B2B contract, long term. Start ASAP."

STYLING RULES:
- Clean, professional, dark sidebar or top nav
- Progress bars: green (#059669) for 75-100, yellow (#D97706) for 40-74, red (#DC2626) for 0-39
- Overall score: giant number centered, colored by score
- Checked questions: line-through, grey
- Mobile-friendly but desktop-first

Start by creating the full project structure. Put all logic in App.jsx (single file is fine for MVP).
Create a .env.example file with VITE_ANTHROPIC_API_KEY=your-key-here.
```

---

## PO WYGENEROWANIU — pierwsze komendy w terminalu:

```bash
cd brief-analyzer
npm install
cp .env.example .env
# wpisz swój klucz API do .env
npm run dev
```

## JEŚLI COŚ NIE DZIAŁA O 17:00:
- API nie odpowiada → hardcode przykładowy JSON jako mockResults i kontynuuj
- Styling wygląda źle → zostaw, ważne żeby działało
- Screen 3 nie działa → pokaż tylko Screen 2 na demo

