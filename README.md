# LinkedIn Profile API

A hosted HTTP API that accepts a LinkedIn profile URL and returns structured
JSON: name, headline, location, about, experience, education, skills,
certifications, languages, and profile images.

**Live URL:** `<fill in after deploying — see Deployment section>`
**Health check:** `GET /healthz`

---

## Important note on approach (read this first)

This service is built around a **provider abstraction** rather than a direct
scraper against LinkedIn's private/internal endpoints. The active
implementation, `MockProfileProvider`, returns realistic, schema-complete
fixture data for a small set of demo profiles.

This was a deliberate engineering decision, not a shortcut:

- LinkedIn's User Agreement prohibits scraping or accessing the platform
  through automated means outside of their official channels, and LinkedIn
  has actively pursued legal action against companies and individuals doing
  this (this is well-documented litigation, not a hypothetical risk).
- Building and hosting a public tool that authenticates as a real account and
  hits LinkedIn's internal (non-public) endpoints to bulk-extract profile
  data creates real legal and account-level exposure for whoever runs it,
  regardless of framing (personal project, take-home assignment, etc.) or
  which credentials are used.
- The correct way to get LinkedIn profile data programmatically and legally
  is LinkedIn's official **Partner Program APIs**, which require a signed
  partnership agreement and OAuth, or a licensed third-party data vendor with
  its own compliant agreement with LinkedIn.

