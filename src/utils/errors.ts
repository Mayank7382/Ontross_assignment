import type { Response } from "express";
import { nanoid } from "nanoid";
import type { ErrorResponse } from "../schemas/profile.schema";

/**
 * sendError
 *
 * Consistent error envelope across the whole API, with a requestId
 * attached so a caller can reference a specific failed request when
 * reporting issues (and so server logs can be correlated to it).
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  const body: ErrorResponse = {
    error: {
      code,
      message,
      requestId: nanoid(10),
    },
  };
  res.status(statusCode).json(body);
}
