# Fireflies Close-out: From Spoken to Closed

An upgrade to Fireflies' existing Tasks and Meeting Prep that turns extracted meeting commitments into owned items that reach honest closure. Target: raise 14-day honest resolution from 28% to 45% in six months.

## Ambiguity Choice
**Ambiguity Choice:** When an action's recipient or timeline is unclear, the system defaults to protecting the promise-maker by suggesting a clarifying step or deliberate drop rather than auto-assigning work without consent or marking items overdue.

---

## Non-Negotiables & Autonomy Model
1. **Never assign work without consent**: The system suggests; the human confirms.
2. **Drop is a legitimate outcome**: Same size, button weight, and dignity as Done. Never red, never uses the word "failed".
3. **No surveillance**: Managers see aggregate team totals and closure mix only, never individual names or per-person items. Minimum cohort size of 5 attendees enforced for K-anonymity.
4. **Capped nudges**: At most 2 proactive nudges per person per week, folded into the existing Daily Digest.
5. **No project management overhead**: No boards, sprints, subtasks, or rankings.
6. **Autonomy Model**: `Observe` → `Ask` → `Suggest` → `Prepare`. Consequential updates and state closures always require affirmative human approval.

---

## Simulated vs. Live Architecture

| Capability | Status | Implementation Details |
| :--- | :--- | :--- |
| **Commitment Extraction** | **Live** | Server-side Gemini API (`gemini-3.8-flash`) with structured schema + offline rule-based fallback. Quotes must pass contiguous substring verification. |
| **Substring Verification** | **Live** | Server-side contiguous substring verification normalized for curly quotes (`’`/`‘`), straight quotes, and whitespace. Reject test verifies fabricated quotes. |
| **Prompt Injection Defense** | **Live** | Server detects adversarial instructions (`ignore previous instructions`, `system prompt`) and safely rejects them into audit log. |
| **14-Day Honest Resolution Math** | **Live** | `(Done + Accepted Reassignment + Dropped within 14d) / (All Extracted Commitments)`. "Not a commitment" and "Went quiet" stay in the denominator. |
| **K-Anonymity Privacy** | **Live** | Cohorts $< 5$ attendees automatically suppress aggregate totals to prevent deductive identification. |
| **Pre-brief 2.0** | **Live** | 60 minutes before meeting: *Yours to settle*, *Waiting on others*, and *Repeating without an owner*. |
| **Loop Keeper** | **Live** | Detects repeat discussions (`repeat_of`). Items repeated 2+ times with no owner escalate to the host with 3 equal options: *Own it*, *Split it*, or *Let it go*. |
| **Read-Back (Last 3 Min)** | **Live UX** | Meeting chat frame with platform switcher (Zoom, Google Meet, Teams, Slack fallback). Exactly one read-back summary posted per meeting. |
| **Slack Simulator** | **Simulated** | 390px mobile-width frame simulating private DMs, channel posts, digests, and pre-briefs with live two-way state synchronization. |
| **Jira / Asana / Calendar** | **Simulated** | UI connection toggles simulating bidirectional task sync and calendar meeting hooks without external webhook credentials. |
| **AI Follow-Through Report** | **Live & Printable** | Generates executive summary from aggregate numbers only (never raw employee quotes) with print-to-one-page CSS. |

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key (injected at runtime in AI Studio via Secrets panel). | Optional (falls back to offline rule extractor) |
| `GEMINI_MODEL` | Gemini model alias to use for extraction. | `gemini-3.8-flash` |
| `PORT` | Local HTTP port for Express server. | `3000` |

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (Express with Vite middlewares)
npm run dev

# 3. Build for production
npm run build
npm start
```
