import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/errors";

/**
 * requireApiKey
 *
 * Simple bearer-style API key check. Expects header:
 *   Authorization: Bearer <API_KEY>
 *
 * Keys are compared against API_KEYS env var (comma-separated list),
 * so multiple consumers can each hold their own key without a database.
 * For a real production service, swap this for signed JWTs or a proper
 * key-management/identity provider - this is intentionally minimal.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const configuredKeys = (process.env.API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  // If no keys are configured at all, fail closed rather than open.
  if (configuredKeys.length === 0) {
    sendError(res, 500, "SERVER_MISCONFIGURED", "No API keys configured on the server.");
    return;
  }

  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token || !configuredKeys.includes(token)) {
    sendError(res, 401, "UNAUTHORIZED", "Missing or invalid API key.");
    return;
  }

  next();
}
