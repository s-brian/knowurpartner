import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { questions } from "@/lib/questions";
import { ReportSchema } from "@/lib/schema";
import type { Report } from "@/types/report";

const DEFAULT_GEMINI_MODEL = "gemma-4-31b-it";
const GENERATION_ERROR_MESSAGE =
  "Something went wrong generating your report. Please try again.";

const reportShapeInstruction = `
Return only valid JSON. No preamble, no explanation, no markdown code blocks,
no backticks. Just the raw JSON object starting with { and ending with }.

Return JSON with this exact shape:
{
  "title": string,
  "labels": {
    "attachmentTendency": {
      "value": "secure" | "anxious" | "fearful-avoidant" | "dismissive-avoidant",
      "confidence": "low" | "medium" | "high",
      "certaintyPercent": number
    },
    "primaryLoveLanguage": {
      "value": "quality_time" | "words_of_affirmation" | "acts_of_service" | "physical_touch" | "receiving_gifts",
      "confidence": "low" | "medium" | "high",
      "certaintyPercent": number
    },
    "energyStyle": {
      "value": "introverted" | "extroverted" | "ambiverted",
      "confidence": "low" | "medium" | "high",
      "certaintyPercent": number
    },
    "conflictPattern": {
      "value": "pursuer" | "withdrawer" | "disorganized" | "collaborative",
      "confidence": "low" | "medium" | "high",
      "certaintyPercent": number
    }
  },
  "narrativeSections": {
    "whenStressed": string,
    "whenDistant": string,
    "whatMakesThemFeelLoved": string,
    "inConflict": string,
    "emotionalSafety": string,
    "culturalContext": string
  },
  "partnerCheatSheet": {
    "doThis": string[],
    "avoidThis": string[],
    "inConflictDo": string,
    "toShowLoveDo": string
  },
  "caveats": string[]
}

Do not include an id field.
certaintyPercent must be an integer from 0 to 99. It means evidence strength,
not factual accuracy. Use 0-40 for weak evidence, 41-70 for moderate evidence,
and 71-90 for strong evidence. Never use 100.
Keep narrative section values to 1-2 warm, specific sentences each.
Use exactly 3 doThis items, exactly 3 avoidThis items, and exactly 2 caveats.
`;

function buildUserPrompt(answers: string[]) {
  const answeredQuestions = questions
    .map((question, index) => {
      const answer = answers[index]?.trim();
      const wordCount = answer ? answer.split(/\s+/).filter(Boolean).length : 0;
      const evidenceNote =
        wordCount < 5
          ? "Evidence note: insufficient evidence, fewer than 5 words or blank."
          : "Evidence note: usable evidence.";

      return `${question.id}. ${question.prompt}\nAnswer: ${
        answer || "(left blank)"
      }\n${evidenceNote}`;
    })
    .join("\n\n");

  return `${reportShapeInstruction}\n\nHere are the user's answers:\n\n${answeredQuestions}`;
}

function extractJsonObject(text: string) {
  console.error("Gemma raw response:", text);

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      `Gemma response did not contain a JSON object. start=${start}, end=${end}`
    );
  }

  const extracted = text.slice(start, end + 1);
  console.error("Gemma extracted JSON:", extracted);
  return extracted;
}

function parseReportJson(text: string) {
  const json = extractJsonObject(text);
  return JSON.parse(json) as unknown;
}

export async function generateReportWithGemini(answers: string[]): Promise<Report> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const modelName = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    console.error("Generating report with Gemini model:", modelName);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: buildUserPrompt(answers) }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const rawText = result.response.text();
    const parsed = parseReportJson(rawText);
    const reportResult = ReportSchema.safeParse({
      ...(parsed as object),
      id: crypto.randomUUID()
    });

    if (!reportResult.success) {
      console.error(
        "Gemma Zod validation errors:",
        reportResult.error.flatten()
      );
      throw new Error("Gemma response failed Zod validation.");
    }

    return reportResult.data;
  } catch (error) {
    console.error("Report generation pipeline failed:", error);
    throw new Error(GENERATION_ERROR_MESSAGE);
  }
}
