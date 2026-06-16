# Cognitive Science 101 — App Blueprint

A complete architectural blueprint for the Cognitive Science 101 one-unit course. This document is the single reference for what the app does, how it's wired, and the contracts between pieces. For day-to-day commands and gotchas see `replit.md`.

---

## 1. Product summary

Cognitive Science 101 is a self-paced, single-user web course — a plain-language "baby course" on how the mind works (one unit, 8 sections — from What Cognitive Science Is through Consciousness, covering perception, memory, language, reasoning & bias, and machine minds). Students read AI-rewritten lecture notes at three lengths, ask an AI tutor scoped to the section they're reading, drill on adaptive scenario practice, and submit **one homework per section** that is AI-graded on an **inverted partial-credit scale** and AI-detection-screened. Grading is the inverted core: the strongest, most-testable conclusion the evidence supports about the mind earns top credit; the cautious "we can't conclude anything / the brain is too complex" dodge earns near-zero. There is **no separate test, midterm, or final** — homework is the graded model.

The product surface is three deployable artifacts in one pnpm monorepo:

| Artifact | Slug | Role |
| --- | --- | --- |
| `@workspace/api-server` | `api-server` | Express 5 API mounted at `/api`. Owns the DB, OpenAI calls, AI detection, grading, diagnostics. |
| `@workspace/qr-course` | `qr-course` | Student-facing React + Vite app. The actual course. |
| `@workspace/course-promo` | `course-promo` | Promo video that *demonstrates* the course's ideas (Müller-Lyer illusion, the Wug test, the bat-and-ball problem, false memory), exported as MP4 from the preview pane. |

Shared contracts live in `lib/`:

- `lib/api-spec` — OpenAPI source of truth.
- `lib/api-zod` — generated Zod validators (used by the server).
- `lib/api-client-react` — generated React Query hooks (used by `qr-course`).
- `lib/db` — Drizzle schema + db client.

---

## 2. Domain model (Postgres + Drizzle)

Source: `lib/db/src/schema/course.ts`.

```
topics ──< lectures              (one topic, one lecture per length)
topics ──< problems              (problems tagged to a topic for analytics)
assignments ──< problems         (homework only; problems partitioned by format: mcq | hybrid | written)
assignments ──< attempts ──< answers
                                ↑ per-answer keystroke trace + AI scores + per-item partial credit
practice_sessions ──< practice_problems ──< practice_attempts
                                            ↑ adaptive difficulty session
```

Notable columns:

- `lectures.body` / `body_medium` / `body_long` — the Short / Medium / Long toggle is three pre-baked LLM rewrites of the same lecture.
- `answers.{keystrokeCount,eraseCount,bulkInsertCount,longestBulkInsertChars,rewriteSegments,durationMs}` — the **diachronic trace**. Captured client-side from the textarea and submitted with the answer.
- `answers.{aiScore,aiFlagged,diachronicScore,diachronicFlagged,detectionRationale}` — frozen detection outcome at submission time.
- `problems.{itemType,format}` — `itemType` is `mc | written | hybrid`; `format` (`mcq | hybrid | written`) partitions each assignment's problems so one homework offers three parallel format tracks.
- `problems.mcOptions` (jsonb) — for MC / hybrid: each option carries a `credit` weight in `[0,1]`. Exactly one option is the zero-credit dodge; the rest form a descending gradient (`1.0 / 0.6 / 0.3`).
- `problems.writtenRubric` (jsonb) — for written / hybrid: `{ modelAnswer, yieldAnchors[], riskAnchors[], defeatedBy[] }` drives inverted partial-credit scoring.
- `attempts.format` — the single format the student locked in; `attempts.status` (`in_progress | submitted`) enforces the single-attempt lock.
- `answers.{credit,maxPoints}` — per-item partial credit awarded by the inverted grader.
- `practice_sessions.difficulty` (1–4, double) — adapts session-by-session based on streaks / accuracy.

Push schema with `pnpm --filter @workspace/db run push`.

---

## 3. API surface (OpenAPI-first)

Source: `lib/api-spec/openapi.yaml`. **Never** hand-edit `lib/api-zod/src/generated/*` or `lib/api-client-react/src/generated/*` — change the spec and run `pnpm --filter @workspace/api-spec run codegen`.

Tag groups and what they own:

