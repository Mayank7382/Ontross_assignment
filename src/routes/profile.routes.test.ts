import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const TEST_KEY = "test-key-123";

beforeAll(() => {
  process.env.API_KEYS = TEST_KEY;
});

describe("POST /v1/profile", () => {
  const app = createApp();

  it("returns 401 without an API key", async () => {
    const res = await request(app)
      .post("/v1/profile")
      .send({ url: "https://www.linkedin.com/in/jane-doe-1234a5/" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 for a non-LinkedIn URL", async () => {
    const res = await request(app)
      .post("/v1/profile")
      .set("Authorization", `Bearer ${TEST_KEY}`)
      .send({ url: "https://example.com/in/someone" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });

  it("returns 404 for a well-formed URL with no matching fixture", async () => {
    const res = await request(app)
      .post("/v1/profile")
      .set("Authorization", `Bearer ${TEST_KEY}`)
      .send({ url: "https://www.linkedin.com/in/nobody-here-000000/" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("PROFILE_NOT_FOUND");
  });

  it("returns structured profile data for a known fixture", async () => {
    const res = await request(app)
      .post("/v1/profile")
      .set("Authorization", `Bearer ${TEST_KEY}`)
      .send({ url: "https://www.linkedin.com/in/jane-doe-1234a5/" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Jane Doe");
    expect(res.body.publicIdentifier).toBe("jane-doe-1234a5");
    expect(Array.isArray(res.body.experience)).toBe(true);
    expect(res.body.meta.source).toBe("mock-provider");
  });
});

describe("GET /healthz", () => {
  it("returns 200 ok", async () => {
    const app = createApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
