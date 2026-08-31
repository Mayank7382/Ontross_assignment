import rateLimit from "express-rate-limit";
import { sendError } from "../utils/errors";

/**
 * Applies a per-API-key (falling back to per-IP) rate limit to protect
 * the service from abuse. Limits are intentionally conservative for a
 * demo/portfolio deployment; tune via env vars for real usage.
 */
export const profileRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  limit: Number(process.env.RATE_LIMIT_MAX ?? 30),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const header = req.header("authorization") ?? "";
    const [, token] = header.split(" ");
    return token || req.ip || "unknown";
  },
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "RATE_LIMITED",
      "Too many requests. Please slow down and retry after the rate limit window resets."
    );
  },
});
