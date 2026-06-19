---
name: Course content & branding rules
description: Standing project-wide rules for how the course/app is named, described, and promoted (audience tone, banned words, YouTube title format).
---

Standing rules that apply EVERYWHERE in this project (UI copy, README/BLUEPRINT, landing page, meta tags, promo video, YouTube description). These came from repeated, emphatic user corrections — violate them and the work gets rejected.

**Rule:**
- Audience is ADULTS — grad students and faculty entering a new discipline. The course is "basic" but SUBSTANTIAL. NEVER use "baby", "child", "children", "kid", or "kid-friendly" (unless the subject matter itself genuinely requires the word).
- Do NOT lead with or sell on the absence of prerequisites: no "No math!", "No coding!", "kid-friendly!" framing. Lead with substance.
- NEVER reference the prior course or any "California Critical Thinking / CCTST / Professional Judgment / critical thinking" branding. (Quoting the phrase "critical thinking" only to describe what the inverted grading *inverts* is fine; naming it as the course's subject is not.)
- App name must be literal/utilitarian, never goofy/cute ("Baby X" → "Basic X" or just the field name). Current app name is "Cognitive Science 101".
- YouTube app-title line MUST be exactly `X — AI-Powered Course` (em dash), e.g. `Cognitive Science 101 — AI-Powered Course` — no extra descriptors.
- The promo video must SHOW THE ACTUAL PRODUCT/functionality (real app screens, the wealth of content) — never abstract taglines and never generic pop-science demos (illusions, brain-teasers). Two prior promos were rejected for being too abstract, then too generic.

**Why:** The user was furious multiple times; these are explicit mandates, not preferences to weigh.

**How to apply:** Before shipping ANY copy/branding/promo change, grep the repo for `baby|child|children|kid|middle school|no math|no coding|cctst|critical thinking` and confirm each hit is a false positive (e.g. React `children` prop, or the documented inverted-grading quote). Video-js artifacts are NON-deployable: presentArtifact only, never suggestDeploy.
