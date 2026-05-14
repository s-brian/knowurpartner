import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getLocalizedQuestions,
  languagePromptNames,
  type SupportedLanguage
} from "@/lib/languages";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { questions } from "@/lib/questions";
import { ReportSchema } from "@/lib/schema";
import type { Report } from "@/types/report";

const DEFAULT_GEMINI_MODEL = "gemma-4-31b-it";
const FALLBACK_GEMINI_MODEL = "gemini-2.5-flash";
const GENERATION_ERROR_MESSAGE =
  "Something went wrong generating your report. Please try again.";

type GenerateReportOptions = {
  recipientName?: string;
  senderName?: string;
  outputLanguage?: SupportedLanguage;
};

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

function buildNameContext(options: GenerateReportOptions) {
  const details = [
    options.senderName
      ? `The person who wrote these answers is named ${options.senderName}. Refer to this person by name where it feels natural instead of using only they/them.`
      : null,
    options.recipientName
      ? `The partner reading the finished letter is named ${options.recipientName}.`
      : null
  ].filter(Boolean);

  if (details.length === 0) {
    return "";
  }

  return `Name context:\n${details.join("\n")}\n\n`;
}

function buildLanguageContext(options: GenerateReportOptions) {
  const outputLanguage = options.outputLanguage ?? "english";
  const promptLanguage = languagePromptNames[outputLanguage];

  return `Output language: ${promptLanguage}.
Write every user-facing string value in ${promptLanguage}.
The answers may be written in any language. Understand them as written, then write the report in ${promptLanguage}.
Keep all JSON keys in English exactly as specified.
Keep enum values in English exactly as specified.
Do not translate JSON keys, enum values, or structural field names.

`;
}

function buildUserPrompt(answers: string[], options: GenerateReportOptions = {}) {
  const outputLanguage = options.outputLanguage ?? "english";
  const displayedQuestions = getLocalizedQuestions(outputLanguage);
  const answeredQuestions = questions
    .map((question, index) => {
      const displayedQuestion = displayedQuestions[index]?.prompt;
      const answer = answers[index]?.trim();
      const wordCount = answer ? answer.split(/\s+/).filter(Boolean).length : 0;
      const evidenceNote =
        wordCount < 5
          ? "Evidence note: insufficient evidence, fewer than 5 words or blank."
          : "Evidence note: usable evidence.";

      const questionText =
        displayedQuestion && displayedQuestion !== question.prompt
          ? `Canonical question: ${question.prompt}\nDisplayed question: ${displayedQuestion}`
          : `Question: ${question.prompt}`;

      return `${question.id}. ${questionText}\nAnswer: ${
        answer || "(left blank)"
      }\n${evidenceNote}`;
    })
    .join("\n\n");

  return `${reportShapeInstruction}\n\n${buildLanguageContext(
    options
  )}${buildNameContext(
    options
  )}Here are the user's answers:\n\n${answeredQuestions}`;
}

function extractJsonObject(text: string) {
  console.error("Gemini raw response:", text);

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      `Gemma response did not contain a JSON object. start=${start}, end=${end}`
    );
  }

  const extracted = text.slice(start, end + 1);
  console.error("Gemini extracted JSON:", extracted);
  return extracted;
}

function parseReportJson(text: string) {
  const json = extractJsonObject(text);
  return JSON.parse(json) as unknown;
}

function getGoogleErrorStatus(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return null;
}

function shouldFallbackToFlash(error: unknown) {
  const status = getGoogleErrorStatus(error);
  return status === 500 || status === 503;
}

async function generateRawReportText(
  apiKey: string,
  modelName: string,
  answers: string[],
  options: GenerateReportOptions
) {
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
        parts: [{ text: buildUserPrompt(answers, options) }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  });

  return result.response.text();
}

async function generateRawReportTextWithFallback(
  apiKey: string,
  answers: string[],
  options: GenerateReportOptions
) {
  const primaryModel = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

  try {
    return await generateRawReportText(apiKey, primaryModel, answers, options);
  } catch (error) {
    if (primaryModel === FALLBACK_GEMINI_MODEL || !shouldFallbackToFlash(error)) {
      throw error;
    }

    console.error(
      `Primary Gemini model failed with status ${getGoogleErrorStatus(
        error
      )}. Retrying with ${FALLBACK_GEMINI_MODEL}.`,
      error
    );

    return generateRawReportText(
      apiKey,
      FALLBACK_GEMINI_MODEL,
      answers,
      options
    );
  }
}

export async function generateReportWithGemini(
  answers: string[],
  options: GenerateReportOptions = {}
): Promise<Report> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY.");
    }

    const rawText = await generateRawReportTextWithFallback(
      apiKey,
      answers,
      options
    );
    const parsed = parseReportJson(rawText);
    const reportResult = ReportSchema.safeParse({
      ...(parsed as object),
      id: crypto.randomUUID()
    });

    if (!reportResult.success) {
      console.error(
        "Gemini Zod validation errors:",
        reportResult.error.flatten()
      );
      throw new Error("Gemini response failed Zod validation.");
    }

    return reportResult.data;
  } catch (error) {
    console.error("Report generation pipeline failed:", error);
    throw new Error(GENERATION_ERROR_MESSAGE);
  }
}
