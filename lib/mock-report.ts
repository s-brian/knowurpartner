import type { Report } from "@/types/report";

export const mockReport: Report = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Partner Relationship Snapshot",
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
      "Your responses suggest they may feel most supported when you stay steady, check in directly, and offer help without taking over.",
    whenDistant:
      "When they seem distant, they may be trying to settle their thoughts before talking. A gentle invitation can work better than pressing for an immediate answer.",
    whatMakesThemFeelLoved:
      "They may feel especially loved through protected time together, thoughtful follow-through, and small signs that you were listening.",
    inConflict:
      "In conflict, your responses suggest they are likely to respond well to calm language, clear repair attempts, and a shared focus on what happens next.",
    emotionalSafety:
      "Emotional safety may look like consistency, room to be honest, and knowing that difficult moments will not erase the care between you.",
    culturalContext:
      "Their answers may reflect personal, family, or cultural expectations around privacy, care, and communication. Treat this as a conversation starter rather than a fixed conclusion."
  },
  partnerCheatSheet: {
    doThis: [
      "Name your care clearly and specifically.",
      "Make time together feel intentional.",
      "Return to hard conversations after everyone has had time to settle."
    ],
    avoidThis: [
      "Do not treat quietness as proof they do not care.",
      "Do not rush repair before they feel heard.",
      "Do not turn a need for reassurance into a debate."
    ],
    inConflictDo:
      "Slow the conversation down, reflect what you heard, and agree on one concrete next step.",
    toShowLoveDo:
      "Plan simple quality time and follow through on the small details you said you would handle."
  },
  caveats: [
    "This report is a reflective guide, not a diagnosis.",
    "Use it to start a conversation with your partner, not to label them permanently."
  ]
};