| Tag | Endpoints | Purpose |
| --- | --- | --- |
| `course` | `GET /course/overview`, `GET /course/weeks/{n}`, `GET /course/lectures/{id}` | Read the static course tree. Lectures return Short/Medium/Long bodies. |
| `tutor` | `POST /tutor/ask` (SSE), `GET /tutor/suggestions/{lectureId}` | Streaming AI tutor scoped to a lecture section. Suggestions are pre-generated starter questions. |
| `practice` | `POST /practice/sessions`, `POST /practice/sessions/{id}/next`, `POST /practice/sessions/{id}/attempts` | Adaptive practice: server generates the next problem, scoring it adjusts session `difficulty`. |
| `assignments` | `GET /assignments`, `GET /assignments/{id}`, `GET /assignments/{id}/problems`, `POST /assignments/{id}/start`, `GET /assignments/attempts/{aid}`, `PUT /assignments/attempts/{aid}/answer`, `POST /assignments/attempts/{aid}/submit` | Homework flow. `start` records the chosen format and resumes any in-progress attempt; a second start on a submitted assignment returns **409**. `submit` triggers the inverted partial-credit grade + detection per answer. `/{id}/problems` is the admin grader-lab problem picker. |
| `analytics` | `GET /analytics/summary`, `GET /analytics/topics`, `GET /analytics/activity` | KPIs, topic mastery, recent activity. |
| `detection` | `POST /detection/scan` | Run AI + diachronic detection on an arbitrary text + trace. Used directly by the diagnostics page. |
| `diagnostics` | `GET /diagnostics/system`, `POST /diagnostics/synthetic-run`, `POST /diagnostics/quality-control`, `POST /diagnostics/expand-lectures`, `POST /diagnostics/reset` | Self-tests and seed maintenance. See §6. |

The submit endpoint's response schema (`AttemptResult`) bundles `percent / perProblem[]` where each `ProblemResult` carries `credit / maxPoints / itemType / selectedIndex / correctAnswer / explanation`, plus the detection verdict — so the UI can render the inverted partial-credit grade + detection in one round-trip.

---

## 4. Server architecture

### 4.1 Layout

```
artifacts/api-server/src/
├── routes/
│   ├── course.ts          read-only course tree
│   ├── tutor.ts           SSE chat against a lecture section
│   ├── practice.ts        adaptive session lifecycle
│   ├── assignments.ts     attempt + grade + detect on submit
│   ├── analytics.ts       summary / topic mastery / activity
│   ├── detection.ts       /detection/scan passthrough
│   ├── diagnostics.ts     three diagnostics + seed maintenance
│   ├── health.ts          /healthz
│   └── index.ts           router mount
└── lib/
    ├── ai.ts              OpenAI client (Replit AI Integrations proxy)
    ├── detection.ts       GPTZero + heuristic + diachronic scoring
    ├── homeworkGrading.ts inverted partial-credit grader (MC weights + written yield/risk rubric)
    ├── homeworkContent/   seeded cognitive science section content + types (mcOptions, writtenRubric)
    └── logger.ts          singleton pino logger (req.log in routes)
```

### 4.2 Conventions

- **Validation:** every handler parses input with `safeParse` from `@workspace/api-zod` and re-`parse`s outputs before sending. Never trust the request body, never trust your own response.
- **Logging:** `req.log.info(...)` inside routes; singleton `logger` everywhere else. **Never** `console.log` in server code.
- **OpenAI:** all model calls go through `lib/ai.ts` (`chatText`, `chatJson`, `chatStream`, `FAST_MODEL`). The Replit AI proxy means no API key is needed in dev or prod.
- **Errors:** thrown errors bubble to a global error handler that logs and returns `{ error: string }` with the right status. Detection failures are **non-fatal** — they return `null` and the caller falls back.

---

## 5. AI detection — `artifacts/api-server/src/lib/detection.ts`

Detection is the project's signature feature. It runs **two independent functions** and bundles their outputs into one `DetectionOutcome`.

### 5.1 Detection Function 1 — Static AI detection (GPTZero, with fallback)

Question answered: *"Was this text written by an LLM?"*

Pipeline:

1. **`gptzeroAiScore(text)`** — calls `POST https://api.gptzero.me/v2/predict/text` with `x-api-key: $GPTZERO_API_KEY`. Reads `documents[0].class_probabilities.ai` (plus half-weight of `mixed`), falls back to `completely_generated_prob`. Returns `null` on missing key, network failure, malformed response, or text shorter than 40 chars.
2. **`heuristicAiScore(text)`** — local zero-dependency scorer. Penalises long average sentence length plus presence of LLM tells (`delve`, `tapestry`, `leverag(e|ing)`, `in conclusion`, `it is important to note`, `plays a crucial/vital/pivotal role`, etc.). Used as anchor + fallback.
3. **`llmAiScore(text)`** — secondary fallback. Asks the OpenAI proxy in JSON-only mode for `{"probability": 0..1}`. Used only when GPTZero is unavailable.

