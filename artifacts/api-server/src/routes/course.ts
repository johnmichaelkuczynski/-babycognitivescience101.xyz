import { Router, type IRouter } from "express";
import { eq, asc, sql } from "drizzle-orm";
import {
  db,
  topicsTable,
  lecturesTable,
  assignmentsTable,
  attemptsTable,
} from "@workspace/db";
import {
  GetCourseOverviewResponse,
  GetWeekResponse,
  GetLectureResponse,
  ListTopicsResponse,
  RewriteLectureBody,
  GetCourseSettingsResponse,
} from "@workspace/api-zod";
import { chatText } from "../lib/ai";
import { getCourseSettings } from "../lib/settings";
import PDFDocument from "pdfkit";
import { SECTIONS, type HomeworkItem } from "../lib/homeworkContent";

const router: IRouter = Router();

const WEEK_TITLES: Record<number, { title: string; summary: string }> = {
  1: {
    title: "Cognitive Science 101",
    summary:
      "A one-unit course on how the mind works — treating the mind as information processing across perception, memory, language, reasoning and bias, machine minds, and consciousness.",
  },
};

async function buildWeek(weekNumber: number) {
  const lectures = await db
    .select({
      id: lecturesTable.id,
      title: lecturesTable.title,
      topicId: lecturesTable.topicId,
    })
    .from(lecturesTable)
    .where(eq(lecturesTable.weekNumber, weekNumber))
    .orderBy(asc(lecturesTable.id));

  const assignments = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.weekNumber, weekNumber))
    .orderBy(asc(assignmentsTable.position));

  const assignmentSummaries = await Promise.all(
    assignments.map(async (a) => {
      // Count problems per format; a single attempt locks one format, so the
      // representative item count is the chosen format's (or mcq before choice).
      const counts = await db.execute(
        sql`select format, count(*)::int as n from problems where assignment_id = ${a.id} group by format`,
      );
      const byFormat: Record<string, number> = {};
      for (const row of counts.rows as { format?: string; n?: number }[]) {
        if (row.format) byFormat[row.format] = row.n ?? 0;
      }
      const attempts = await db
        .select()
        .from(attemptsTable)
        .where(eq(attemptsTable.assignmentId, a.id))
        .orderBy(asc(attemptsTable.id));
      const submitted = attempts.filter((x) => x.status === "submitted");
      const inProgress = attempts.find((x) => x.status === "in_progress");
      const best = submitted.reduce(
        (best, x) =>
          x.scorePercent != null && x.scorePercent > best ? x.scorePercent : best,
        -1,
      );
      const status: "not_started" | "in_progress" | "submitted" = inProgress
        ? "in_progress"
        : submitted.length > 0
        ? "submitted"
        : "not_started";
      const last = attempts[attempts.length - 1];
      const chosenFormat =
        last?.format === "mcq" || last?.format === "hybrid" || last?.format === "written"
          ? last.format
          : null;
      const n = chosenFormat ? byFormat[chosenFormat] ?? 0 : byFormat.mcq ?? 0;
      return {
        id: a.id,
        kind: a.kind as "homework" | "test" | "midterm" | "final",
        title: a.title,
        weekNumber: a.weekNumber,
        problemCount: n,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        status,
        bestScore: best < 0 ? null : best,
        lastAttemptId: last?.id ?? null,
        chosenFormat,
      };
    }),
  );

  const meta = WEEK_TITLES[weekNumber] ?? {
    title: `Week ${weekNumber}`,
    summary: "",
  };

  return {
    weekNumber,
    title: meta.title,
    summary: meta.summary,
    lectures,
    assignments: assignmentSummaries,
  };
}

router.get("/course/overview", async (_req, res) => {
  const weeks = await Promise.all([1].map(buildWeek));
  const assignmentsTotal = weeks.reduce((s, w) => s + w.assignments.length, 0);
  const assignmentsCompleted = weeks.reduce(
    (s, w) => s + w.assignments.filter((a) => a.status === "submitted").length,
    0,
  );
  const practiceCountRow = await db.execute(
    sql`select count(*)::int as n from practice_attempts`,
  );
  const practiceCount =
    (practiceCountRow.rows[0] as { n?: number } | undefined)?.n ?? 0;

  res.json(
    GetCourseOverviewResponse.parse({
      title: "Cognitive Science 101",
      weeks,
      totals: { assignmentsCompleted, assignmentsTotal, practiceCount },
    }),
  );
});

