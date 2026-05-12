import { NextResponse } from "next/server";
import { mockReport } from "@/lib/mock-report";
import { GenerateRequestSchema, ReportSchema } from "@/lib/schema";
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
        error: "Invalid request body",
        details: requestResult.error.flatten()
      },
      { status: 400 }
    );
  }

  const reportResult = ReportSchema.safeParse(mockReport);

  if (!reportResult.success) {
    return NextResponse.json(
      {
        error: "Mock report failed validation",
        details: reportResult.error.flatten()
      },
      { status: 500 }
    );
  }

  if (supabase) {
    const { data, error } = await supabase
      .from("reports")
      .insert({ report_json: reportResult.data })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: "Unable to save report"
        },
        { status: 500 }
      );
    }

    const response: GenerateResponse = {
      id: data.id as string,
      report: {
        ...reportResult.data,
        id: data.id as string
      }
    };

    return NextResponse.json(response);
  }

  const response: GenerateResponse = {
    id: reportResult.data.id,
    report: reportResult.data
  };

  return NextResponse.json(response);
}
