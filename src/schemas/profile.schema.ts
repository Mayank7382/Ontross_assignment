import { z } from "zod";

/**
 * ProfileRequestSchema
 * Validates the incoming request body for POST /v1/profile
 */
export const ProfileRequestSchema = z.object({
  url: z
    .string()
    .url({ message: "url must be a valid absolute URL" })
    .refine(
      (val) => {
        try {
          const u = new URL(val);
          return /(^|\.)linkedin\.com$/i.test(u.hostname);
        } catch {
          return false;
        }
      },
      { message: "url must be a linkedin.com profile URL" }
    ),
});

export type ProfileRequest = z.infer<typeof ProfileRequestSchema>;

/**
 * Sub-schemas for each structured section of a profile.
 * Kept granular and exported individually so they can be reused,
 * unit-tested, and documented independently.
 */

export const ExperienceEntrySchema = z.object({
  title: z.string(),
  company: z.string(),
  companyLogoUrl: z.string().url().nullable(),
  employmentType: z.string().nullable(), // e.g. "Full-time", "Contract"
  location: z.string().nullable(),
  startDate: z.string().nullable(), // ISO "YYYY-MM" where known
  endDate: z.string().nullable(), // null means "Present"
  isCurrent: z.boolean(),
  description: z.string().nullable(),
});

export const EducationEntrySchema = z.object({
  school: z.string(),
  schoolLogoUrl: z.string().url().nullable(),
  degree: z.string().nullable(),
  fieldOfStudy: z.string().nullable(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  activities: z.string().nullable(),
});

export const SkillEntrySchema = z.object({
  name: z.string(),
  endorsementCount: z.number().int().nonnegative().nullable(),
});

export const CertificationEntrySchema = z.object({
  name: z.string(),
  issuingOrganization: z.string(),
  issueDate: z.string().nullable(),
  expirationDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().url().nullable(),
});

export const LanguageEntrySchema = z.object({
  name: z.string(),
  proficiency: z.string().nullable(), // e.g. "Native or bilingual proficiency"
});

export const ProfileImagesSchema = z.object({
  profilePictureUrl: z.string().url().nullable(),
  backgroundImageUrl: z.string().url().nullable(),
});

/**
 * ProfileResponseSchema
 * The full structured document returned for a resolved profile.
 */
export const ProfileResponseSchema = z.object({
  requestedUrl: z.string().url(),
  publicIdentifier: z.string(), // the vanity slug, e.g. "jane-doe-1234a5"
  name: z.string(),
  headline: z.string().nullable(),
  location: z.string().nullable(),
  about: z.string().nullable(),
  experience: z.array(ExperienceEntrySchema),
  education: z.array(EducationEntrySchema),
  skills: z.array(SkillEntrySchema),
  certifications: z.array(CertificationEntrySchema),
  languages: z.array(LanguageEntrySchema),
  images: ProfileImagesSchema,
  meta: z.object({
    source: z.enum(["mock-provider", "partner-api"]),
    fetchedAt: z.string().datetime(),
    isPartialData: z.boolean(),
  }),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