Blend (`detect()`):

```
if GPTZero responded:           aiScore = 0.85 * gptzero + 0.15 * heuristic
elif LLM scorer responded:      aiScore = 0.60 * llm     + 0.40 * heuristic
else:                           aiScore = heuristic
```

`aiFlagged = aiScore >= 0.55`.

### 5.2 Detection Function 2 — Diachronic detection (keystroke pattern)

Question answered: *"Did the student paste AI output and reword it to sound human?"*

This is the novel part: even if the final text passes GPTZero (because the student edited the wording), the **act of producing it** looks nothing like organic typing.

`diachronicScore(text, trace)` reads a `TraceInput` captured by the client:

```
{ keystrokeCount, eraseCount, bulkInsertCount?, longestBulkInsertChars?,
  rewriteSegments?, durationMs }
```

It adds penalty points for:

| Signal | Penalty | Why |
| --- | --- | --- |
| `longestBulkInsertChars > 40` *or* `longestBulkInsertChars / textLen > 0.4` | +0.50 | One paste covers most of the answer. |
| `bulkInsertCount >= 2 && longestBulkInsert > 25` | +0.15 | Multiple paste events. |
| `keystrokeCount / textLen < 0.6` with `textLen > 30` | +0.30 | Far fewer keys pressed than characters of output — paste-like. |
| `charsPerSecond > 12` with `textLen > 30` | +0.20 | Sustained typing speed no human freshman maintains. |
| `longestBulkInsert > 30 && rewriteSegments >= 2` | +0.15 | Big paste followed by reword passes — the giveaway pattern. |

Clamped to `[0, 1]`. `diachronicFlagged = diachronicScore >= 0.55`.

### 5.3 Combined outcome

`detect()` returns:

```ts
{
  aiScore, aiFlagged,
  diachronicScore, diachronicFlagged,
  rationale: string  // human-readable explanation incl. GPTZero %
}
```

This outcome is persisted on `answers` at submit time and surfaces in the assignment results UI plus the diagnostics page.

---

## 6. Diagnostics surface

Three routes, one page. The page lives at `artifacts/qr-course/src/pages/Diagnostics.tsx` and is linked from the student app. **These are operator tools, not student-facing features.**

### 6.1 `GET /api/diagnostics/system` — system self-test

Runs a strict ordered checklist and returns `{ ok, generatedAt, steps[] }`. Each step has `{ name, ok, ms, detail?, error? }`. The student page renders one row per step with pass/fail and timing.

Steps:

1. **Environment** — `DATABASE_URL` present.
2. **Database** — `SELECT 1` round-trip.
3. **Database** — course content is seeded (≥6 topics, ≥1 lecture / assignment / problem).
4. **OpenAI** — fast-model chat completion returns non-empty text.
5. **OpenAI** — JSON mode returns `{ ok: true }`.
6. **Detection** — heuristic+scoring pipeline returns numbers for a benign sentence.
7. **AI detection** — pasted-style LLM-tell text **flags** as AI.
8. **GPTZero** — if `GPTZERO_API_KEY` is set, the real API responds and gives a non-null score.

If any step fails the page shows the red row and the raw error string from the server — that's the debugging surface.

### 6.2 `POST /api/diagnostics/synthetic-run` — end-to-end synthetic student

Simulates a real student session against the live DB and reports each leg pass/fail/timing. Useful when refactoring the practice loop or grading pipeline. Stages roughly:

1. Create a practice session for a known topic.
2. Pull the first problem (`/practice/sessions/{id}/next`).
3. Submit a wrong answer, then a right one — confirm difficulty adjusts and accuracy persists.
4. Create an assignment attempt, answer each problem, submit, and verify `AttemptResult` returns full `perProblem[]` + `detection[]`.
5. Hit analytics endpoints and confirm the new attempt is reflected.

### 6.3 `POST /api/diagnostics/quality-control` — OpenAI answer-key legitimacy check

Independently re-derives the answer to a sample of course problems and verifies each seeded answer key is legitimate. Returns `{ ok, generatedAt, steps[] }` like the other diagnostics. Stages:

