import { mockReport } from "@/lib/mock-report";
import { ReportSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import type { Report } from "@/types/report";

const narrativeLabels: Record<keyof typeof mockReport.narrativeSections, string> =
  {
    whenStressed: "When Stressed",
    whenDistant: "When Distant",
    whatMakesThemFeelLoved: "What Makes Them Feel Loved",
    inConflict: "In Conflict",
    emotionalSafety: "Emotional Safety",
    culturalContext: "Cultural Context"
  };

const reportLabelNames: Record<keyof typeof mockReport.labels, string> = {
  attachmentTendency: "Attachment Tendency",
  primaryLoveLanguage: "Primary Love Language",
  energyStyle: "Energy Style",
  conflictPattern: "Conflict Pattern"
};

type ReportPageProps = {
  params: {
    id: string;
  };
};

async function getReport(id: string): Promise<Report> {
  if (!supabase) {
    return {
      ...mockReport,
      id
    };
  }

  const { data, error } = await supabase
    .from("reports")
    .select("report_json")
    .eq("id", id)
    .single();

  if (error || !data?.report_json) {
    return {
      ...mockReport,
      id
    };
  }

  const result = ReportSchema.safeParse(data.report_json);

  if (!result.success) {
    return {
      ...mockReport,
      id
    };
  }

  return {
    ...result.data,
    id
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await getReport(params.id);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <p className="text-sm text-gray-600">Report ID: {params.id}</p>
      <h1 className="mt-2 text-3xl font-bold">{report.title}</h1>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Labels</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(report.labels).map(([key, label]) => (
            <div key={key} className="rounded border border-gray-300 p-3">
              <p className="text-sm font-medium">
                {reportLabelNames[key as keyof typeof mockReport.labels]}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {label.value} ({label.confidence} confidence)
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Narrative Sections</h2>
        <div className="mt-4 space-y-6">
          {Object.entries(report.narrativeSections).map(([key, body]) => (
            <article key={key}>
              <h3 className="font-medium">
                {
                  narrativeLabels[
                    key as keyof typeof mockReport.narrativeSections
                  ]
                }
              </h3>
              <p className="mt-2 text-gray-700">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Partner Cheat Sheet</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-medium">Do This</h3>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-gray-700">
              {report.partnerCheatSheet.doThis.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Avoid This</h3>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-gray-700">
              {report.partnerCheatSheet.avoidThis.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="font-medium">In Conflict</h3>
            <p className="mt-2 text-gray-700">
              {report.partnerCheatSheet.inConflictDo}
            </p>
          </div>
          <div>
            <h3 className="font-medium">To Show Love</h3>
            <p className="mt-2 text-gray-700">
              {report.partnerCheatSheet.toShowLoveDo}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Caveats</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          {report.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
