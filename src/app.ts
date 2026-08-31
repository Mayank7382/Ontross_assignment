import express from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import { profileRouter } from "./routes/profile.routes";
import { healthRouter } from "./routes/health.routes";
import { sendError } from "./utils/errors";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));
  app.use(pinoHttp({ logger }));

  app.use(healthRouter);
  app.use(profileRouter);

  // 404 fallback
  app.use((_req, res) => {
    sendError(res, 404, "NOT_FOUND", "This route does not exist.");
  });

  return app;
}
