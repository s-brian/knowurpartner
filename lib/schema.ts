import { z } from "zod";
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

const LabelWithConfidenceSchema = <TValue extends z.ZodEnum<[string, ...string[]]>>(
  valueSchema: TValue
) =>
  z.object({
    value: valueSchema,
    confidence: ConfidenceLevelSchema
  });

export const GenerateRequestSchema = z.object({
  answers: z
    .array(z.string())
    .length(10, "Exactly 10 answers are required.")
});

export const ReportSchema: z.ZodType<Report> = z.object({
  id: z.string(),
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
  caveats: z.array(z.string())
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
export type ValidatedReport = z.infer<typeof ReportSchema>;