router.get("/course/weeks/:weekNumber", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.weekNumber)
    ? req.params.weekNumber[0]
    : req.params.weekNumber;
  const weekNumber = parseInt(raw ?? "", 10);
  if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 1) {
    res.status(400).json({ error: "invalid weekNumber" });
    return;
  }
  const week = await buildWeek(weekNumber);
  res.json(GetWeekResponse.parse(week));
});

router.get("/course/lectures/:lectureId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.lectureId)
    ? req.params.lectureId[0]
    : req.params.lectureId;
  const lectureId = parseInt(raw ?? "", 10);
  if (!Number.isFinite(lectureId)) {
    res.status(400).json({ error: "invalid lectureId" });
    return;
  }
  const [lecture] = await db
    .select()
    .from(lecturesTable)
    .where(eq(lecturesTable.id, lectureId));
  if (!lecture) {
    res.status(404).json({ error: "lecture not found" });
    return;
  }
  res.json(GetLectureResponse.parse(lecture));
});

function parseLectureId(req: { params: { lectureId?: string | string[] } }): number | null {
  const raw = Array.isArray(req.params.lectureId)
    ? req.params.lectureId[0]
    : req.params.lectureId;
  if (!raw || !/^\d+$/.test(raw)) return null;
  const lectureId = parseInt(raw, 10);
  return Number.isFinite(lectureId) ? lectureId : null;
}

// Rewrite a lecture from the student's own instruction (more examples on a
// point, a clearer illustration of a principle, shorter sentences, etc.). The
// result is persisted as the lecture's custom version so it survives reloads
// and can be refined further.
router.post(
  "/course/lectures/:lectureId/rewrite",
  async (req, res): Promise<void> => {
    const lectureId = parseLectureId(req);
    if (lectureId === null) {
      res.status(400).json({ error: "invalid lectureId" });
      return;
    }
    const parsed = RewriteLectureBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const instruction = parsed.data.instruction.trim();
    const baseLevel = parsed.data.baseLevel ?? "short";

    const [lecture] = await db
      .select()
      .from(lecturesTable)
      .where(eq(lecturesTable.id, lectureId));
    if (!lecture) {
      res.status(404).json({ error: "lecture not found" });
      return;
    }

    // Pick the version to rewrite from. Fall back to the short body whenever the
    // requested base hasn't been generated yet.
    const base =
      baseLevel === "long"
        ? lecture.bodyLong
        : baseLevel === "medium"
          ? lecture.bodyMedium
          : baseLevel === "custom"
            ? lecture.bodyCustom
            : lecture.body;
    const sourceBody = (base && base.trim().length > 0 ? base : lecture.body).trim();

    const sys =
      "You are an instructor of an introductory cognitive science course revising your own lecture at a student's request. " +
      "You are given the CURRENT lecture and ONE instruction from the student about how to revise it. " +
      "Apply the instruction faithfully. ABSOLUTE RULES, no exceptions:\n" +
      "1. KEEP every concept, claim, and learning objective from the current lecture. Never drop material or change what the lecture teaches — only adjust how it is presented per the instruction.\n" +
      "2. Preserve the existing examples; you may add to or clarify them, but do not silently replace them with different ones unless the instruction explicitly asks you to.\n" +
      "3. Keep headings and section order intact. You may add sub-sections (e.g. extra examples) when the instruction calls for it.\n" +
      "4. Stay accurate to the source material and to cognitive science as a subject. Do not invent fake facts, citations, or quotations.\n" +
      "5. Use clear Markdown. Use $...$ for any inline math.\n" +
      "6. Return ONLY the rewritten Markdown lecture body — no preface, no commentary, no surrounding code fences.";
    const user =
      `LECTURE TITLE: ${lecture.title}\n\n` +
      `STUDENT INSTRUCTION:\n"""\n${instruction}\n"""\n\n` +
      `CURRENT LECTURE:\n"""\n${sourceBody}\n"""`;

    let rewritten = "";
    try {
      rewritten = (await chatText(sys, user)).trim();
    } catch {
      res
        .status(502)
        .json({ error: "The rewrite service is unavailable right now. Please try again in a moment." });
      return;
    }
    // Guard against an empty / truncated response clobbering the lecture.
    if (rewritten.length < Math.min(200, sourceBody.length * 0.4)) {
      res.status(502).json({
        error: "The model returned an unusable rewrite — please rephrase your instruction and try again.",
      });
      return;
    }

    const [updated] = await db
      .update(lecturesTable)
      .set({ bodyCustom: rewritten, customInstruction: instruction })
      .where(eq(lecturesTable.id, lectureId))
      .returning();
    res.json(GetLectureResponse.parse(updated));
  },
);

