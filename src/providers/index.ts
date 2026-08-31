import type { ProfileProvider } from "./profile-provider.interface";
import { MockProfileProvider } from "./mock-profile-provider";

/**
 * getProfileProvider
 *
 * Single wiring point for which ProfileProvider implementation is active.
 * A future PartnerApiProfileProvider (implementing the same interface
 * against LinkedIn's official Partner API, or a licensed data vendor)
 * would be selected here based on an environment variable, e.g.:
 *
 *   const providerName = process.env.PROFILE_PROVIDER ?? "mock";
 *   if (providerName === "partner-api") return new PartnerApiProfileProvider(...);
 *
 * No other file in the codebase needs to change to make that swap.
 */
export function getProfileProvider(): ProfileProvider {
  return new MockProfileProvider();
}

export * from "./profile-provider.interface";
