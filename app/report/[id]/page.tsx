import { mockReport } from "@/lib/mock-report";
import { CopyReportUrlButton } from "@/components/CopyReportUrlButton";
import { EnvelopeReportReveal } from "@/components/EnvelopeReportReveal";
import { RelationshipPatternValueReveal } from "@/components/RelationshipPatternValueReveal";
import { stripEmDashes } from "@/lib/humanize-display";
import { defaultLanguage, type SupportedLanguage } from "@/lib/languages";
import { ReportSchema } from "@/lib/schema";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Report } from "@/types/report";

type LabelKey = keyof typeof mockReport.labels;
type NarrativeKey = keyof typeof mockReport.narrativeSections;

type ReportCopy = {
  labelNames: Record<LabelKey, string>;
  enumLabels: Record<string, string>;
  narrativeLabels: (senderName?: string) => Record<NarrativeKey, string>;
  dear: (recipientName?: string) => string;
  intro: (senderName?: string) => string;
  patternsTitle: string;
  patternsDescription: (senderName?: string) => string;
  fromAnswers: (senderName?: string) => string;
  ideasTitle: string;
  ideasDescription: (senderName?: string) => string;
  doTitle: string;
  avoidTitle: string;
  tenseTitle: string;
  loveTitle: (senderName?: string) => string;
  originalAnswersTitle: (senderName?: string) => string;
  emptyAnswer: string;
  withCare: string;
  signoff: (senderName?: string) => string;
  footer: (senderName?: string) => string;
  evidenceStrength: string;
  copyUrl: string;
  copiedUrl: string;
  generatedBy: (modelName: string) => string;
};

