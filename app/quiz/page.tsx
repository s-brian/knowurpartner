"use client";

import { QuestionDoodle } from "@/components/QuestionDoodle";
import { questions } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type GenerateResponse = {
  id: string;
};

const LINE_STEP_PX = 28;
const PAGE_TURN_DURATION_MS = 1467;
const PAGE_FLIP_SOUND_DELAY_MS = 120;
const PAGE_FLIP_SOUND_COOLDOWN_MS = 300;
const NEXT_PAGE_LANDING_ANGLE_DEG = -170;
const PREVIOUS_PAGE_LANDING_ANGLE_DEG = 170;

type Point = {
  x: number;
  y: number;
};

type PageTurnDirection = "next" | "back";

type JournalPagePreviewProps = {
  answer: string;
  isLastQuestion: boolean;
  question: Question;
  questionIndex: number;
};

function JournalPagePreview({
  answer,
  isLastQuestion,
  question,
  questionIndex
}: JournalPagePreviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
      <div className="mb-6 border-b border-dashed border-paper-line pb-4">
        <h1 className="text-2xl text-paper-pencil">
          journal entry #{question.id}:
        </h1>
      </div>

      <h2 className="max-h-32 overflow-y-auto pr-1 text-2xl leading-snug text-paper-ink sm:text-3xl sm:leading-snug md:max-h-36">
        {question.prompt}
      </h2>

      <div className="relative mt-6 flex min-h-0 flex-1 flex-col">
        <div
          className="flex min-h-0 flex-1 rounded-sm border border-paper-pencil/25 bg-paper/80 shadow-inner"
          style={{
            backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_STEP_PX - 1}px, rgba(180, 140, 100, 0.18) ${LINE_STEP_PX - 1}px, rgba(180, 140, 100, 0.18) ${LINE_STEP_PX}px)`
          }}
        >
          <p className="min-h-0 w-full flex-1 whitespace-pre-wrap px-3 py-2 text-xl leading-[28px] text-paper-ink sm:px-4 sm:text-2xl">
            {answer || (
              <span className="text-paper-pencil/50">
                Sometimes I feel like...
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-3 w-3 rounded-full border border-paper-pencil/40 sm:h-3.5 sm:w-3.5 ${
              i === questionIndex
                ? "scale-125 border-paper-margin bg-paper-margin"
                : i < questionIndex
                  ? "bg-paper-pencil/50"
                  : "bg-paper-cream"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-paper-line pt-6">
        <span className="rounded-full border-2 border-paper-pencil/50 px-5 py-2 text-xl text-paper-muted">
          &larr; last page
        </span>
        <span className="rounded-full border-2 border-paper-ink bg-paper-cream px-6 py-2.5 text-xl text-paper-ink shadow-lift">
          {isLastQuestion ? "Finish and seal" : "next page \u2192"}
        </span>
      </div>
    </div>
  );
}

function DoodlePage({ questionId }: { questionId: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-r-md border border-paper-pencil/20 bg-gradient-to-br from-paper-deep to-paper-cream px-4 py-8 shadow-inner">
      <p className="mb-3 text-center text-lg text-paper-pencil">
        a tiny drawing for this one
      </p>
      <QuestionDoodle questionId={questionId} />
    </div>
  );
}

export default function QuizPage() {
  const router = useRouter();
  const bookRef = useRef<HTMLElement>(null);
  const leftPageRef = useRef<HTMLElement>(null);
  const leftUnderlayRef = useRef<HTMLDivElement>(null);
  const leftFlipperRef = useRef<HTMLDivElement>(null);
  const flipperRef = useRef<HTMLDivElement>(null);
  const armSvgRef = useRef<SVGSVGElement>(null);
  const armPathRef = useRef<SVGPathElement>(null);
  const wristCapRef = useRef<SVGCircleElement>(null);
  const flipRunning = useRef(false);
  const pageTurnDirection = useRef<PageTurnDirection>("next");
  const pageTurnFrame = useRef<number | null>(null);
  const pageFlipAudio = useRef<HTMLAudioElement | null>(null);
  const pageFlipSoundTimer = useRef<number | null>(null);
  const lastPageFlipSoundAt = useRef(0);

  const [wideBook, setWideBook] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [handAnimating, setHandAnimating] = useState(false);

  const [answers, setAnswers] = useState<string[]>(
    Array.from({ length: questions.length }, () => "")
  );
  const [includeOriginalAnswers, setIncludeOriginalAnswers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[displayIndex];
  const isLastQuestion = displayIndex === questions.length - 1;
  const nextQuestionIndex = Math.min(displayIndex + 1, questions.length - 1);
  const nextQuestion = questions[nextQuestionIndex];
  const nextQuestionIsLast = nextQuestionIndex === questions.length - 1;
  const previousQuestionIndex = Math.max(displayIndex - 1, 0);
  const previousQuestion = questions[previousQuestionIndex];
  const previousQuestionIsLast = previousQuestionIndex === questions.length - 1;

  const progressLabel = useMemo(
    () => `Page ${displayIndex + 1} of ${questions.length}`,
    [displayIndex]
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setWideBook(mq.matches);
      setPrefersReducedMotion(motion.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  const flipBook = wideBook && !prefersReducedMotion;
  const pageTurnLocked = flipRunning.current || handAnimating;

  function clearPageTurnFrame() {
    if (pageTurnFrame.current === null) return;
    cancelAnimationFrame(pageTurnFrame.current);
    pageTurnFrame.current = null;
  }

  function clearPageFlipSoundTimer() {
    if (pageFlipSoundTimer.current === null) return;
    window.clearTimeout(pageFlipSoundTimer.current);
    pageFlipSoundTimer.current = null;
  }

  function resetPageTurnVisuals() {
    if (leftPageRef.current) {
      leftPageRef.current.style.transform = "translate3d(0, 0, 0) skewY(0deg)";
      leftPageRef.current.style.transformOrigin = "";
      leftPageRef.current.style.transformStyle = "";
      leftPageRef.current.style.opacity = "1";
      leftPageRef.current.style.zIndex = "";
    }
    if (leftUnderlayRef.current) {
      leftUnderlayRef.current.style.opacity = "0";
    }
    if (leftFlipperRef.current) {
      leftFlipperRef.current.style.transition = "";
      leftFlipperRef.current.style.transform = "rotateY(0deg) translateZ(0)";
      leftFlipperRef.current.style.transformOrigin = "";
      leftFlipperRef.current.style.transformStyle = "";
      leftFlipperRef.current.style.opacity = "0";
      leftFlipperRef.current.style.zIndex = "";
    }
    if (flipperRef.current) {
      flipperRef.current.style.transition = "";
      flipperRef.current.style.transform = "rotateY(0deg) translateZ(0)";
      flipperRef.current.style.transformOrigin = "";
      flipperRef.current.style.transformStyle = "";
      flipperRef.current.style.opacity = "1";
      flipperRef.current.style.zIndex = "";
    }
    if (armSvgRef.current) {
      armSvgRef.current.style.opacity = "0";
      armSvgRef.current.style.transform = "";
      armSvgRef.current.style.zIndex = "";
      armSvgRef.current.style.isolation = "";
    }
  }

  /** Keep the arm above 3D page layers (flipper uses translateZ while turning). */
  function liftArmAboveBook() {
    const svg = armSvgRef.current;
    if (!svg) return;
    svg.style.zIndex = "240";
    svg.style.transform = "translateZ(160px)";
    svg.style.isolation = "isolate";
  }

  function playPageFlipSound(direction: PageTurnDirection) {
    try {
      const now = performance.now();
      if (now - lastPageFlipSoundAt.current < PAGE_FLIP_SOUND_COOLDOWN_MS) {
        return;
      }
      lastPageFlipSoundAt.current = now;

      const audio =
        pageFlipAudio.current ??
        new Audio("/audio/page-flip-01a.mp3");
      pageFlipAudio.current = audio;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0.65;
      audio.playbackRate = 1;
      void audio.play();
    } catch {
      // Sound is a nice-to-have; keep page turns working if audio is blocked.
    }
  }

  useEffect(() => {
    return () => {
      clearPageTurnFrame();
      clearPageFlipSoundTimer();
    };
  }, []);

  function updateAnswer(value: string) {
    setAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[displayIndex] = value;
      return nextAnswers;
    });
  }

  function easeInOutCubic(value: number) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function cubicBezierPoint(
    progress: number,
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point
  ): Point {
    const inverse = 1 - progress;
    return {
      x:
        inverse ** 3 * p0.x +
        3 * inverse ** 2 * progress * p1.x +
        3 * inverse * progress ** 2 * p2.x +
        progress ** 3 * p3.x,
      y:
        inverse ** 3 * p0.y +
        3 * inverse ** 2 * progress * p1.y +
        3 * inverse * progress ** 2 * p2.y +
        progress ** 3 * p3.y
    };
  }

  function drawArmFrame(progress: number, direction: PageTurnDirection) {
    const book = bookRef.current;
    const svg = armSvgRef.current;
    const path = armPathRef.current;
    const cap = wristCapRef.current;

    if (!book || !svg || !path || !cap) return;

    const { width, height } = book.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const easedProgress = easeInOutCubic(progress);
    const wrist =
      direction === "next"
        ? cubicBezierPoint(
            easedProgress,
            { x: width * 0.93, y: height + 34 },
            { x: width * 0.82, y: height * 0.52 },
            { x: width * 0.28, y: height * 0.49 },
            { x: width * 0.08, y: height + 16 }
          )
        : cubicBezierPoint(
            easedProgress,
            { x: width * 0.08, y: height + 16 },
            { x: width * 0.28, y: height * 0.49 },
            { x: width * 0.82, y: height * 0.52 },
            { x: width * 0.93, y: height + 34 }
          );
    const shoulder =
      direction === "next"
        ? { x: width + 54, y: height + 78 }
        : { x: -54, y: height + 78 };
    const midpoint = {
      x: (shoulder.x + wrist.x) / 2,
      y: (shoulder.y + wrist.y) / 2
    };
    const delta = {
      x: wrist.x - shoulder.x,
      y: wrist.y - shoulder.y
    };
    const length = Math.max(Math.hypot(delta.x, delta.y), 1);
    let perpendicular = {
      x: -delta.y / length,
      y: delta.x / length
    };

    if (perpendicular.y > 0) {
      perpendicular = {
        x: -perpendicular.x,
        y: -perpendicular.y
      };
    }

    const elbow = {
      x: midpoint.x + perpendicular.x * 90,
      y: midpoint.y + perpendicular.y * 90
    };
    const fade =
      progress < 0.08
        ? progress / 0.08
        : progress > 0.92
          ? (1 - progress) / 0.08
          : 1;

    svg.style.opacity = "1";
    liftArmAboveBook();
    path.setAttribute(
      "d",
      `M ${shoulder.x} ${shoulder.y} C ${elbow.x} ${elbow.y} ${elbow.x} ${elbow.y} ${wrist.x} ${wrist.y}`
    );
    path.setAttribute("opacity", String(Math.max(0, fade)));
    cap.setAttribute("cx", String(wrist.x));
    cap.setAttribute("cy", String(wrist.y));
    cap.setAttribute("opacity", String(Math.max(0, fade)));

    const page =
      direction === "next" ? flipperRef.current : leftFlipperRef.current;

    if (page) {
      const pageDelayProgress = Math.max(
        0,
        Math.min(1, (easedProgress - 0.1) / 0.78)
      );
      const pageProgress =
        pageDelayProgress < 0.5
          ? 2 * pageDelayProgress * pageDelayProgress
          : 1 - Math.pow(-2 * pageDelayProgress + 2, 2) / 2;

      if (direction === "next") {
        page.style.zIndex = "50";
        page.style.transformOrigin = "left center";
        page.style.transformStyle = "preserve-3d";
        const angle = NEXT_PAGE_LANDING_ANGLE_DEG * pageProgress;
        page.style.transform = `rotateY(${angle}deg) translateZ(4px)`;
      } else {
        if (leftUnderlayRef.current) {
          leftUnderlayRef.current.style.opacity = "1";
        }
        page.style.opacity = "1";
        page.style.zIndex = "60";
        page.style.transformOrigin = "right center";
        page.style.transformStyle = "preserve-3d";
        const angle = PREVIOUS_PAGE_LANDING_ANGLE_DEG * pageProgress;
        page.style.transform = `rotateY(${angle}deg) translateZ(4px)`;
      }
    }
  }

  function finishPageTurn() {
    if (!flipRunning.current) return;
    const direction = pageTurnDirection.current;
    flipRunning.current = false;
    clearPageTurnFrame();

    flushSync(() => {
      setDisplayIndex((i) =>
        direction === "next"
          ? Math.min(i + 1, questions.length - 1)
          : Math.max(i - 1, 0)
      );
    });

    resetPageTurnVisuals();
    requestAnimationFrame(() => {
      setHandAnimating(false);
    });
  }

  function runPageTurnAnimation(direction: PageTurnDirection) {
    clearPageTurnFrame();
    const startTime = performance.now();
    drawArmFrame(0, direction);

    const drawFrame = (timestamp: number) => {
      const progress = Math.min(
        1,
        (timestamp - startTime) / PAGE_TURN_DURATION_MS
      );

      drawArmFrame(progress, direction);

      if (progress < 1) {
        pageTurnFrame.current = requestAnimationFrame(drawFrame);
        return;
      }

      pageTurnFrame.current = null;
      finishPageTurn();
    };

    pageTurnFrame.current = requestAnimationFrame(drawFrame);
  }

  function startPageTurn(direction: PageTurnDirection) {
    if (prefersReducedMotion || flipRunning.current) return false;
    if (direction === "next" && isLastQuestion) return false;
    if (direction === "back" && displayIndex === 0) return false;

    pageTurnDirection.current = direction;
    flipRunning.current = true;
    clearPageFlipSoundTimer();
    pageFlipSoundTimer.current = window.setTimeout(() => {
      pageFlipSoundTimer.current = null;
      playPageFlipSound(direction);
    }, PAGE_FLIP_SOUND_DELAY_MS);
    setHandAnimating(true);
    resetPageTurnVisuals();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => runPageTurnAnimation(direction));
    });
    return true;
  }

  function goBack() {
    if (pageTurnLocked || isSubmitting) return;
    setError(null);
    if (startPageTurn("back")) return;
    setDisplayIndex((index) => Math.max(index - 1, 0));
    flipRunning.current = false;
  }

  function goNext() {
    if (isSubmitting || pageTurnLocked) return;
    setError(null);
    if (isLastQuestion) return;
    if (startPageTurn("next")) return;
    setDisplayIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function jumpToQuestion(index: number) {
    if (isSubmitting || pageTurnLocked) return;
    setError(null);
    clearPageTurnFrame();
    resetPageTurnVisuals();
    setHandAnimating(false);
    setDisplayIndex(index);
    flipRunning.current = false;
  }

  async function submitAnswers() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers, includeOriginalAnswers })
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errorData?.error ?? "Unable to generate report.");
      }

      const data = (await response.json()) as GenerateResponse;
      router.push(`/report/${data.id}`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (isSubmitting || pageTurnLocked) return;
    if (isLastQuestion) {
      void submitAnswers();
    } else {
      goNext();
    }
  }

  const doodleId = questions[displayIndex].id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8dcc4] via-paper-deep to-[#dcccb8] px-3 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 px-1 sm:px-2">
          <Link
            href="/"
            className="shrink-0 text-lg text-paper-muted underline decoration-paper-line decoration-2 underline-offset-4 hover:text-paper-ink"
          >
            ← cover
          </Link>
          <p className="text-right text-lg text-paper-pencil">{progressLabel}</p>
        </div>

        <div className="overflow-visible md:[perspective:2400px] md:[perspective-origin:45%_50%]">
          <article
            ref={bookRef}
            className="relative z-0 flex h-[780px] min-h-0 flex-col overflow-visible rounded-sm bg-paper-cream shadow-sheet sm:h-[830px] md:h-[700px] md:flex-row md:items-stretch md:rounded-md [transform-style:preserve-3d]"
          >
            <div className="hidden w-4 shrink-0 bg-gradient-to-b from-paper-pencil/30 via-paper-pencil/10 to-paper-pencil/30 shadow-[inset_-2px_0_5px_rgba(61,47,47,0.08)] md:block" />

            <div className="relative flex h-full min-h-0 flex-1 basis-0 [transform-style:preserve-3d]">
            <section
              ref={leftPageRef}
              className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-visible border-paper-line/30 px-6 pb-8 pt-9 will-change-transform sm:px-10 sm:pb-10 sm:pt-11 md:border-r md:border-dashed"
              data-testid="left-journal-page"
              style={{ transform: "translate3d(0, 0, 0) skewY(0deg)" }}
            >
              <div className="mb-6 border-b border-dashed border-paper-line pb-4">
                <h1 className="text-2xl text-paper-pencil">
                  journal entry #{currentQuestion.id}:
                </h1>
              </div>

              <h2 className="max-h-32 overflow-y-auto pr-1 text-2xl leading-snug text-paper-ink sm:text-3xl sm:leading-snug md:max-h-36">
                {currentQuestion.prompt}
              </h2>

              <div className="relative mt-6 flex min-h-0 flex-1 flex-col">
                <label htmlFor="journal-answer" className="sr-only">
                  Your answer
                </label>
                <div
                  className="flex min-h-0 flex-1 rounded-sm border border-paper-pencil/25 bg-paper/80 shadow-inner"
                  style={{
                    backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_STEP_PX - 1}px, rgba(180, 140, 100, 0.18) ${LINE_STEP_PX - 1}px, rgba(180, 140, 100, 0.18) ${LINE_STEP_PX}px)`
                  }}
                >
                  <textarea
                    id="journal-answer"
                    value={answers[displayIndex]}
                    onChange={(event) => updateAnswer(event.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    rows={flipBook ? 10 : 8}
                    className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent px-3 py-2 text-xl leading-[28px] text-paper-ink outline-none ring-0 placeholder:text-paper-pencil/50 focus:ring-0 sm:px-4 sm:text-2xl"
                    placeholder="Sometimes I feel like..."
                    spellCheck
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(i)}
                    disabled={isSubmitting || pageTurnLocked}
                    className={`h-3 w-3 rounded-full border border-paper-pencil/40 transition sm:h-3.5 sm:w-3.5 ${
                      i === displayIndex
                        ? "scale-125 border-paper-margin bg-paper-margin"
                        : i < displayIndex
                          ? "bg-paper-pencil/50"
                          : "bg-paper-cream"
                    } disabled:opacity-50`}
                    aria-label={`Go to question ${q.id}`}
                  />
                ))}
              </div>

              {error ? (
                <p
                  className="mt-5 rounded-sm border border-red-200 bg-red-50/90 px-3 py-2 text-lg text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-paper-line pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={displayIndex === 0 || isSubmitting || pageTurnLocked}
                  className="rounded-full border-2 border-paper-pencil/50 px-5 py-2 text-xl text-paper-muted transition enabled:hover:border-paper-ink enabled:hover:text-paper-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← last page
                </button>

                {isLastQuestion ? (
                  <div className="flex flex-col items-end gap-3">
                    <label className="flex max-w-xs items-center gap-3 text-right text-lg leading-snug text-paper-muted">
                      <span>Let my partner see my original answer</span>
                      <input
                        type="checkbox"
                        checked={includeOriginalAnswers}
                        onChange={(event) =>
                          setIncludeOriginalAnswers(event.target.checked)
                        }
                        disabled={isSubmitting || pageTurnLocked}
                        className="h-5 w-5 shrink-0 accent-paper-ink disabled:opacity-50"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void submitAnswers()}
                      disabled={isSubmitting || pageTurnLocked}
                      className="rounded-full border-2 border-paper-ink bg-paper-ink px-6 py-2.5 text-xl text-paper-cream shadow-lift transition enabled:hover:-translate-y-0.5 enabled:hover:bg-paper-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Putting your letter together..." : "Finish and seal"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isSubmitting || pageTurnLocked}
                    className="rounded-full border-2 border-paper-ink bg-paper-cream px-6 py-2.5 text-xl text-paper-ink shadow-lift transition enabled:hover:-translate-y-0.5 enabled:hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pageTurnLocked ? "Turning..." : "next page →"}
                  </button>
                )}
              </div>
            </section>

              {flipBook ? (
                <>
                  <div
                    ref={leftUnderlayRef}
                    className="pointer-events-none absolute inset-0 z-20 border-paper-line/30 bg-paper-cream opacity-0 md:border-r md:border-dashed"
                    aria-hidden
                  >
                    <JournalPagePreview
                      answer={answers[previousQuestionIndex]}
                      isLastQuestion={previousQuestionIsLast}
                      question={previousQuestion}
                      questionIndex={previousQuestionIndex}
                    />
                  </div>
                  <div
                    ref={leftFlipperRef}
                    className="book-preserve-3d pointer-events-none absolute inset-0 z-0 opacity-0 will-change-transform"
                    style={{
                      transform: "rotateY(0deg) translateZ(0)"
                    }}
                    aria-hidden
                  >
                    <div className="book-backface-hidden absolute inset-0 border-paper-line/30 bg-paper-cream md:border-r md:border-dashed">
                      <JournalPagePreview
                        answer={answers[displayIndex]}
                        isLastQuestion={isLastQuestion}
                        question={currentQuestion}
                        questionIndex={displayIndex}
                      />
                    </div>
                    <div
                      className="book-backface-hidden absolute inset-0"
                      style={{ transform: "rotateY(180deg)" }}
                    >
                      <DoodlePage questionId={previousQuestion.id} />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {flipBook ? (
              <div className="relative z-30 hidden h-full flex-1 basis-0 overflow-visible md:block [transform-style:preserve-3d]">
                <DoodlePage questionId={nextQuestion.id} />
                <div
                  ref={flipperRef}
                  className="book-preserve-3d absolute inset-0 will-change-transform"
                  style={{
                    transform: "rotateY(0deg) translateZ(0)"
                  }}
                >
                  <div className="book-backface-hidden absolute inset-0">
                    <DoodlePage questionId={doodleId} />
                  </div>
                  <div
                    className="book-backface-hidden absolute inset-0 rounded-r-md border border-paper-pencil/15 bg-paper-cream shadow-[inset_0_0_40px_rgba(0,0,0,0.04)]"
                    style={{ transform: "rotateY(180deg)" }}
                    aria-hidden
                  >
                    <JournalPagePreview
                      answer={answers[nextQuestionIndex]}
                      isLastQuestion={nextQuestionIsLast}
                      question={nextQuestion}
                      questionIndex={nextQuestionIndex}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {!prefersReducedMotion ? (
              <svg
                ref={armSvgRef}
                className="pointer-events-none absolute inset-0 z-[240] h-full w-full overflow-visible opacity-0 [transform:translateZ(160px)]"
                data-testid="page-turn-arm"
                aria-hidden
              >
                <path
                  ref={armPathRef}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="14"
                  opacity="0"
                />
                <circle ref={wristCapRef} r="7" fill="#1a1a1a" opacity="0" />
              </svg>
            ) : null}
          </article>

          {!flipBook ? (
            <div className="mt-6 rounded-sm border border-paper-pencil/20 bg-paper-cream/90 p-6 shadow-sheet">
              <p className="mb-4 text-center text-lg text-paper-pencil">
                {wideBook
                  ? "Page turns are simplified when reduced motion is on."
                  : "On a wider screen this becomes an open book with a turning page."}
              </p>
              <div className="mx-auto flex max-w-xs justify-center">
                <QuestionDoodle questionId={doodleId} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
