# Brief Analyzer: IT role requirements analyzer

A web app that checks whether an IT role brief is complete before it reaches the Resource Manager. Paste a rough role description and get an AI completeness score for 10 mandatory sections, plus specific follow-up questions for every gap.

## Context

Built solo during an internal company AI hackathon in April 2026: from problem framing and user stories, through the analyst prompt, to a working React app (AI-assisted development).

**Problem.** A Project Manager receives a vague role request from a client and passes it on to the Resource Manager, who cannot act on an incomplete brief and sends it back. Every round trip costs time.

**Solution.** The PM pastes the brief into the app before sending it. The app scores each of the 10 mandatory sections of a role brief and generates follow-up questions for what is missing, so the PM can clarify everything with the client in one go.

## How it works

1. **New Analysis**: paste the brief (or load an example brief) and click Analyze.
2. The app sends the brief to the OpenAI API (GPT-4o) with an analyst system prompt that forbids inventing information and requires a structured JSON answer.
3. **Results**: overall score, a progress bar and status badge for each section, and a checklist of follow-up questions grouped by section. Checked questions can be copied to the clipboard, numbered per section, ready to send to the client.
4. **Dashboard**: quick stats and the history of analyses in the current session.

The 10 sections: Job Title / Role / Profile, Summary, Form of Cooperation, Key Competency, Project Description, Role Description, Main Responsibilities, Must Have Requirements, Nice to Have Requirements, Tech Stack + Additional Information.

| Score | Badge | Meaning |
|-------|-------|---------|
| 75-100 | Complete | Fully or mostly specified |
| 40-74 | Partial | Some information present |
| 0-39 | Missing | Not mentioned or only vaguely implied |

## Tech stack

React 19 + Vite, Tailwind CSS (CDN) with Material Design 3 color tokens, Google Material Symbols, OpenAI GPT-4o API. No backend, no database: one stateless session.

## Getting started

```bash
cd brief-analyzer
npm install
cp .env.example .env
# put your OpenAI API key into .env
npm run dev
```

> **Prototype, local use only.** The browser calls the OpenAI API directly, so the key from `.env` ends up in the front-end bundle. That is fine for a local hackathon demo, but a deployed version would need a small backend proxy that keeps the key on the server.

## Project documents

The planning documents written during the hackathon are in [`docs/`](docs/): project assumptions, user stories, architecture, analyst prompt and the starter prompt for AI-assisted development. See [`docs/README.md`](docs/README.md) for one difference between the plan and the implementation.

## License

MIT, see [LICENSE](LICENSE).
