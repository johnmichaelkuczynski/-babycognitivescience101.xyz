import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { storage } from "../lib/storage";

// Anonymous visitors may generate a limited amount of AI output before being
// required to sign in with Google. ~600 output tokens is roughly the
// equivalent of two paragraphs.
const FREE_TOKEN_LIMIT = 600;
const VISITOR_COOKIE = "cs101_vid";

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header || "").split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

/**
 * Gate AI-generating routes for anonymous visitors.
 *
 * - Authenticated users pass through unmetered.
 * - Anonymous visitors are identified by the same cookie the unique-visitor
 *   tracker uses. Once their accumulated AI output exceeds FREE_TOKEN_LIMIT,
 *   requests are rejected with 401 { code: "LOGIN_REQUIRED" } so the client
 *   can prompt a Google sign-in.
 * - Output is metered by wrapping res.write/res.end and estimating tokens as
 *   chars/4, which also covers SSE streaming responses.
 */
export const anonAiQuota: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Browsing (GET reads: course content, assignment lists, results) stays
    // free — only generation requests (POST/PUT/etc.) are gated and metered.
    if (req.method === "GET" || req.method === "HEAD") {
      next();
      return;
    }
    // Non-AI bookkeeping POSTs (starting an attempt, saving an answer) don't
    // invoke the model — don't gate or charge them.
    const p = req.path;
    if (/\/(start|answers?)(\/|$)/.test(p)) {
      next();
      return;
    }
    if (req.isAuthenticated && req.isAuthenticated()) {
      next();
      return;
    }

    const cookies = parseCookies(req.headers.cookie);
    let vid = cookies[VISITOR_COOKIE];
    if (!vid || !/^[A-Za-z0-9-]{16,64}$/.test(vid)) {
      vid = randomUUID();
      res.cookie(VISITOR_COOKIE, vid, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        maxAge: 2 * 365 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    const used = await storage.getAnonAiTokens(vid);
    if (used >= FREE_TOKEN_LIMIT) {
      res.status(401).json({
        error:
          "You've reached the free preview limit. Sign in with Google to keep going.",
        code: "LOGIN_REQUIRED",
      });
      return;
    }

    // Meter AI output produced by this request.
    let chars = 0;
    const origWrite = res.write.bind(res);
    const origEnd = res.end.bind(res);

    const countChunk = (chunk: unknown) => {
      if (typeof chunk === "string") chars += chunk.length;
      else if (Buffer.isBuffer(chunk)) chars += chunk.length;
    };

    res.write = ((chunk: any, ...args: any[]) => {
      countChunk(chunk);
      return (origWrite as any)(chunk, ...args);
    }) as typeof res.write;

    res.end = ((chunk?: any, ...args: any[]) => {
      countChunk(chunk);
      return (origEnd as any)(chunk, ...args);
    }) as typeof res.end;

    res.on("finish", () => {
      if (res.statusCode >= 400 || chars === 0) return;
      const tokens = Math.ceil(chars / 4);
      storage
        .addAnonAiTokens(vid!, tokens)
        .catch((err) => console.error("Anon AI metering error:", err));
    });

    next();
  } catch (err) {
    console.error("anonAiQuota error (failing open):", err);
    next();
  }
};