// Discard a lecture's custom rewrite and revert to the original.
router.delete(
  "/course/lectures/:lectureId/rewrite",
  async (req, res): Promise<void> => {
    const lectureId = parseLectureId(req);
    if (lectureId === null) {
      res.status(400).json({ error: "invalid lectureId" });
      return;
    }
    const [updated] = await db
      .update(lecturesTable)
      .set({ bodyCustom: null, customInstruction: null })
      .where(eq(lecturesTable.id, lectureId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "lecture not found" });
      return;
    }
    res.json(GetLectureResponse.parse(updated));
  },
);

// ---------------------------------------------------------------------------
// Downloadable course PDF: short lectures + practice homework + practice exam.
// Built from the course's authored content; no AI calls, free to download.
// ---------------------------------------------------------------------------

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "•  ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

function renderItem(
  doc: PDFKit.PDFDocument,
  n: number,
  item: HomeworkItem,
): void {
  doc.font("Times-Bold").fontSize(11).text(`Problem ${n}.`, { paragraphGap: 2 });
  doc.font("Times-Roman").fontSize(11).text(stripMarkdown(item.prompt), {
    paragraphGap: 4,
  });
  if (item.mcOptions && item.mcOptions.length > 0) {
    item.mcOptions.forEach((opt, i) => {
      doc.text(`   ${String.fromCharCode(65 + i)}. ${opt.text}`, {
        paragraphGap: 1,
      });
    });
  }
  if (item.writtenRubric?.prompt) {
    doc
      .font("Times-Italic")
      .text(`Written follow-up: ${item.writtenRubric.prompt}`, {
        paragraphGap: 2,
      });
  }
  doc.moveDown(0.6);
}

function itemToText(n: number, item: HomeworkItem): string {
  let out = `Problem ${n}. ${stripMarkdown(item.prompt)}\n`;
  if (item.mcOptions && item.mcOptions.length > 0) {
    item.mcOptions.forEach((opt, i) => {
      out += `   ${String.fromCharCode(65 + i)}. ${opt.text}\n`;
    });
  }
  if (item.writtenRubric?.prompt) {
    out += `   Written follow-up: ${item.writtenRubric.prompt}\n`;
  }
  return out;
}

router.get("/course/download.txt", async (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Cognitive-Science-101-Course.txt"',
  );

  const divider = "=".repeat(72);
  const lines: string[] = [];
  lines.push(divider, "COGNITIVE SCIENCE 101", "A one-unit introductory course on how the mind works.", divider, "");
  lines.push("TOPICS COVERED", "");
  SECTIONS.forEach((s, i) => lines.push(`${i + 1}. ${s.title}`));
  lines.push(
    "",
    "This file contains the short version of every lecture, practice homework problems for each section, and a practice exam. The full course — AI tutoring, graded homework in three formats, adaptive practice, and analytics — is available online.",
    "",
  );

  for (const [i, s] of SECTIONS.entries()) {
    lines.push(divider, `SECTION ${i + 1}: ${s.title.toUpperCase()}`, divider, "");
    lines.push(stripMarkdown(s.blurb), "");
    lines.push(stripMarkdown(s.lectureTitle), "");
    lines.push(stripMarkdown(s.body), "");
    const items: HomeworkItem[] = [
      ...s.homework.mcq.slice(0, 2),
      ...s.homework.written.slice(0, 1),
    ];
    if (items.length > 0) {
      lines.push("PRACTICE HOMEWORK", "");
      items.forEach((item, n) => lines.push(itemToText(n + 1, item)));
    }
  }

  const examItems = SECTIONS.map((s) => s.homework.mcq[2] ?? s.homework.mcq[0]).filter(
    (x): x is HomeworkItem => Boolean(x),
  );
  lines.push(divider, "PRACTICE EXAM", divider, "");
  lines.push(
    "One question from each section. For multiple-choice questions, pick the answer that commits to the strongest conclusion the evidence supports.",
    "",
  );
  examItems.forEach((item, n) => lines.push(itemToText(n + 1, item)));

  lines.push(divider, "PRACTICE EXAM — ANSWER GUIDE", divider, "");
  examItems.forEach((item, n) => {
    lines.push(`Problem ${n + 1}.`);
    lines.push(`Best answer: ${stripMarkdown(item.correctAnswer)}`);
    lines.push(stripMarkdown(item.explanation), "");
  });

  res.send(lines.join("\n"));
});

