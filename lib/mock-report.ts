import type { Report } from "@/types/report";

export const mockReport: Report = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "A letter for you, from what they shared",
  labels: {
    attachmentTendency: {
      value: "secure",
      confidence: "medium"
    },
    primaryLoveLanguage: {
      value: "quality_time",
      confidence: "high"
    },
    energyStyle: {
      value: "ambiverted",
      confidence: "medium"
    },
    conflictPattern: {
      value: "collaborative",
      confidence: "medium"
    }
  },
  narrativeSections: {
    whenStressed:
      "They sound like someone who settles when you stay steady: a clear check-in, a little help offered without taking the whole thing out of their hands.",
    whenDistant:
      "If they go quiet, it might be their way of sorting thoughts before words. A soft invite to talk later can land better than a push for an answer right now.",
    whatMakesThemFeelLoved:
      "Protected time together, small follow-throughs, and proof you were listening seem to matter a lot. The little repeats of care add up fast.",
    inConflict:
      "Calm wording, a real repair gesture, and a shared look at what happens next seem to help them come back to center.",
    emotionalSafety:
      "Consistency, room to be honest, and the sense that a rough day does not erase the love between you are probably big pieces of what safe feels like.",
    culturalContext:
      "Their answers may carry family or cultural expectations around privacy, care, and how people show up for each other. Hold this as a starting place for curiosity, not a final read."
  },
  partnerCheatSheet: {
    doThis: [
      "Say what you feel in plain words when you can.",
      "Carve out time that feels intentional, even if it is small.",
      "Circle back after hard talks once everyone has had a breath."
    ],
    avoidThis: [
      "Reading silence as proof they stopped caring.",
      "Rushing repair before they feel met in what hurt.",
      "Turning a need for reassurance into something to win or lose."
    ],
    inConflictDo:
      "Slow it down, play back what you heard, and pick one doable next step together.",
    toShowLoveDo:
      "Keep quality time simple and show up on the tiny promises you make."
  },
  caveats: [
    "This is a mirror for reflection, not a label from a clinician.",
    "Let it open a conversation between you, not a box you put them in forever."
  ]
};
