import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(PORT, () => {
  logger.info(`linkedin-profile-api listening on port ${PORT}`);
});