Every other part of this system — HTTP API design, request validation,
auth, rate limiting, response schema, error handling, testing, deployment —
is built exactly as it would be for a production service. The **only**
component that differs from a "real" version is the data source, and the
codebase is structured (see [Architecture](#architecture)) so that swapping
in a real, compliant data source is a one-file change with zero impact on
the rest of the API.

If your evaluation specifically requires a direct-scraping implementation
against LinkedIn's endpoints, this repo intentionally does not provide
that — happy to discuss the reasoning further.

---

## Table of contents

- [Quick start](#quick-start)
- [Architecture](#architecture)
- [API documentation](#api-documentation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Possible next steps](#possible-next-steps)

---

## Quick start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Docker, if you want to run it containerized

### Local setup

```bash
git clone <your-repo-url>
cd linkedin-profile-api
npm install
cp .env.example .env
# Edit .env and set API_KEYS to something of your choosing, e.g.:
#   API_KEYS=dev-key-abc123
npm run dev
```

The server starts on `http://localhost:3000` by default.

### Try it

```bash
curl -X POST http://localhost:3000/v1/profile \
  -H "Authorization: Bearer dev-key-abc123" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.linkedin.com/in/jane-doe-1234a5/"}'
```

Two demo profiles are seeded in `src/data/mock-profiles.ts`:
- `https://www.linkedin.com/in/jane-doe-1234a5/` — full profile, all fields populated
- `https://www.linkedin.com/in/arjun-mehta-9b8c7d/` — partial profile, several fields null/empty (demonstrates graceful handling of missing data)

Any other LinkedIn URL will return a `404 PROFILE_NOT_FOUND`.

---

## Architecture

```
src/
├── server.ts                  # process entrypoint
├── app.ts                     # express app assembly (middleware + routes)
├── routes/
│   ├── profile.routes.ts      # POST /v1/profile
│   └── health.routes.ts       # GET /healthz
├── services/
│   └── profile.service.ts     # orchestration + response validation
├── providers/
│   ├── profile-provider.interface.ts   # the swappable contract
│   ├── mock-profile-provider.ts        # current implementation
│   └── index.ts                        # single wiring point
├── data/
│   └── mock-profiles.ts       # fixture data (fabricated, not real people)
├── schemas/
│   └── profile.schema.ts      # Zod schemas = request/response contract
├── middleware/
│   ├── auth.ts                # API key check
│   └── rate-limit.ts          # per-key rate limiting
└── utils/
    ├── errors.ts               # consistent error envelope + request IDs
    └── logger.ts                # structured logging (pino)
```

**Why a provider interface?** `ProfileProvider` (in
`src/providers/profile-provider.interface.ts`) defines one method,
`getProfileByUrl(url) => Promise<ProfileResponse>`. Everything above that
line — routing, auth, rate limiting, validation, error handling — has zero
knowledge of *how* the data is obtained. Today `getProfileProvider()` returns
a `MockProfileProvider`. A production deployment would add a
`PartnerApiProfileProvider` implementing the same interface against
LinkedIn's official API, or against a licensed vendor, and change one line in
`src/providers/index.ts`. This is the same pattern you'd use for a payments
provider, an email provider, or any external dependency you expect to swap
or mock — it's not scraping-specific.

**Why validate the response with Zod, not just the request?** The schema in
`profile.schema.ts` is asserted against on the way *out* of
`profile.service.ts`, not just the way in. This means if a future provider
implementation returns malformed or unexpected data, the service fails
loudly with a 500 rather than silently shipping bad data to a client.

---

## API documentation

### Authentication

All endpoints except `/healthz` require an API key:

```
Authorization: Bearer <your-api-key>
```

Keys are configured via the `API_KEYS` environment variable (comma-separated
for multiple keys). There is no user database — this is a single-tenant,
key-based scheme appropriate for a demo/portfolio service.

### `POST /v1/profile`

**Request body**

```json
{
  "url": "https://www.linkedin.com/in/jane-doe-1234a5/"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `url` | string | yes | Must be an absolute URL on a `linkedin.com` host, containing `/in/<identifier>` |

**Success response — `200 OK`**

```json
{
  "requestedUrl": "https://www.linkedin.com/in/jane-doe-1234a5/",
  "publicIdentifier": "jane-doe-1234a5",
  "name": "Jane Doe",
  "headline": "Senior Software Engineer at Acme Corp | Distributed Systems",
  "location": "Bengaluru, Karnataka, India",
  "about": "Backend engineer with 8+ years building high-throughput distributed systems...",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Acme Corp",
      "companyLogoUrl": "https://example.com/logos/acme.png",
      "employmentType": "Full-time",
      "location": "Bengaluru, Karnataka, India",
      "startDate": "2022-03",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading the platform reliability team..."
    }
  ],
  "education": [
    {
      "school": "National Institute of Technology",
      "schoolLogoUrl": "https://example.com/logos/nit.png",
      "degree": "Bachelor of Technology",
      "fieldOfStudy": "Computer Science",
      "startYear": 2015,
      "endYear": 2019,
      "activities": "ACM student chapter, competitive programming club"
    }
  ],
  "skills": [
    { "name": "Distributed Systems", "endorsementCount": 42 }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect – Associate",
      "issuingOrganization": "Amazon Web Services",
      "issueDate": "2023-01",
      "expirationDate": "2026-01",
      "credentialId": "AWS-SAA-000000",
      "credentialUrl": "https://example.com/verify/aws-saa-000000"
    }
  ],
  "languages": [
    { "name": "English", "proficiency": "Full professional proficiency" }
  ],
  "images": {
    "profilePictureUrl": "https://example.com/avatars/jane-doe.jpg",
    "backgroundImageUrl": "https://example.com/backgrounds/jane-doe.jpg"
  },
  "meta": {
    "source": "mock-provider",
    "fetchedAt": "2026-08-28T10:15:00.000Z",
    "isPartialData": false
  }
}
```

Every field that can legitimately be absent on a real profile (`about`,
`companyLogoUrl`, `endorsementCount`, etc.) is typed as nullable rather than
omitted, so consumers can rely on a stable shape.

**Error responses**

All errors share one envelope:

```json
{
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "No profile data available for identifier \"nobody-here\"",
    "requestId": "aB3xQ9zK1m"
  }
}
```

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_REQUEST` | Body fails schema validation (missing/malformed `url`) |
| 400 | `INVALID_PROFILE_URL` | URL is a linkedin.com URL but has no parseable `/in/<id>` segment |
| 401 | `UNAUTHORIZED` | Missing/invalid API key |
| 404 | `PROFILE_NOT_FOUND` | Well-formed URL, no data available for that identifier |
| 429 | `RATE_LIMITED` | Too many requests from this key/IP in the current window |
| 500 | `INTERNAL_ERROR` | Unexpected server-side failure |

### `GET /healthz`

No auth required. Returns `{ "status": "ok", "uptimeSeconds": <number> }`.
Used by the hosting platform's health checks.

---

## Configuration

All configuration is via environment variables — see `.env.example` for the
full list with defaults and comments. Key ones:

| Variable | Purpose |
|---|---|
| `API_KEYS` | Comma-separated valid API keys |
| `PORT` | Port to listen on |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Rate limiting window/threshold |
| `PROFILE_PROVIDER` | Which provider implementation to use (currently only `mock`) |

**No secrets are committed to this repository.** `.env` is gitignored;
`.env.example` contains only placeholder values.

---

## Testing

```bash
npm test
```

Tests use Vitest + Supertest and cover: auth rejection, request validation,
not-found handling, and the full happy-path response shape. See
`src/routes/profile.routes.test.ts`.

---

## Deployment

This repo includes a multi-stage `Dockerfile` and a `render.yaml` for
one-click deployment to [Render](https://render.com), but any platform that
runs a Docker container or a plain Node process (Fly.io, Railway, a VPS,
etc.) works.

### Deploy to Render

1. Push this repo to GitHub.
2. In Render, choose **New → Blueprint**, point it at the repo — `render.yaml` configures the service automatically.
3. Set the `API_KEYS` environment variable in the Render dashboard (marked `sync: false` in `render.yaml` so it's not stored in the repo/blueprint).
4. Deploy. Render provides HTTPS automatically on the `*.onrender.com` domain.

### Deploy anywhere else with Docker

```bash
docker build -t linkedin-profile-api .
docker run -p 3000:3000 --env-file .env linkedin-profile-api
```

Put this behind any HTTPS-terminating reverse proxy or platform load
balancer (the app itself serves plain HTTP; TLS termination is expected to
happen at the platform/proxy layer, which is standard practice).

---

## Known limitations

- **Data source is a small fixture set, not live LinkedIn data.** See the
  note at the top of this README for why, and see
  `src/providers/profile-provider.interface.ts` for exactly where a
  compliant real data source would be wired in.
- **No pagination** on list fields (experience, education, etc.) — profiles
  with very long histories return everything in one response. For a real
  provider backed by a paginated upstream API, this would need to change.
- **Single-tenant API key auth**, not OAuth or per-user scoping. Fine for a
  demo; not what you'd want for a multi-customer product.
- **No caching layer.** A real provider (partner API or licensed vendor)
  would likely have its own rate limits, so a caching layer (Redis, etc.)
  in front of `profile.service.ts` would be a near-term addition.
- **No persistent storage.** Nothing is written to a database; every request
  is resolved fresh from the provider.

## Possible next steps

- Implement `PartnerApiProfileProvider` against LinkedIn's official Partner
  API once/if partner access is available, or against a licensed
  data-as-a-service vendor.
- Add a caching layer with configurable TTL per field group (e.g. images
  cached longer than experience).
- Add OpenAPI/Swagger generation directly from the Zod schemas.
- Add per-key usage metrics/dashboards.
