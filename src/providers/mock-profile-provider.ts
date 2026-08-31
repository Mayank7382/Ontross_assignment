import type { ProfileProvider } from "./profile-provider.interface";
import { extractPublicIdentifier, ProfileNotFoundError } from "./profile-provider.interface";
import type { ProfileResponse } from "../schemas/profile.schema";
import { MOCK_PROFILES } from "../data/mock-profiles";

/**
 * MockProfileProvider
 *
 * Resolves profile data from a small in-memory fixture set rather than
 * from LinkedIn directly. See profile-provider.interface.ts for why.
 *
 * Simulates realistic network latency so downstream timeout/error handling
 * can be exercised honestly rather than resolving instantly.
 */
export class MockProfileProvider implements ProfileProvider {
  private readonly simulatedLatencyMs: number;

  constructor(options?: { simulatedLatencyMs?: number }) {
    this.simulatedLatencyMs = options?.simulatedLatencyMs ?? 300;
  }

  async getProfileByUrl(url: string): Promise<ProfileResponse> {
    const publicIdentifier = extractPublicIdentifier(url);

    await this.delay(this.simulatedLatencyMs);

    const fixture = MOCK_PROFILES[publicIdentifier];
    if (!fixture) {
      throw new ProfileNotFoundError(publicIdentifier);
    }

    return {
      requestedUrl: url,
      ...fixture,
      meta: {
        source: "mock-provider",
        fetchedAt: new Date().toISOString(),
        isPartialData: false,
      },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
