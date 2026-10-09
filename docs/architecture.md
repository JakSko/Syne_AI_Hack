# Architecture — IT Role Requirements Analyzer
*Single Page App — No Backend — Stateless*

---

## High-Level Diagram

```
┌─────────────────────────────────────────────────┐
│                  BROWSER (React SPA)             │
│                                                  │
│  ┌──────────┐   ┌──────────────┐   ┌──────────┐ │
│  │ SCREEN 1 │→  │  SCREEN 2    │→  │ SCREEN 3 │ │
│  │  Input   │   │  Dashboard   │   │Checklist │ │
│  │ Textarea │   │ Progress bars│   │Questions │ │
│  │ [Analyze]│   │ Overall score│   │Checkboxes│ │
│  └──────────┘   └──────────────┘   └──────────┘ │
│        │                                         │
│        ▼                                         │
│  ┌─────────────────────────────┐                 │
│  │     Anthropic API Client    │                 │
│  │  fetch() → /v1/messages     │                 │
│  │  model: claude-sonnet-4-... │                 │
│  │  returns: JSON sections[]   │                 │
│  └─────────────────────────────┘                 │
└─────────────────────────────────────────────────┘
        │
        ▼ HTTPS
┌───────────────────────┐
│   ANTHROPIC API       │
│  claude-sonnet-4-...  │
│  Input: brief text    │
│  Output: JSON scores  │
└───────────────────────┘
```

---

## Data Flow

```
PM pastes text
    → onClick "Analyze"
    → setState(loading)
    → fetch() Anthropic API with SYSTEM_PROMPT + brief
    → API returns JSON { sections[], overall_score, summary }
    → JSON.parse()
    → setState(results)
    → render Dashboard (Screen 2)
    → render Checklist (Screen 3)
    → PM checks off questions
    → onClick "Copy" → navigator.clipboard
```

---

## State Shape (React useState)

```javascript
{
  brief: string,           // raw input text
  loading: boolean,
  error: string | null,
  results: {
    overall_score: number,
    summary: string,
    sections: [
      {
        id: string,
        label: string,
        score: number,       // 0-100
        found: string|null,
        questions: string[]
      }
    ]
  } | null,
  checked: Set<string>     // question IDs checked off by PM
}
```

---

## File Structure

```
/src
  App.jsx          ← all logic + screens (single file MVP)
  main.jsx         ← ReactDOM.render
  prompts.js       ← SYSTEM_PROMPT constant
index.html
package.json
.env               ← VITE_ANTHROPIC_API_KEY=sk-ant-...
```

---

## Key Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend | None | No time, stateless is fine for demo |
| Auth | None | One URL shared via link |
| Styling | Tailwind CDN | No build config needed |
| State | useState only | No Redux, too complex for MVP |
| API key | .env (Vite) | Never hardcode in source |
| Routing | No router | 3 screens = conditional render |

