import { mockReport } from "@/lib/mock-report";
import { EnvelopeReportReveal } from "@/components/EnvelopeReportReveal";
import { RelationshipPatternValueReveal } from "@/components/RelationshipPatternValueReveal";
import { stripEmDashes } from "@/lib/humanize-display";
import { ReportSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import type { Report } from "@/types/report";

const narrativeLabels: Record<keyof typeof mockReport.narrativeSections, string> =
  {
    whenStressed: "When they're stressed",
    whenDistant: "When they build distance",
    whatMakesThemFeelLoved: "How to make them feel loved",
    inConflict: "How they handle conflict",
    emotionalSafety: "What make them feel emotionally safe",
    culturalContext: "Background worth remembering"
  };

const reportLabelNames: Record<keyof typeof mockReport.labels, string> = {
  attachmentTendency: "Attachment Style",
  primaryLoveLanguage: "Highest Rated Love Language",
  energyStyle: "Personality Type",
  conflictPattern: "Conflict Tendency"
};

function humanizeEnum(value: string): string {
  return value.replace(/_/g, " ");
}

function formatConfidence(c: string): string {
  if (c === "high") return "this showed up pretty clearly in what they wrote";
  if (c === "medium") return "take this as a sketch, not a verdict";
  return "only a faint signal, so hold it lightly";
}

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

function LetterDivider() {
  return (
    <div
      className="my-6 flex items-center justify-center gap-3 text-2xl text-paper-pencil/60"
      aria-hidden
    >
      <span className="h-px flex-1 max-w-[5rem] bg-paper-line" />
      <span className="font-letter text-3xl font-light">~</span>
      <span className="h-px flex-1 max-w-[5rem] bg-paper-line" />
    </div>
  );
}

export default async function ReportPage({ params }: ReportPageProps) {
  const report = await getReport(params.id);

  const title = stripEmDashes(report.title);
  const narratives = Object.entries(report.narrativeSections).map(([key, body]) => ({
    key,
    label: narrativeLabels[key as keyof typeof mockReport.narrativeSections],
    body: stripEmDashes(body)
  }));
  const doLines = report.partnerCheatSheet.doThis.map(stripEmDashes);
  const avoidLines = report.partnerCheatSheet.avoidThis.map(stripEmDashes);
  const inConflict = stripEmDashes(report.partnerCheatSheet.inConflictDo);
  const toShowLove = stripEmDashes(report.partnerCheatSheet.toShowLoveDo);
  const caveats = report.caveats.map(stripEmDashes);
  const originalAnswers = report.originalAnswers ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d4c4b0] via-[#c9b8a4] to-[#b8a690] px-3 py-0 sm:px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      <main className="relative mx-auto max-w-6xl lg:max-w-7xl">
        <EnvelopeReportReveal>
          <div
            className="mx-auto rounded-sm bg-[#fffef9] px-5 py-8 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_28px_rgba(40,30,20,0.1)] sm:px-10 sm:py-10 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:px-12 lg:py-10"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255,254,249,0.97) 0%, rgba(255,252,248,0.99) 100%), repeating-linear-gradient(transparent, transparent 30px, rgba(180, 140, 100, 0.055) 30px, rgba(180, 140, 100, 0.055) 31px)`
            }}
          >
          <header className="font-letter text-paper-ink lg:col-span-12">
            <div className="max-w-4xl">
              <p className="text-3xl font-normal leading-tight sm:text-4xl">
                Dear partner,
              </p>

              <p className="mt-5 text-xl font-light leading-relaxed sm:text-2xl">
                Someone you love spent time with these questions and wrote what
                felt true for them. None of this is a final read on who they are.
                It is just one way to understand them a little better, in their
                own words, so you can show up with warmth.
              </p>

              <p className="mt-5 text-xl font-normal leading-snug text-paper-ink sm:text-2xl">
                {title}
              </p>
            </div>
          </header>

          <div className="lg:col-span-12">
            <LetterDivider />
          </div>

          <aside
            className="font-letter text-paper-ink lg:col-span-4"
            style={{
              fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
              lineHeight: 1.5
            }}
          >
            <p className="text-2xl font-normal text-paper-muted">Relationship Patterns</p>
            <p className="mt-1 text-lg font-light leading-relaxed text-paper-muted">
              Categories that your partner falls under based on their responses.
            </p>

            <ul className="mt-5 grid gap-3">
              {Object.entries(report.labels).map(([key, label]) => (
                <li
                  key={key}
                  className="list-none rounded-sm border border-paper-line/80 bg-paper-cream/70 px-4 py-3"
                >
                  <p className="text-lg font-normal text-paper-muted">
                    {reportLabelNames[key as keyof typeof mockReport.labels]}
                  </p>
                  <p className="mt-1 text-xl font-light capitalize leading-snug">
                    <RelationshipPatternValueReveal
                      label={reportLabelNames[key as keyof typeof mockReport.labels]}
                    >
                      {humanizeEnum(label.value)}
                    </RelationshipPatternValueReveal>
                    <span className="mt-1 block text-base font-light text-paper-pencil">
                      {formatConfidence(label.confidence)}
                    </span>
                    <span className="mt-1 block text-base font-light text-paper-pencil/80">
                      Evidence strength: {label.certaintyPercent}%
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </aside>

          <div
            className="mt-10 font-letter text-paper-ink lg:col-span-8 lg:mt-0"
            style={{
              fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
              lineHeight: 1.5
            }}
          >
            <p className="text-2xl font-normal text-paper-muted">From their answers</p>

            <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {narratives.map(({ key, label, body }) => (
                <section key={key} className="break-inside-avoid">
                  <h2 className="text-xl font-normal text-paper-ink/95">{label}</h2>
                  <p className="mt-2 font-light leading-relaxed">{body}</p>
                </section>
              ))}
            </div>
          </div>

          <section
            className="mt-10 border-t border-dashed border-paper-line pt-8 font-letter text-paper-ink lg:col-span-12"
            style={{
              fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
              lineHeight: 1.5
            }}
          >
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="text-2xl font-normal text-paper-muted">
                  Ideas that might help
                </p>
                <p className="mt-1 text-lg font-light leading-relaxed text-paper-muted">
                  How you should show up in ways that fit with what they shared.
                </p>
              </div>

              <div className="grid gap-7 sm:grid-cols-2 lg:col-span-8">
                <div>
                  <h3 className="text-xl font-normal text-paper-ink">
                    Things that often land well
                  </h3>
                  <ul className="mt-3 space-y-2.5 font-light leading-relaxed">
                    {doLines.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="shrink-0 font-normal text-paper-pencil">
                          -
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-normal text-paper-ink">
                    Where friction can stack up
                  </h3>
                  <ul className="mt-3 space-y-2.5 font-light leading-relaxed">
                    {avoidLines.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="shrink-0 font-normal text-paper-pencil">
                          -
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <section className="border-t border-dashed border-paper-line pt-6 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-7">
                  <div>
                    <h3 className="text-xl font-normal">
                      When things feel tense
                    </h3>
                    <p className="mt-2 font-light leading-relaxed">
                      {inConflict}
                    </p>
                  </div>
                  <div className="mt-6 sm:mt-0">
                    <h3 className="text-xl font-normal">
                      Ways love tends to show up for them
                    </h3>
                    <p className="mt-2 font-light leading-relaxed">
                      {toShowLove}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {originalAnswers.length > 0 ? (
              <section className="mt-8 border-t border-dashed border-paper-line pt-8">
                <p className="text-2xl font-normal text-paper-muted">
                  Their original answers
                </p>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {originalAnswers.map((item) => (
                    <article
                      key={item.questionId}
                      className="rounded-sm border border-paper-line/80 bg-paper-cream/60 px-4 py-3"
                    >
                      <h3 className="text-lg font-normal text-paper-muted">
                        {item.questionId}. {item.question}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap font-light leading-relaxed">
                        {item.answer || "No answer written."}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <LetterDivider />

            <p className="mt-10 text-3xl font-normal">With care,</p>
            <p className="mt-1 text-xl font-light text-paper-muted">
              a note stitched together from what they shared
            </p>

          </section>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center font-journal text-lg leading-relaxed text-paper-ink/85">
            Results are based on their responses to a set of reflective questions. This is not a psychological evaluation, and may not be perfectly accurate.
          </p>
          <p className="sr-only">Report id: {params.id}</p>
        </EnvelopeReportReveal>
      </main>
    </div>
  );
}
