# 🧭 Cognitive Science 101

**A One-Unit Introductory Course on How the Mind Works — Taught, Tutored, Drilled, and Graded by AI**

---

## 🧩 Overview

Cognitive Science 101 is a self-paced, single-user web course — a plain-language introduction to **how the mind works**: perception, memory, language, reasoning, machine minds, and consciousness. It assumes no prior coursework in the field, making it a fast, rigorous on-ramp for adults stepping into a new discipline.

The course teaches reasoning about the mind on an **inverted grading scale**. Most "critical thinking" rewards caution: the more hedged the answer, the safer it feels. Here, hedging is the failure mode. The **strongest, most-falsifiable conclusion the evidence supports about how the mind works earns top credit**; the cautious *"we can't really conclude anything / the brain is too complex"* dodge earns near-zero; florid padding that binds no evidence scores low; and a bold claim the evidence actively defeats also earns zero. Every question rewards committing to the richest supported conclusion while naming the cleanest disconfirming test.

The curriculum is organized into **one unit and 8 sections**: 1.1 What Cognitive Science Is; 1.2 The Big Idea: Mind as Information Processing; 1.3 Perception; 1.4 Memory; 1.5 Language and Thought; 1.6 Reasoning and Bias; 1.7 Brains and Machines; and 1.8 Consciousness.

Designed for **adults stepping into a new discipline — including graduate students and faculty who need a fast, rigorous on-ramp to cognitive science — alongside instructors evaluating AI-taught coursework and researchers studying AI academic integrity**, Cognitive Science 101 pairs a real curriculum with two layers of AI-authorship detection — surfacing not just *whether* the writing looks AI-generated, but whether the *act of producing it* did.

---

## 🧠 What It Does

- **One-Unit Structured Curriculum** — A complete plain-language cognitive science syllabus across 8 sections. Each section ships with a lesson and one graded homework. There is no separate test, midterm, or final — homework is the graded model.
- **Three-Depth Lessons** — Every lesson is available at **Short / Medium / Long** length, AI-rewritten while preserving the same examples and learning objectives.
- **Section-Scoped AI Tutor** — Ask a question about the paragraph you're reading and the answer streams back token-by-token, grounded in that exact lecture section. Suggested starter questions are pre-generated per lecture.
- **One Homework Per Section, Your Format** — Each section's homework is offered in three formats and you pick exactly one: **MCQ (long)**, **Hybrid (medium — multiple choice + short written)**, or **Written (short)**. You get a **single attempt** — it locks the moment you submit.
- **Inverted Partial-Credit Grading** — MC option weights act as data (one zero-credit dodge foil, plus a descending gradient of live options); written answers are scored against a yield/risk rubric with a penalty for claims the evidence defeats; hybrid blends both parts. Every item returns a written rationale.
- **Adaptive Topic Practice** — Generated scenario problem sets that move difficulty up after a streak and down after a miss, with explanations on every answer. Per-session difficulty persists.
- **Two-Layer AI Detection on Every Submission** — Each submitted answer is screened by both a static text classifier (GPTZero) and a diachronic keystroke-pattern detector, each with a human-readable rationale.
- **Four-Phase Diagnostic Assessments** — A single Scientific Reasoning instrument runs at four phases (baseline, two mid-course checkpoints, and after the unit) using a 3×3 menu of generated items, so reasoning growth can be tracked across the course. A configurable minimum-to-pass governs pass/fail.
- **Live Analytics** — Dashboard KPIs (attempts, accuracy, streak), per-section mastery percentages, and a recent-activity feed.
- **Operator Diagnostics** — One-click self-tests (system health and synthetic-student end-to-end run) verify the entire stack — database, OpenAI integration, GPTZero, detection pipeline, and the practice/grade loop.
- **Built-In Promo Video** — An animated promo that walks through the live product ships as its own artifact, so the course can show itself.

---

## ⚙️ Technical Features

- **Inverted Partial-Credit Grading Engine** —
  - **MC / Hybrid MC part:** each option carries a stored weight in `[0,1]`. Exactly one option is a zero-credit dodge (a claim the evidence defeats, or a non-committal refusal); the rest form a descending gradient (richest/most-falsifiable = `1.0`, weaker commitment = `0.6`, timid partial = `0.3`). Credit is the chosen option's weight.
  - **Written:** scored against a `{ modelAnswer, yieldAnchors, riskAnchors, defeatedBy }` rubric — credit rises with how much evidence the answer *binds* and how falsifiable a test it commits to, and falls for asserting claims the evidence defeats or for empty elaboration.
  - **Hybrid:** averages the MC and written parts. Section percent rolls up per item, and the course aggregate honors **configurable format point values**.
