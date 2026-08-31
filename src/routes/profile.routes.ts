import { Router } from "express";
import { ProfileRequestSchema } from "../schemas/profile.schema";
import { fetchStructuredProfile } from "../services/profile.service";
import { ProfileNotFoundError, InvalidProfileUrlError } from "../providers";
import { sendError } from "../utils/errors";
import { requireApiKey } from "../middleware/auth";
import { profileRateLimiter } from "../middleware/rate-limit";

export const profileRouter = Router();

/**
 * POST /v1/profile
 * Body: { "url": "https://www.linkedin.com/in/<identifier>/" }
 *
 * Returns structured profile data for the given LinkedIn profile URL.
 * See README.md for full request/response documentation.
 */
profileRouter.post("/v1/profile", requireApiKey, profileRateLimiter, async (req, res) => {
  const parseResult = ProfileRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    sendError(
      res,
      400,
      "INVALID_REQUEST",
      parseResult.error.issues.map((i) => i.message).join("; ")
    );
    return;
  }

  try {
    const profile = await fetchStructuredProfile(parseResult.data.url);
    res.status(200).json(profile);
  } catch (err) {
    if (err instanceof ProfileNotFoundError) {
      sendError(res, 404, "PROFILE_NOT_FOUND", err.message);
      return;
    }
    if (err instanceof InvalidProfileUrlError) {
      sendError(res, 400, "INVALID_PROFILE_URL", err.message);
      return;
    }
    req.log?.error({ err }, "Unhandled error resolving profile");
    sendError(res, 500, "INTERNAL_ERROR", "Something went wrong while resolving this profile.");
  }
});