1. Collect every assignment problem joined to its assignment, grouped by assignment, and sample up to 12 with a guaranteed per-group quota so every assignment is covered even if its problem count is uneven.
2. For each sampled problem, run a **two-phase** check: (a) the LLM independently re-derives an answer from the prompt **alone**, blind to the seeded key, so the verdict can't just rubber-stamp the key; (b) a second LLM call judges whether the seeded key is legitimate given the prompt + the independent answer, using the grader's semantic-equivalence philosophy — accepting any correct on-topic short answer and flagging only genuinely defective keys (wrong, off-topic, self-contradictory, contradicted on substance, or ungradeable). Returns `{ legitimate, confidence, rationale }`; malformed verdicts are treated as failures, not passes.
3. A legitimate key passes its step; a flagged key fails its step with the model's rationale. A final summary step reports the legitimate/flagged tally.

### 6.4 Supporting routes (not in the diagnostics UI)

- `POST /api/diagnostics/expand-lectures` — generates `body_medium` / `body_long` for lectures that are missing them. Idempotent.
- `POST /api/diagnostics/reset` — wipes attempts / answers / practice for a clean demo. **Does not** drop course content.

---

## 7. Student app — `@workspace/qr-course`

React + Vite + Tailwind. Routes:

| Route | Page | What it does |
| --- | --- | --- |
| `/` (landing) / `/dashboard` | `Landing` / `Dashboard` | Public landing page; signed-in dashboard shows homework progress + Course Schedule + Recent Activity |
| `/weeks/:weekNumber` | `WeekView` | List of section's lectures and homework |
| `/lectures/:lectureId` | `LectureView` | Lecture body + Short/Medium/Long toggle + right-rail tutor / practice |
| `/practice/topic/:topicId` | `TopicPractice` | Adaptive single-topic scenario drill |
| `/assignments` | `Assignments` | All section homeworks (homework-only model) |
| `/assignments/:id` | `AssignmentRunner` | Pick a format (MCQ / hybrid / written), take the single attempt, then review inverted partial-credit + detection per item; locked once submitted |
| `/reasoning` | `Reasoning` | Four-phase Scientific Reasoning diagnostic instrument (3×3 menu, fresh items per attempt, longitudinal view) |
| `/analytics` | `Analytics` | KPIs, section mastery table, recent activity |
| `/admin` | `AdminMode` | Operator grader lab + admin toggles (disable detection, allow paste) |
| `/diagnostics` | `Diagnostics` | Operator self-test UI (see §6) |

All server data goes through the **generated** React Query hooks from `@workspace/api-client-react`. No fetch logic should be hand-written in components.

### 7.1 Diachronic trace capture

The answer `<textarea>` is wrapped in a hook (lives in the assignment runner / topic practice) that:

- Counts every `keydown` (excluding modifier-only) into `keystrokeCount`.
- Increments `eraseCount` on Backspace/Delete.
- On every `input` event, compares the new value to the previous: if the diff inserted ≥4 chars in one tick, that's a "bulk insert" — increment `bulkInsertCount` and update `longestBulkInsertChars`.
- Detects a "rewrite segment" when characters are erased mid-string and then replaced with new ones (not at the tail).
- Stamps `durationMs` = (submit time − first focus time).

The trace is included in the answer `PUT` body and on `POST submit`, then stored verbatim on `answers` so detection is reproducible.

---

## 8. Promo video — `@workspace/course-promo`

A **show-don't-tell promo**: rather than describing the course, it *animates the actual "aha" demonstrations* the course teaches, so a viewer experiences a few mind-bending moments before the course name even lands. Built per the `video-js` skill: React + framer-motion, exported to MP4 from the preview pane via the browser recorder.

### 8.1 Structure

```
artifacts/course-promo/src/components/video/
├── VideoTemplate.tsx        scene router + persistent background layer + audio sync
└── video_scenes/
    ├── Scene1.tsx           Intro hook — "A baby course on HOW THE MIND WORKS"
    ├── Scene2.tsx           Perception: Müller-Lyer illusion — a ruler reveals the lines are identical
    ├── Scene3.tsx           Language: the Wug test — one wug → two "wugs"
    ├── Scene4.tsx           Reasoning: the bat-and-ball problem — gut answer 10¢ crossed out, correct 5¢
    ├── Scene5.tsx           Memory: false-memory word list — you "remember" SLEEP, never shown
    └── Scene6.tsx           Outro lockup — "Cognitive Science 101" (1 unit, 8 sections, AI-taught & graded)
```

Each demo beat animates the demonstration itself, not a description of it — that is the whole point of the rebuild.

### 8.2 Key architectural rules