function possessiveName(name: string): string {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

function englishPossessive(name?: string) {
  return name ? possessiveName(name) : "their";
}

const englishEnumLabels: Record<string, string> = {
  secure: "secure",
  anxious: "anxious",
  "fearful-avoidant": "fearful avoidant",
  "dismissive-avoidant": "dismissive avoidant",
  quality_time: "quality time",
  words_of_affirmation: "words of affirmation",
  acts_of_service: "acts of service",
  physical_touch: "physical touch",
  receiving_gifts: "receiving gifts",
  introverted: "introverted",
  extroverted: "extroverted",
  ambiverted: "ambiverted",
  pursuer: "pursuer",
  withdrawer: "withdrawer",
  disorganized: "disorganized",
  collaborative: "collaborative"
};

const reportCopy: Record<SupportedLanguage, ReportCopy> = {
  english: {
    labelNames: {
      attachmentTendency: "How closeness can feel",
      primaryLoveLanguage: "What feels most loving",
      energyStyle: "How they recharge",
      conflictPattern: "When things get tense"
    },
    enumLabels: englishEnumLabels,
    narrativeLabels: (senderName) => ({
      whenStressed: senderName
        ? `When ${senderName} is stressed`
        : "When they're stressed",
      whenDistant: senderName
        ? `When ${senderName} builds distance`
        : "When they build distance",
      whatMakesThemFeelLoved: senderName
        ? `How to make ${senderName} feel loved`
        : "How to make them feel loved",
      inConflict: senderName
        ? `How ${senderName} handles conflict`
        : "How they handle conflict",
      emotionalSafety: senderName
        ? `What makes ${senderName} feel emotionally safe`
        : "What makes them feel emotionally safe",
      culturalContext: "Background worth remembering"
    }),
    dear: (recipientName) => `Dear ${recipientName || "partner"},`,
    intro: (senderName) =>
      senderName
        ? `${senderName} spent time with these questions and wrote what felt true. None of this is a final read on ${senderName}. It is just one way to understand ${senderName} a little better, in ${englishPossessive(senderName)} own words, so you can show up with warmth.`
        : "Someone you love spent time with these questions and wrote what felt true for them. None of this is a final read on who they are. It is just one way to understand them a little better, in their own words, so you can show up with warmth.",
    patternsTitle: "A few things this points to",
    patternsDescription: (senderName) =>
      senderName
        ? `These are gentle guesses from what ${senderName} wrote, not final labels.`
        : "These are gentle guesses from what they wrote, not final labels.",
    fromAnswers: (senderName) =>
      `What ${senderName ? `${englishPossessive(senderName)} answers` : "their answers"} seemed to say`,
    ideasTitle: "Ways to show up for them",
    ideasDescription: (senderName) =>
      senderName
        ? `Simple things that may feel good to ${senderName}, based on what they shared.`
        : "Simple things that may feel good to them, based on what they shared.",
    doTitle: "Things that may feel good",
    avoidTitle: "Things to be careful with",
    tenseTitle: "When things feel tense",
    loveTitle: (senderName) =>
      `What love may look like to ${senderName || "them"}`,
    originalAnswersTitle: (senderName) =>
      senderName ? `${englishPossessive(senderName)} original answers` : "Their original answers",
    emptyAnswer: "No answer written.",
    withCare: "With care,",
    signoff: (senderName) =>
      senderName
        ? `from ${senderName}`
        : "a note stitched together from what they shared",
    footer: (senderName) =>
      `Results are based on ${senderName ? `${englishPossessive(senderName)} responses` : "their responses"} to a set of reflective questions. This is not a psychological evaluation, and may not be perfectly accurate.`,
    evidenceStrength: "How much their answers point to this",
    copyUrl: "Copy link",
    copiedUrl: "Copied",
    generatedBy: (modelName) => `results generated by ${modelName}`
  },
  simplified_chinese: {
    labelNames: {
      attachmentTendency: "依恋风格",
      primaryLoveLanguage: "最明显的爱的语言",
      energyStyle: "能量类型",
      conflictPattern: "冲突倾向"
    },
    enumLabels: {
      ...englishEnumLabels,
      secure: "安全型",
      anxious: "焦虑型",
      "fearful-avoidant": "恐惧回避型",
      "dismissive-avoidant": "疏离回避型",
      quality_time: "高质量陪伴",
      words_of_affirmation: "肯定的话语",
      acts_of_service: "服务行动",
      physical_touch: "身体接触",
      receiving_gifts: "收礼物",
      introverted: "内向",
      extroverted: "外向",
      ambiverted: "内外兼具",
      pursuer: "追问型",
      withdrawer: "退缩型",
      disorganized: "不稳定型",
      collaborative: "合作型"
    },
    narrativeLabels: (senderName) => ({
      whenStressed: senderName ? `${senderName}压力大时` : "他们压力大时",
      whenDistant: senderName ? `${senderName}拉开距离时` : "他们拉开距离时",
      whatMakesThemFeelLoved: senderName ? `如何让${senderName}感到被爱` : "如何让他们感到被爱",
      inConflict: senderName ? `${senderName}如何处理冲突` : "他们如何处理冲突",
      emotionalSafety: senderName ? `什么让${senderName}感到情感安全` : "什么让他们感到情感安全",
      culturalContext: "值得记住的背景"
    }),
    dear: (recipientName) => `亲爱的${recipientName || "伴侣"}，`,
    intro: (senderName) =>
      senderName
        ? `${senderName}花时间回答了这些问题，写下了真实感受。这不是对${senderName}的最终定义，只是一种帮助你更了解${senderName}的方式，让你能更温柔地靠近。`
        : "你爱的人花时间回答了这些问题，写下了真实感受。这不是对他们的最终定义，只是一种帮助你更了解他们的方式，让你能更温柔地靠近。",
    patternsTitle: "关系模式",
    patternsDescription: (senderName) =>
      senderName ? `根据${senderName}的回答整理出的几个倾向。` : "根据他们的回答整理出的几个倾向。",
    fromAnswers: (senderName) => `来自${senderName || "他们"}的回答`,
    ideasTitle: "可能有帮助的做法",
    ideasDescription: (senderName) =>
      senderName ? `一些更适合回应${senderName}的方式。` : "一些更适合回应他们的方式。",
    doTitle: "通常会让人感到被接住的事",
    avoidTitle: "容易累积摩擦的地方",
    tenseTitle: "关系紧张时",
    loveTitle: (senderName) => `爱对${senderName || "他们"}来说常常这样出现`,
    originalAnswersTitle: (senderName) => `${senderName || "他们"}的原始回答`,
    emptyAnswer: "没有填写回答。",
    withCare: "带着关心，",
    signoff: (senderName) => (senderName ? `来自${senderName}` : "由这些回答整理成的一封信"),
    footer: (senderName) =>
      `结果基于${senderName || "他们"}对一组反思问题的回答。这不是心理评估，也不一定完全准确。`,
    evidenceStrength: "依据强度",
    copyUrl: "复制报告链接",
    copiedUrl: "已复制",
    generatedBy: (modelName) => `结果由 ${modelName} 生成`
  },
  traditional_chinese: {
    labelNames: {
      attachmentTendency: "依附風格",
      primaryLoveLanguage: "最明顯的愛的語言",
      energyStyle: "能量類型",
      conflictPattern: "衝突傾向"
    },
    enumLabels: {
      ...englishEnumLabels,
      secure: "安全型",
      anxious: "焦慮型",
      "fearful-avoidant": "恐懼迴避型",
      "dismissive-avoidant": "疏離迴避型",
      quality_time: "高品質陪伴",
      words_of_affirmation: "肯定的話語",
      acts_of_service: "服務行動",
      physical_touch: "身體接觸",
      receiving_gifts: "收禮物",
      introverted: "內向",
      extroverted: "外向",
      ambiverted: "內外兼具",
      pursuer: "追問型",
      withdrawer: "退縮型",
      disorganized: "不穩定型",
      collaborative: "合作型"
    },
    narrativeLabels: (senderName) => ({
      whenStressed: senderName ? `${senderName}壓力大時` : "他們壓力大時",
      whenDistant: senderName ? `${senderName}拉開距離時` : "他們拉開距離時",
      whatMakesThemFeelLoved: senderName ? `如何讓${senderName}感到被愛` : "如何讓他們感到被愛",
      inConflict: senderName ? `${senderName}如何處理衝突` : "他們如何處理衝突",
      emotionalSafety: senderName ? `什麼讓${senderName}感到情感安全` : "什麼讓他們感到情感安全",
      culturalContext: "值得記住的背景"
    }),
    dear: (recipientName) => `親愛的${recipientName || "伴侶"}，`,
    intro: (senderName) =>
      senderName
        ? `${senderName}花時間回答了這些問題，寫下了真實感受。這不是對${senderName}的最終定義，只是一種幫助你更了解${senderName}的方式，讓你能更溫柔地靠近。`
        : "你愛的人花時間回答了這些問題，寫下了真實感受。這不是對他們的最終定義，只是一種幫助你更了解他們的方式，讓你能更溫柔地靠近。",
    patternsTitle: "關係模式",
    patternsDescription: (senderName) =>
      senderName ? `根據${senderName}的回答整理出的幾個傾向。` : "根據他們的回答整理出的幾個傾向。",
    fromAnswers: (senderName) => `來自${senderName || "他們"}的回答`,
    ideasTitle: "可能有幫助的做法",
    ideasDescription: (senderName) =>
      senderName ? `一些更適合回應${senderName}的方式。` : "一些更適合回應他們的方式。",
    doTitle: "通常會讓人感到被接住的事",
    avoidTitle: "容易累積摩擦的地方",
    tenseTitle: "關係緊張時",
    loveTitle: (senderName) => `愛對${senderName || "他們"}來說常常這樣出現`,
    originalAnswersTitle: (senderName) => `${senderName || "他們"}的原始回答`,
    emptyAnswer: "沒有填寫回答。",
    withCare: "帶著關心，",
    signoff: (senderName) => (senderName ? `來自${senderName}` : "由這些回答整理成的一封信"),
    footer: (senderName) =>
      `結果基於${senderName || "他們"}對一組反思問題的回答。這不是心理評估，也不一定完全準確。`,
    evidenceStrength: "依據強度",
    copyUrl: "複製報告連結",
    copiedUrl: "已複製",
    generatedBy: (modelName) => `結果由 ${modelName} 生成`
  },
  mongolian: {
    labelNames: {
      attachmentTendency: "Холбооны хэв маяг",
      primaryLoveLanguage: "Хамгийн тод хайрын хэл",
      energyStyle: "Энергийн хэв маяг",
      conflictPattern: "Зөрчлийн хандлага"
    },
    enumLabels: {
      ...englishEnumLabels,
      secure: "аюулгүй",
      anxious: "түгшүүртэй",
      "fearful-avoidant": "айдастай зайлсхийх",
      "dismissive-avoidant": "хөндий зайлсхийх",
      quality_time: "чанартай цаг",
      words_of_affirmation: "урам өгөх үг",
      acts_of_service: "тусламжийн үйлдэл",
      physical_touch: "биеийн хүрэлцээ",
      receiving_gifts: "бэлэг авах",
      introverted: "дотогшоо",
      extroverted: "гадагшаа",
      ambiverted: "дундын",
      pursuer: "ойртохыг хичээдэг",
      withdrawer: "хойш суудаг",
      disorganized: "тогтворгүй",
      collaborative: "хамтран шийддэг"
    },
    narrativeLabels: (senderName) => ({
      whenStressed: senderName ? `${senderName} стресстэй үед` : "Тэд стресстэй үед",
      whenDistant: senderName ? `${senderName} зай барих үед` : "Тэд зай барих үед",
      whatMakesThemFeelLoved: senderName ? `${senderName}-д хайрыг мэдрүүлэх нь` : "Тэдэнд хайрыг мэдрүүлэх нь",
      inConflict: senderName ? `${senderName} зөрчлийг хэрхэн туулдаг` : "Тэд зөрчлийг хэрхэн туулдаг",
      emotionalSafety: senderName ? `${senderName}-д сэтгэлзүйн аюулгүй байдал юу өгдөг вэ` : "Тэдэнд сэтгэлзүйн аюулгүй байдал юу өгдөг вэ",
      culturalContext: "Санаж явах суурь зүйлс"
    }),
    dear: (recipientName) => `Эрхэм ${recipientName || "хайрт минь"},`,
    intro: (senderName) =>
      senderName
        ? `${senderName} эдгээр асуултад цаг гарган, өөрт нь үнэн санагдсан зүйлсийг бичжээ. Энэ нь ${senderName}-г бүрэн тодорхойлох дүгнэлт биш, харин илүү дулаанаар ойлгоход туслах нэг эхлэл юм.`
        : "Таны хайртай хүн эдгээр асуултад цаг гарган, өөрт нь үнэн санагдсан зүйлсийг бичжээ. Энэ нь тэднийг бүрэн тодорхойлох дүгнэлт биш, харин илүү дулаанаар ойлгоход туслах нэг эхлэл юм.",
    patternsTitle: "Харилцааны хэв маяг",
    patternsDescription: (senderName) =>
      senderName ? `${senderName}-ийн хариултаас харагдсан хандлагууд.` : "Тэдний хариултаас харагдсан хандлагууд.",
    fromAnswers: (senderName) => `${senderName || "Тэдний"} хариултаас`,
    ideasTitle: "Тус болж болох санаанууд",
    ideasDescription: (senderName) =>
      senderName ? `${senderName}-ийн хуваалцсанд тохирох байдлаар дэргэд нь байх санаанууд.` : "Тэдний хуваалцсанд тохирох байдлаар дэргэд нь байх санаанууд.",
    doTitle: "Ихэнхдээ сайнаар хүрдэг зүйлс",
    avoidTitle: "Үл ойлголцол нэмэгдэж болох газар",
    tenseTitle: "Байдал хурцдах үед",
    loveTitle: (senderName) => `${senderName || "Тэдэнд"} хайр ингэж мэдрэгдэж магадгүй`,
    originalAnswersTitle: (senderName) => `${senderName || "Тэдний"} эх хариултууд`,
    emptyAnswer: "Хариулт бичээгүй.",
    withCare: "Халамжтайгаар,",
    signoff: (senderName) => (senderName ? `${senderName}-ээс` : "тэдний хуваалцсанаас бүтсэн захиа"),
    footer: (senderName) =>
      `Үр дүн нь ${senderName || "тэдний"} өөрийгөө эргэцүүлсэн асуултуудад өгсөн хариултад тулгуурласан. Энэ нь сэтгэлзүйн үнэлгээ биш бөгөөд бүрэн төгс байх албагүй.`,
    evidenceStrength: "Нотолгооны хүч",
    copyUrl: "Тайлангийн холбоос хуулах",
    copiedUrl: "Хуулагдлаа",
    generatedBy: (modelName) => `үр дүнг ${modelName} үүсгэсэн`
  }
};

function getEnumLabel(value: string, language: SupportedLanguage): string {
  return reportCopy[language].enumLabels[value] ?? value.replace(/_/g, " ");
}

const patternDescriptions: Record<string, string> = {
  secure:
    "They usually feel okay being close, asking for what they need, and working things out after tension.",
  anxious:
    "They may need extra reassurance when things feel distant, unclear, or emotionally shaky.",
  "fearful-avoidant":
    "They may want closeness, but also get scared by it. Going slowly and being consistent can help.",
  "dismissive-avoidant":
    "They may deal with hard feelings by needing space, independence, or time to sort things out alone.",
  quality_time:
    "They feel loved when you spend real, focused time with them without making them compete for attention.",
  words_of_affirmation:
    "They feel loved when you say kind, specific things and remind them what they mean to you.",
  acts_of_service:
    "They feel loved when you help in practical ways and follow through on the things you said you would do.",
  physical_touch:
    "They feel loved through welcome touch, closeness, hugs, or other physical ways of showing care.",
  receiving_gifts:
    "They feel loved by thoughtful gifts or small things that show you remembered them.",
  introverted:
    "They may need quiet time or space to recharge before they have energy to connect again.",
  extroverted:
    "They may feel more energized after talking, doing things together, or being around people they trust.",
  ambiverted:
    "Sometimes they need people, sometimes they need space. It depends on the day and how drained they feel.",
  pursuer:
    "During conflict, they may want to talk right away because fixing it helps them feel okay again.",
  withdrawer:
    "During conflict, they may pull back because they need time to think or calm down before talking.",
  disorganized:
    "During conflict, they may feel pulled in different directions, so patience and clear reassurance help.",
  collaborative:
    "During conflict, they may try to understand both sides and find a way forward together."
};

type ReportPageProps = {
  params: {
    id: string;
  };
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

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
  if (!isUuid(params.id)) {
    notFound();
  }

  const report = await getReport(params.id);

  const recipientName = report.recipientName?.trim();
  const senderName = report.senderName?.trim();
  const outputLanguage = report.outputLanguage ?? defaultLanguage;
  const copy = reportCopy[outputLanguage];
  const narrativeLabels = copy.narrativeLabels(senderName);
  const narratives = Object.entries(report.narrativeSections).map(([key, body]) => ({
    key,
    label: narrativeLabels[key as NarrativeKey],
    body: stripEmDashes(body)
  }));
  const doLines = report.partnerCheatSheet.doThis.map(stripEmDashes);
  const avoidLines = report.partnerCheatSheet.avoidThis.map(stripEmDashes);
  const inConflict = stripEmDashes(report.partnerCheatSheet.inConflictDo);
  const toShowLove = stripEmDashes(report.partnerCheatSheet.toShowLoveDo);
  const caveats = report.caveats.map(stripEmDashes);
  const originalAnswers = report.originalAnswers ?? [];
  const generatedByModel = report.generatedByModel ?? "unknown model";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d4c4b0] via-[#c9b8a4] to-[#b8a690] px-3 py-0 sm:px-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      <main className="relative mx-auto max-w-6xl pt-8 sm:pt-10 lg:max-w-7xl">
        <EnvelopeReportReveal>
          <div
            className="relative mx-auto rounded-sm bg-[#fffef9] px-5 py-8 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_28px_rgba(40,30,20,0.1)] sm:px-10 sm:py-10 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:px-12 lg:py-10"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(255,254,249,0.97) 0%, rgba(255,252,248,0.99) 100%), repeating-linear-gradient(transparent, transparent 30px, rgba(180, 140, 100, 0.055) 30px, rgba(180, 140, 100, 0.055) 31px)`
            }}
          >
          <header className="font-letter text-paper-ink lg:col-span-12">
            <div className="max-w-4xl">
              <p className="text-3xl font-normal leading-tight sm:text-4xl">
                {copy.dear(recipientName)}
              </p>

              <p className="mt-5 text-xl font-light leading-relaxed sm:text-2xl">
                {copy.intro(senderName)}
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
            <p className="text-2xl font-normal text-paper-muted">
              {copy.patternsTitle}
            </p>
            <p className="mt-1 text-lg font-light leading-relaxed text-paper-muted">
              {copy.patternsDescription(senderName)}
            </p>

            <ul className="mt-5 grid gap-3">
              {Object.entries(report.labels).map(([key, label]) => (
                <li
                  key={key}
                  className="list-none rounded-sm border border-paper-line/80 bg-paper-cream/70 px-4 py-3"
                >
                  <p className="text-lg font-normal text-paper-muted">
                    {copy.labelNames[key as LabelKey]}
                  </p>
                  <p className="mt-1 text-xl font-light capitalize leading-snug">
                    <RelationshipPatternValueReveal
                      description={patternDescriptions[label.value]}
                      label={copy.labelNames[key as LabelKey]}
                    >
                      {getEnumLabel(label.value, outputLanguage)}
                    </RelationshipPatternValueReveal>
                    <span className="mt-1 block text-base font-light text-paper-pencil/80">
                      {copy.evidenceStrength}: {label.certaintyPercent}%
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
            <p className="text-2xl font-normal text-paper-muted">
              {copy.fromAnswers(senderName)}
            </p>

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
                  {copy.ideasTitle}
                </p>
                <p className="mt-1 text-lg font-light leading-relaxed text-paper-muted">
                  {copy.ideasDescription(senderName)}
                </p>
              </div>

              <div className="grid gap-7 sm:grid-cols-2 lg:col-span-8">
                <div>
                  <h3 className="text-xl font-normal text-paper-ink">
                    {copy.doTitle}
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
                    {copy.avoidTitle}
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
                      {copy.tenseTitle}
                    </h3>
                    <p className="mt-2 font-light leading-relaxed">
                      {inConflict}
                    </p>
                  </div>
                  <div className="mt-6 sm:mt-0">
                    <h3 className="text-xl font-normal">
                      {copy.loveTitle(senderName)}
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
                  {copy.originalAnswersTitle(senderName)}
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
                        {item.answer || copy.emptyAnswer}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <LetterDivider />

            <p className="mt-10 text-3xl font-normal">{copy.withCare}</p>
            <p className="mt-1 text-xl font-light text-paper-muted">
              {copy.signoff(senderName)}
            </p>

          </section>
          <div className="mt-8 flex justify-end lg:col-span-12">
            <CopyReportUrlButton
              label={copy.copyUrl}
              copiedLabel={copy.copiedUrl}
            />
          </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center font-journal text-lg leading-relaxed text-paper-ink/85">
            {copy.footer(senderName)}
          </p>
          <p className="sr-only">Report id: {params.id}</p>
        </EnvelopeReportReveal>
      </main>
      <p className="fixed bottom-3 right-4 z-20 font-journal text-xs text-paper-ink/55">
        {copy.generatedBy(generatedByModel)}
      </p>
    </div>
  );
}
