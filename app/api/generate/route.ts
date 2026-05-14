import { NextResponse } from "next/server";
import { generateReportWithGemini } from "@/lib/gemini";
import { getLocalizedQuestions } from "@/lib/languages";
import { questions } from "@/lib/questions";
import { GenerateRequestSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import type { Report } from "@/types/report";

type GenerateResponse = {
  id: string;
  report: Report;
};

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const requestResult = GenerateRequestSchema.safeParse(body);

  if (!requestResult.success) {
    return NextResponse.json(
      {
        error: "Invalid request body"
      },
      { status: 400 }
    );
  }

  if (!supabase) {
    console.error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );

    return NextResponse.json(
      {
        error:
          "Report storage is not configured yet. Add Supabase credentials and try again."
      },
      { status: 500 }
    );
  }

  let report: Report;
  try {
    console.error("Starting report generation request.");
    report = await generateReportWithGemini(requestResult.data.answers, {
      recipientName: requestResult.data.recipientName,
      senderName: requestResult.data.senderName,
      outputLanguage: requestResult.data.outputLanguage
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate report.";
    console.error("Report generation failed:", message);

    return NextResponse.json(
      {
        error: message
      },
      { status: 500 }
    );
  }

  if (requestResult.data.includeOriginalAnswers) {
    const displayedQuestions = getLocalizedQuestions(
      requestResult.data.outputLanguage
    );

    report = {
      ...report,
      originalAnswers: questions.map((question, index) => ({
        questionId: question.id,
        question: displayedQuestions[index]?.prompt ?? question.prompt,
        answer: requestResult.data.answers[index] ?? ""
      }))
    };
  }

  if (requestResult.data.recipientName || requestResult.data.senderName) {
    report = {
      ...report,
      recipientName: requestResult.data.recipientName,
      senderName: requestResult.data.senderName
    };
  }

  report = {
    ...report,
    outputLanguage: requestResult.data.outputLanguage
  };

  const { data, error } = await supabase
    .from("reports")
    .insert({ report_json: report })
    .select("id")
    .single();

  if (error) {
    console.error("Unable to save generated report:", error);
    return NextResponse.json(
      {
        error: "Something went wrong generating your report. Please try again."
      },
      { status: 500 }
    );
  }

  const response: GenerateResponse = {
    id: data.id as string,
    report: {
      ...report,
      id: data.id as string
    }
  };

  return NextResponse.json(response);
}