- **Persistent background layer.** The animated background lives in `VideoTemplate.tsx` outside `<AnimatePresence>` so it drifts continuously across scene cuts instead of resetting per scene.
- **Demonstrations are animated, not described.** Each demo scene animates the actual phenomenon (a ruler proving the Müller-Lyer lines are equal, the gut answer being crossed out, the never-shown word being "remembered") — the payoff is the viewer experiencing the effect, not reading about it.
- **`AnimatePresence` key = `currentSceneKey`** (NOT `baseSceneKey`). When scene-lock toggles `_r1` / `_r2` on the durations object, both iterations must remount and re-animate.
- **Audio.** One bg music file at `public/audio/bg_music.mp3`, scene-synced via `SCENE_START_SEC` — on every scene change the audio seeks to that scene's canonical start offset (epsilon 0.18s).
- **Mute wiring.** Iframe preview defaults to muted; control bar exposes `Volume2` / `VolumeX`. Export path renders `<VideoTemplate />` with no props → unmuted, no controls. The mute toggle is **declarative JSX (`<audio muted={muted}>`) only** — it must not also re-seek `audio.currentTime`, or unmute restarts the scene's audio.

### 8.3 Scene controls

`useSceneControls` exposes `jumpTo(index)`, `toggleLock()`, `activeIndex`, `locked`, `durations`, `mountKey`, `tick`. It rotates the durations object on jump and replaces it with `{ key_r1, key_r2 }` on lock to force `useVideoPlayer` to loop a single scene. `VideoWithControls` reads `window.self !== window.top` and renders the control bar only inside the iframe so MP4 exports stay clean.

### 8.4 Export

Recording fires `window.startRecording()` on first scene mount and `window.stopRecording()` after the last scene. Audio is part of the recorded tab capture — so the exported MP4 contains the music.

---

## 9. README contract

`replit.md` is the always-loaded project README. It contains:

1. **Run & Operate** — every command needed in day-to-day work.
2. **Required env / secrets** — `DATABASE_URL`, `GPTZERO_API_KEY`, `SESSION_SECRET`; OpenAI via Replit AI Integrations proxy (no key).
3. **Stack** — exact runtime versions and tools.
4. **Where things live** — pointer map: OpenAPI spec, generated hooks, DB schema, route files, detection lib, AI lib, pages, demo scenes.
5. **Product** — 6-bullet description of what the student actually does.
6. **Architecture decisions** — non-obvious choices: contract-first API, single composite logger, GPTZero failure is non-fatal, demo video is a real React app.
7. **User preferences** — be direct, no preamble, screencast not marketing reel.
8. **Gotchas** — don't edit generated files; don't rename `info.title`; video scaffold typecheck noise is harmless; restart workflows, don't `pnpm dev` at root; demo export includes audio.

If you change anything in this blueprint, update `replit.md` to match — they are the long-form and short-form views of the same truth.

---

## 10. End-to-end request example

A student takes and submits the Section 1.1 homework in the written format. The full path:

1. Browser: `qr-course/src/pages/AssignmentRunner.tsx` picks a format and calls `useStartAssignmentAttempt()` (`POST /api/assignments/{id}/start` with `{ format }`); the server creates or resumes the single in-progress attempt (409 if already submitted).
2. Per item the student answers via `useSaveAnswer()` (`PUT /api/assignments/attempts/{aid}/answer`) with `{ problemId, answer, selectedIndex, trace }`.
3. On submit, `useSubmitAttempt()` calls `POST /api/assignments/attempts/{aid}/submit` with `{ skipDetection }`, validated against the generated Zod schema.
4. Express route (`routes/assignments.ts`):
   - Loads `attempt` + `answers` + `problems` from Drizzle.
   - For each answer the inverted grader runs: MC items take the chosen option's stored `credit` weight; written items call `gradeWrittenPart()` (yield/risk rubric, data-defeated penalty); hybrid averages both — each returns `{ credit, maxPoints, explanation }`. `detect(answer.text, trace)` runs in parallel unless `skipDetection`.
   - Writes `credit`, detection scores, and `detectionRationale` onto each answer row.
   - Updates `attempts.status = "submitted"`, computes `scorePercent` honoring configurable format weights.
5. Returns `AttemptResult` validated against the generated Zod schema.
6. Browser: `AssignmentRunner` renders per-item cards with the partial-credit %, the grader rationale, and a detection chip (`Human-written response · confidence 94%` or `AI-detected · 91%`); the page is now locked.

Every layer in that chain (spec → server zod → server logic → client hook → client zod) is generated or validated from the same `openapi.yaml`. Don't introduce a parallel path.