- **Two-Layer AI-Authorship Detection** —
  - **Static (GPTZero):** every submitted answer is sent to GPTZero; the per-document AI probability is blended with a structural heuristic. If GPTZero is unavailable, the system falls back to an LLM scorer plus heuristic — submissions never block.
  - **Diachronic (Keystroke Pattern):** the textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration, penalizing paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.
- **Single-Attempt Lock** — Starting a homework records the chosen format; submitting locks the attempt. A second start on a submitted assignment is rejected (HTTP 409) and the UI shows the locked result.
- **Diagnostic Self-Tests** —
  - **System Diagnostic** (`/diagnostics/system`): ordered checks — environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, AI-positive control sample, and GPTZero connectivity.
  - **Synthetic-Student Diagnostic** (`/diagnostics/synthetic-run`): spins up a fake student, runs a practice session, takes and submits a full homework attempt, and verifies grading + detection + analytics all reflect the run.
- **Contract-First API** — A single OpenAPI document is the source of truth; React Query hooks for the UI and Zod validators for the server are generated from it, so request and response shapes can't drift.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt so responses stay grounded in the lecture being read.
- **Adaptive Practice Engine** — Per-session difficulty (1–4 continuous) adjusts after each attempt; the next-problem generator takes current difficulty and section as input.
- **Real-React Demo Video** — The product walkthrough is a real React app exported as MP4 from a single browser tab.
- **Living README** — This README plus a companion `BLUEPRINT.md` architecture document are kept in lock-step with the code.

---

## 📊 Designed For

- **Adults New to the Field:** A complete, rigorous-yet-plain-language course on how the mind works — with on-demand tutoring and adaptive practice, no instructor required. Built for learners stepping into a new discipline, from graduate students to faculty.
- **Instructors & Curriculum Designers:** A working reference for what AI-taught, AI-graded, AI-detection-screened coursework looks like end-to-end.
- **Academic-Integrity Researchers:** A live testbed for layered AI-authorship detection combining text classification with behavioral keystroke evidence.
- **Product & Engineering Teams:** A reference implementation of contract-first full-stack architecture, streaming AI UX, and self-diagnostic operator tooling in a Replit pnpm monorepo.

---

## 💡 Core Idea

Cognitive Science 101 makes "learning how the mind works" an act of *committed reasoning*.

It doesn't reward the student for finding reasons to doubt — it rewards them for **committing to the strongest conclusion the evidence supports about the mind and naming the cleanest test that could prove them wrong.** The course teaches that, tutors it, drills it, grades it on an inverted partial-credit scale, screens submissions for misuse, and proves the whole pipeline still works with a single click.

**Cognitive Science 101 — where the strongest honest conclusion about how the mind works, not the safest hedge, earns the grade.**

---

## 🚀 Running It Yourself

This is a Replit pnpm monorepo. The two services that matter are the **course web app** (`artifacts/qr-course`) and the **API server** (`artifacts/api-server`); a promo video ships as a separate artifact (`artifacts/course-promo`).

### 1. Database

The app uses **PostgreSQL** via a `DATABASE_URL` connection string. Any standard Postgres works — Replit's built-in database or an external provider such as **Neon**. Set `DATABASE_URL` to your connection string (for managed providers like Neon, the password is part of that URL).

Before the first run, create the schema in your database:

```bash
pnpm --filter @workspace/db run push
```

This applies the Drizzle schema (`drizzle-kit push`). Then start (or restart) the API server: on boot it **seeds the full 8-section course automatically** into the existing tables. The seed self-heals, so updated content replaces stale content in an already-seeded database. (Schema creation is the `push` step above — it is **not** done automatically on boot, so skipping it against a fresh external database will fail before seeding.)

### 2. Required secrets

| Secret | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon or built-in). |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` | Powers lessons, the streaming tutor, grading, and practice generation. |
| `GPTZERO_API_KEY` | Static AI-authorship detection on submissions (falls back gracefully if absent). |
| `CLERK_*` keys | User authentication (Replit-managed Clerk). |
| `SESSION_SECRET` | Server session signing. |

### 3. Google login

Authentication is handled by **Replit-managed Clerk**, and the sign-in screen automatically renders whichever social providers are enabled. To turn on **Sign in with Google**, open the **Auth pane** in the workspace and enable the Google provider (you'll supply a Google OAuth Client ID/Secret from the Google Cloud Console, using the redirect URI shown in the Auth pane's *Provider setup*). No code change is required — the button appears as soon as the provider is enabled.

### 4. Verify the stack

Once secrets are set and the workflows are running, hit the operator self-tests to confirm everything is wired up:

- `GET /api/diagnostics/system` — environment, database round-trip, course-seed integrity, OpenAI chat + JSON mode, the detection pipeline, and GPTZero connectivity. A healthy stack returns `overall: true`.
- `POST /api/diagnostics/synthetic-run` — spins up a synthetic student and runs practice → homework → grading → detection → analytics end to end.
