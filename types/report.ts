export type AttachmentTendency =
  | "secure"
  | "anxious"
  | "fearful-avoidant"
  | "dismissive-avoidant";

export type LoveLanguage =
  | "quality_time"
  | "words_of_affirmation"
  | "acts_of_service"
  | "physical_touch"
  | "receiving_gifts";

export type EnergyStyle = "introverted" | "extroverted" | "ambiverted";

export type ConflictPattern =
  | "pursuer"
  | "withdrawer"
  | "disorganized"
  | "collaborative";

export type ConfidenceLevel = "low" | "medium" | "high";

export type LabelWithConfidence<TLabel extends string> = {
  value: TLabel;
  confidence: ConfidenceLevel;
};

export type ReportLabels = {
  attachmentTendency: LabelWithConfidence<AttachmentTendency>;
  primaryLoveLanguage: LabelWithConfidence<LoveLanguage>;
  energyStyle: LabelWithConfidence<EnergyStyle>;
  conflictPattern: LabelWithConfidence<ConflictPattern>;
};

export type NarrativeSections = {
  whenStressed: string;
  whenDistant: string;
  whatMakesThemFeelLoved: string;
  inConflict: string;
  emotionalSafety: string;
  culturalContext: string;
};

export type PartnerCheatSheet = {
  doThis: string[];
  avoidThis: string[];
  inConflictDo: string;
  toShowLoveDo: string;
};

export type Report = {
  id: string;
  title: string;
  labels: ReportLabels;
  narrativeSections: NarrativeSections;
  partnerCheatSheet: PartnerCheatSheet;
  caveats: string[];
};
