import { z } from "zod";
import { supportedLanguages } from "@/lib/languages";
import type { Report } from "@/types/report";

const AttachmentTendencySchema = z.enum([
  "secure",
  "anxious",
  "fearful-avoidant",
  "dismissive-avoidant"
]);
const LoveLanguageSchema = z.enum([
  "quality_time",
  "words_of_affirmation",
  "acts_of_service",
  "physical_touch",
  "receiving_gifts"
]);
const EnergyStyleSchema = z.enum(["introverted", "extroverted", "ambiverted"]);
const ConflictPatternSchema = z.enum([
  "pursuer",
  "withdrawer",
  "disorganized",
  "collaborative"
]);
const ConfidenceLevelSchema = z.enum(["low", "medium", "high"]);
const SupportedLanguageSchema = z.enum(supportedLanguages);
const fallbackCertaintyByConfidence = {
  low: 30,
  medium: 60,
  high: 82
} as const;
const OptionalNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .optional()
  .or(z.literal("").transform(() => undefined));

const LabelWithConfidenceSchema = <TValue extends z.ZodEnum<[string, ...string[]]>>(
  valueSchema: TValue
) =>
  z.object({
    value: valueSchema,
    confidence: ConfidenceLevelSchema,
    certaintyPercent: z.number().int().min(0).max(99).optional()
  }).transform((label) => ({
    ...label,
    certaintyPercent:
      label.certaintyPercent ?? fallbackCertaintyByConfidence[label.confidence]
  }));

export const GenerateRequestSchema = z.object({
  answers: z
    .array(z.string())
    .length(10, "Exactly 10 answers are required."),
  includeOriginalAnswers: z.boolean().optional().default(false),
  recipientName: OptionalNameSchema,
  senderName: OptionalNameSchema,
  outputLanguage: SupportedLanguageSchema.optional().default("english")
});

export const ReportSchema: z.ZodType<Report, z.ZodTypeDef, unknown> = z.object({
  id: z.string(),
  recipientName: OptionalNameSchema,
  senderName: OptionalNameSchema,
  outputLanguage: SupportedLanguageSchema.optional().default("english"),
  title: z.string(),
  labels: z.object({
    attachmentTendency: LabelWithConfidenceSchema(AttachmentTendencySchema),
    primaryLoveLanguage: LabelWithConfidenceSchema(LoveLanguageSchema),
    energyStyle: LabelWithConfidenceSchema(EnergyStyleSchema),
    conflictPattern: LabelWithConfidenceSchema(ConflictPatternSchema)
  }),
  narrativeSections: z.object({
    whenStressed: z.string(),
    whenDistant: z.string(),
    whatMakesThemFeelLoved: z.string(),
    inConflict: z.string(),
    emotionalSafety: z.string(),
    culturalContext: z.string()
  }),
  partnerCheatSheet: z.object({
    doThis: z.array(z.string()),
    avoidThis: z.array(z.string()),
    inConflictDo: z.string(),
    toShowLoveDo: z.string()
  }),
  caveats: z.array(z.string()),
  originalAnswers: z
    .array(
      z.object({
        questionId: z.number(),
        question: z.string(),
        answer: z.string()
      })
    )
    .optional()
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type ValidatedReport = z.infer<typeof ReportSchema>;
