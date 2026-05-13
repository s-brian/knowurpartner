"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

const ARM_BOW_PX = 72;
const ARM_HOVER_DURATION_MS = 650;

export default function HomePage() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const leftCapRef = useRef<SVGCircleElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);
  const rightCapRef = useRef<SVGCircleElement>(null);
  const rightWrist = useRef<Point | null>(null);
  const hoverFrame = useRef<number | null>(null);

  function toSvgPoint(pageX: number, pageY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: pageX, y: pageY };

    const rect = svg.getBoundingClientRect();
    return {
      x: pageX - rect.left,
      y: pageY - rect.top
    };
  }

  function getCardEdges() {
    const card = cardRef.current;
    if (!card) return null;

    const rect = card.getBoundingClientRect();
    return {
      leftTip: toSvgPoint(rect.left, rect.top + rect.height * 0.68),
      rightTip: toSvgPoint(rect.right, rect.top + rect.height * 0.68)
    };
  }

  function getButtonCenter() {
    const button = buttonRef.current;
    if (!button) return null;

    const rect = button.getBoundingClientRect();
    return toSvgPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function getShoulders() {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return null;

    const sceneRect = scene.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return {
      left: toSvgPoint(
        cardRect.left - cardRect.width * 0.15,
        sceneRect.bottom + 55
      ),
      right: toSvgPoint(
        cardRect.right + cardRect.width * 0.15,
        sceneRect.bottom + 55
      )
    };
  }

  function drawArm(
    path: SVGPathElement | null,
    cap: SVGCircleElement | null,
    shoulder: Point,
    wrist: Point,
    bowDir: 1 | -1
  ) {
    if (!path || !cap) return;

    const midpoint = {
      x: (shoulder.x + wrist.x) / 2,
      y: (shoulder.y + wrist.y) / 2
    };
    const delta = {
      x: wrist.x - shoulder.x,
      y: wrist.y - shoulder.y
    };
    const length = Math.max(Math.hypot(delta.x, delta.y), 1);
    const control = {
      x: midpoint.x + (-delta.y / length) * bowDir * ARM_BOW_PX,
      y: midpoint.y + (delta.x / length) * bowDir * ARM_BOW_PX
    };

    path.setAttribute(
      "d",
      `M ${shoulder.x} ${shoulder.y} C ${control.x} ${control.y}, ${control.x} ${control.y}, ${wrist.x} ${wrist.y}`
    );
    cap.setAttribute("cx", String(wrist.x));
    cap.setAttribute("cy", String(wrist.y));
  }

  function easeInOut(value: number) {
    return value < 0.5
      ? 4 * value * value * value
      : 1 - Math.pow(-2 * value + 2, 3) / 2;
  }

  function lerp(start: number, end: number, progress: number) {
    return start + (end - start) * progress;
  }

  function initArms() {
    const edges = getCardEdges();
    const shoulders = getShoulders();
    if (!edges || !shoulders) return;

    rightWrist.current = edges.rightTip;

    drawArm(
      leftArmRef.current,
      leftCapRef.current,
      shoulders.left,
      edges.leftTip,
      -1
    );
    drawArm(
      rightArmRef.current,
      rightCapRef.current,
      shoulders.right,
      edges.rightTip,
      1
    );
  }

  function animateRightArmTo(target: Point) {
    const shoulders = getShoulders();
    if (!shoulders) return;

    const from = rightWrist.current ?? target;
    const startedAt = performance.now();

    if (hoverFrame.current !== null) {
      cancelAnimationFrame(hoverFrame.current);
    }

    const step = (timestamp: number) => {
      const rawProgress = Math.min(
        1,
        (timestamp - startedAt) / ARM_HOVER_DURATION_MS
      );
      const progress = easeInOut(rawProgress);
      const wrist = {
        x: lerp(from.x, target.x, progress),
        y: lerp(from.y, target.y, progress)
      };

      rightWrist.current = wrist;
      drawArm(
        rightArmRef.current,
        rightCapRef.current,
        shoulders.right,
        wrist,
        1
      );

      if (rawProgress < 1) {
        hoverFrame.current = requestAnimationFrame(step);
        return;
      }

      hoverFrame.current = null;
    };

    hoverFrame.current = requestAnimationFrame(step);
  }

  function handleButtonEnter() {
    const center = getButtonCenter();
    if (!center) return;
    animateRightArmTo(center);
  }

  function handleButtonLeave() {
    const edges = getCardEdges();
    if (!edges) return;
    animateRightArmTo(edges.rightTip);
  }

  useEffect(() => {
    const initFrame = requestAnimationFrame(() => {
      requestAnimationFrame(initArms);
    });

    window.addEventListener("resize", initArms);

    return () => {
      cancelAnimationFrame(initFrame);
      if (hoverFrame.current !== null) {
        cancelAnimationFrame(hoverFrame.current);
      }
      window.removeEventListener("resize", initArms);
    };
  });

  return (
    <div
      ref={sceneRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#e8dcc4] via-paper-deep to-[#dcccb8] px-4 py-10 sm:px-6 sm:py-14"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M2 2h76v76H2z' fill='none' stroke='%236b5348' stroke-width='0.5'/%3E%3C/svg%3E")`
        }}
      />

      <main className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
        <div
          ref={cardRef}
          className="relative min-h-[620px] w-full overflow-hidden rounded-md border border-paper-pencil/25 bg-[#6f5146] px-8 pb-12 pt-16 shadow-[0_18px_35px_rgba(55,38,27,0.22),inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:min-h-[680px] sm:px-12 sm:pb-14 sm:pt-20"
        >
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-8 bg-gradient-to-r from-[#3f2d28]/75 via-[#5f453d]/70 to-transparent shadow-[inset_-5px_0_10px_rgba(0,0,0,0.18)]" />
          <div className="pointer-events-none absolute inset-y-4 left-8 w-px bg-paper-cream/25" />
          <div className="pointer-events-none absolute inset-x-5 top-4 h-px bg-paper-cream/30" />
          <div className="pointer-events-none absolute inset-x-5 bottom-4 h-px bg-[#2d201c]/35" />
          <div className="pointer-events-none absolute bottom-3 right-4 top-3 w-3 rounded-r-sm bg-gradient-to-r from-paper-cream/45 to-paper-cream/10" />
          <div className="pointer-events-none absolute inset-4 rounded-sm border border-paper-cream/20" />

          <div className="relative pl-5 text-center text-paper-cream">
            <h1 className="mt-1 text-4xl leading-tight text-paper-cream sm:text-5xl">
              Dear Partner...
              <span className="block text-3xl text-paper-deep sm:text-4xl">
                a way to understand me better
              </span>
            </h1>

            <div className="mx-auto mt-10 max-w-sm border-t border-dashed border-paper-cream/35 pt-8 text-left text-xl leading-relaxed text-paper-deep">
              <p>
                I'll ask you 10 questions about how you love, how you fight, and how actions make you feel.
              </p>
              <p className="mt-4">
               When you're done, you'll get a shareable guide on exactly how to love you.
              </p>
            </div>

            <Link
              ref={buttonRef}
              href="/quiz"
              className="mt-12 inline-block rounded-full border-2 border-paper-cream/80 bg-paper-cream px-8 py-3 text-2xl text-paper-ink shadow-lift transition hover:-translate-y-0.5 hover:bg-paper hover:shadow-sheet active:translate-y-0"
              onBlur={handleButtonLeave}
              onFocus={handleButtonEnter}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
            >
              Open the first page &rarr;
            </Link>

          </div>
        </div>

        <div
          className="pointer-events-none absolute left-[calc(50%+15rem)] top-28 hidden h-72 w-20 rotate-[8deg] sm:block"
          aria-hidden
        >
          <div className="absolute left-7 top-8 h-56 w-4 rounded-sm bg-[#d8a85d] shadow-[0_10px_18px_rgba(55,38,27,0.18)]">
            <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22),transparent_38%,rgba(73,49,35,0.16)_72%,transparent)]" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#7e5a32]/35" />
            <div className="absolute -top-8 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-b-[32px] border-x-transparent border-b-[#caa77a]" />
            <div className="absolute -top-8 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[3px] border-b-[12px] border-x-transparent border-b-[#2f2521]" />
            <div className="absolute -bottom-5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-b-sm border border-[#7f6b62]/50 bg-[#b9aaa0]" />
            <div className="absolute -bottom-12 left-1/2 h-8 w-6 -translate-x-1/2 rounded-b-md rounded-t-sm bg-[#d9a4a1] shadow-[inset_0_2px_4px_rgba(255,255,255,0.35)]" />
          </div>

          <div className="absolute bottom-0 right-0 h-11 w-16 -rotate-[18deg] rounded-sm border border-paper-pencil/20 bg-[#d9a4a1] shadow-[0_8px_15px_rgba(55,38,27,0.16),inset_0_2px_5px_rgba(255,255,255,0.3)]">
            <div className="absolute inset-x-2 top-2 h-px bg-paper-cream/50" />
            <div className="absolute inset-x-2 bottom-2 h-px bg-[#9c7772]/35" />
          </div>
        </div>

        <p className="mt-8 max-w-sm text-center text-lg text-paper-muted">
          Tip: Be honest! The more information you share, the more accurate and helpful the letter will be. 
        </p>
      </main>

      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        aria-hidden
      >
        <path
          ref={leftArmRef}
          data-testid="landing-left-arm"
          fill="none"
          stroke="#1a1a1a"
          strokeLinecap="round"
          strokeWidth="13"
        />
        <circle ref={leftCapRef} r="6.5" fill="#1a1a1a" />
        <path
          ref={rightArmRef}
          data-testid="landing-right-arm"
          fill="none"
          stroke="#1a1a1a"
          strokeLinecap="round"
          strokeWidth="13"
        />
        <circle ref={rightCapRef} r="6.5" fill="#1a1a1a" />
      </svg>
    </div>
  );
}
