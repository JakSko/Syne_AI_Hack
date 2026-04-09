# IT Role Requirements Analyzer — Project Assumptions
*Hackathon MVP — generated 09.04.2026*

---

## 1. Problem Statement
PM/BUD receives a vague role request from a client. They pass it to Resource Manager via Jira/Teams. Resource Manager can't act on incomplete briefs — sends it back. This ping-pong wastes time.

**Solution:** A web app that forces structured completeness BEFORE the brief reaches Resource Manager.

---

## 2. Actors
| Actor | Role in App |
|---|---|
| PM / BUD | Inputs the brief, answers follow-up questions |
| Resource Manager | Receives a complete, validated brief |
| Client | Passive — PM acts on their behalf |

---

## 3. Core User Story
> As a PM, I want to paste a rough role description and get a scored completeness report with specific follow-up questions, so that my Resource Manager never has to reject my brief again.

---

## 4. MVP — 3 Features Only
1. **Brief Input** — paste text, click Analyze
2. **Completeness Score** — AI scores each of 10 mandatory sections (0–100%), shown as visual progress bars
3. **Follow-up Checklist** — grouped questions per section, PM can check them off as resolved

---

## 5. Tech Stack
- Frontend: React (single file / Vite)
- AI: Anthropic API (claude-sonnet-4-20250514)
- No backend, no auth, no DB — stateless single session
- Styling: Tailwind or inline CSS

---

## 6. The 10 Mandatory Sections (from agent instructions)
1. Job Title / Role / Profile
2. Summary — We are looking for...
3. Form of Cooperation
4. Key Competency for This Role
5. Project Description
6. Role Description
7. Main Responsibilities
8. Must Have Requirements
9. Nice to Have Requirements
10. Tech Stack + Additional Information

---

## 7. AI Prompt Strategy
- System prompt: analyst role, strict no-hallucination rules
- User prompt: paste brief → return JSON with section scores + missing questions
- Output format: structured JSON only (parsed in frontend)

---

## 8. Out of Scope for Demo
- File upload (.docx / .pdf)
- Jira / MS Teams integration
- User accounts / history
- Resource Manager view
- Multi-language UI

---

## 9. Demo Flow (happy path)
1. Open app → see input textarea
2. Paste example brief (pre-loaded or manual)
3. Click "Analyze Brief"
4. See completeness dashboard — bars fill up per section
5. Scroll to checklist of follow-up questions
6. Check off 2-3 items to show interactivity
7. Done ✅

---

## 10. Definition of Done (for 18:00)
- [ ] Brief input works
- [ ] API call returns scored sections
- [ ] Progress bars render correctly
- [ ] Checklist renders and checkboxes work
- [ ] Looks good enough to record a 2-min demo video

