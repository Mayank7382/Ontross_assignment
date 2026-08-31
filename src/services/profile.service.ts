import { getProfileProvider } from "../providers";
import { ProfileResponseSchema, type ProfileResponse } from "../schemas/profile.schema";

const provider = getProfileProvider();

/**
 * fetchStructuredProfile
 *
 * Thin orchestration layer: delegates to the active provider, then
 * validates the result against ProfileResponseSchema before it ever
 * reaches an HTTP response. This guarantees that regardless of which
 * provider is wired in, malformed data can never leak out to a client -
 * it fails loudly server-side instead.
 */
export async function fetchStructuredProfile(url: string): Promise<ProfileResponse> {
  const raw = await provider.getProfileByUrl(url);
  return ProfileResponseSchema.parse(raw);
}
