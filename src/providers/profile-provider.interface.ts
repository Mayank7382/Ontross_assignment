import type { ProfileResponse } from "../schemas/profile.schema";

/**
 * ProfileProvider
 *
 * This interface is the seam between "how we expose profile data over HTTP"
 * and "where that profile data actually comes from."
 *
 * Today, the only implementation is MockProfileProvider, which returns
 * deterministic fixture data keyed off the public identifier in the URL.
 * This lets the full API surface (validation, auth, rate limiting,
 * response shape, error handling) be built and demoed end-to-end without
 * depending on LinkedIn's private/internal endpoints, which their User
 * Agreement prohibits accessing via automated means outside of their
 * official Partner Program.
 *
 * A production version of this service would implement this same interface
 * against LinkedIn's official Partner APIs (which require a signed
 * partnership agreement and OAuth) or a licensed third-party data provider
 * that has its own compliant agreement with LinkedIn. Swapping providers
 * requires no changes to routes, validation, or response schema — only a
 * new class that implements this interface and is wired up in
 * src/providers/index.ts.
 */
export interface ProfileProvider {
  /**
   * Resolve a LinkedIn profile URL into structured profile data.
   * Throws ProfileNotFoundError if no data is available for the identifier.
   */
  getProfileByUrl(url: string): Promise<ProfileResponse>;
}

export class ProfileNotFoundError extends Error {
  constructor(publicIdentifier: string) {
    super(`No profile data available for identifier "${publicIdentifier}"`);
    this.name = "ProfileNotFoundError";
  }
}

export class InvalidProfileUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProfileUrlError";
  }
}

/**
 * Extracts the public vanity identifier from a LinkedIn profile URL.
 * e.g. "https://www.linkedin.com/in/jane-doe-1234a5/" -> "jane-doe-1234a5"
 */
export function extractPublicIdentifier(url: string): string {
  const parsed = new URL(url);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const inIndex = segments.indexOf("in");

  if (inIndex === -1 || !segments[inIndex + 1]) {
    throw new InvalidProfileUrlError(
      `Could not find a public identifier in path "${parsed.pathname}". Expected a URL like https://www.linkedin.com/in/<identifier>/`
    );
  }

  return decodeURIComponent(segments[inIndex + 1]);
}
