# User Stories — IT Role Requirements Analyzer
*MVP Scope — Hackathon*

---

## EPIC: Brief Completeness Analysis

---

### US-01 — Input Brief [EKRAN 1]
**As a** PM/BUD
**I want to** paste my rough role description into a text field
**So that** the system can analyze how complete it is

**Acceptance Criteria:**
- [ ] Textarea accepts free-form text (min 10 chars)
- [ ] "Analyze Brief" button triggers API call
- [ ] Loading state visible during API call
- [ ] Pre-loaded example brief available (1-click fill)

---

### US-02 — Completeness Dashboard [EKRAN 2]
**As a** PM/BUD
**I want to** see a visual score for each of the 10 mandatory sections
**So that** I immediately know what's missing

**Acceptance Criteria:**
- [ ] Each section shows label + % score + colored progress bar
- [ ] Green = 75–100%, Yellow = 40–74%, Red = 0–39%
- [ ] Overall score shown at top (big number)
- [ ] Summary sentence from AI shown below score

---

### US-03 — Follow-up Checklist [EKRAN 3]
**As a** PM/BUD
**I want to** see a list of targeted questions for incomplete sections
**So that** I know exactly what to go back and ask the client

**Acceptance Criteria:**
- [ ] Questions grouped by section
- [ ] Only sections with score < 75 show questions
- [ ] Each question has a checkbox — PM can mark as "resolved"
- [ ] Resolved questions visually crossed out / greyed
- [ ] "Copy all questions" button → clipboard

---

## OUT OF SCOPE (not today)
- File upload
- Save / history
- Resource Manager view
- Jira / Teams export
- Auth