router.get("/course/download.pdf", async (_req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Cognitive-Science-101-Course.pdf"',
  );

  const doc = new PDFDocument({ size: "LETTER", margin: 60, bufferPages: true });
  doc.pipe(res);

  // ----- Title page -----
  doc.font("Times-Bold").fontSize(30).text("Cognitive Science 101", { align: "center" });
  doc.moveDown(0.5);
  doc
    .font("Times-Roman")
    .fontSize(13)
    .text(
      "A one-unit introductory course on how the mind works.",
      { align: "center" },
    );
  doc.moveDown(2);
  doc.font("Times-Bold").fontSize(15).text("Topics Covered");
  doc.moveDown(0.5);
  doc.font("Times-Roman").fontSize(12);
  SECTIONS.forEach((s, i) => {
    doc.text(`${i + 1}.  ${s.title}`, { paragraphGap: 3 });
  });
  doc.moveDown(1.5);
  doc
    .fontSize(10)
    .fillColor("#555555")
    .text(
      "This booklet contains the short version of every lecture, practice homework problems for each section, and a practice exam. The full course — AI tutoring, graded homework in three formats, adaptive practice, and analytics — is available online.",
    )
    .fillColor("#000000");

  // ----- Lectures + practice homework -----
  for (const [i, s] of SECTIONS.entries()) {
    doc.addPage();
    doc.font("Times-Bold").fontSize(18).text(`Section ${i + 1}: ${s.title}`);
    doc.moveDown(0.3);
    doc.font("Times-Italic").fontSize(11).text(stripMarkdown(s.blurb));
    doc.moveDown(0.8);
    doc.font("Times-Bold").fontSize(13).text(stripMarkdown(s.lectureTitle));
    doc.moveDown(0.4);
    doc
      .font("Times-Roman")
      .fontSize(11)
      .text(stripMarkdown(s.body), { paragraphGap: 6, lineGap: 2 });

    // A few practice homework problems per section.
    const items: HomeworkItem[] = [
      ...s.homework.mcq.slice(0, 2),
      ...s.homework.written.slice(0, 1),
    ];
    if (items.length > 0) {
      doc.moveDown(1);
      doc.font("Times-Bold").fontSize(14).text("Practice Homework");
      doc.moveDown(0.4);
      items.forEach((item, n) => renderItem(doc, n + 1, item));
    }
  }

  // ----- Practice exam -----
  doc.addPage();
  doc.font("Times-Bold").fontSize(18).text("Practice Exam");
  doc.moveDown(0.3);
  doc
    .font("Times-Roman")
    .fontSize(11)
    .text(
      "One question from each section. Answer every question. For multiple-choice questions, pick the answer that commits to the strongest conclusion the evidence supports.",
    );
  doc.moveDown(0.8);
  const examItems = SECTIONS.map((s) => s.homework.mcq[2] ?? s.homework.mcq[0]).filter(
    (x): x is HomeworkItem => Boolean(x),
  );
  examItems.forEach((item, n) => renderItem(doc, n + 1, item));

  // ----- Answer key -----
  doc.addPage();
  doc.font("Times-Bold").fontSize(18).text("Practice Exam — Answer Guide");
  doc.moveDown(0.5);
  examItems.forEach((item, n) => {
    doc.font("Times-Bold").fontSize(11).text(`Problem ${n + 1}.`, { paragraphGap: 2 });
    doc
      .font("Times-Roman")
      .fontSize(11)
      .text(`Best answer: ${stripMarkdown(item.correctAnswer)}`, { paragraphGap: 2 });
    doc
      .font("Times-Italic")
      .fontSize(10)
      .text(stripMarkdown(item.explanation), { paragraphGap: 6 });
  });

  doc.end();
});

router.get("/course/settings", async (_req, res) => {
  const settings = await getCourseSettings();
  res.json(GetCourseSettingsResponse.parse(settings));
});

router.get("/course/topics", async (_req, res) => {
  const rows = await db
    .select()
    .from(topicsTable)
    .orderBy(asc(topicsTable.position));
  res.json(ListTopicsResponse.parse(rows));
});

export default router;
