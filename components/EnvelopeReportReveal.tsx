"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react";

type EnvelopeReportRevealProps = {
  children: ReactNode;
};

type Point = {
  x: number;
  y: number;
};

const ARM_BOW_PX = 72;
const ARM_HOVER_DURATION_MS = 650;

export function EnvelopeReportReveal({ children }: EnvelopeReportRevealProps) {
  const [state, setState] = useState<"closed" | "opening" | "open">("closed");
  const envelopeRef = useRef<HTMLButtonElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const leftCapRef = useRef<SVGCircleElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);
  const rightCapRef = useRef<SVGCircleElement>(null);
  const rightWrist = useRef<Point | null>(null);
  const hoverFrame = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const opened = state !== "closed";

  function toSvgPoint(pageX: number, pageY: number): Point {
    const svg = svgRef.current;
    if (!svg) return { x: pageX, y: pageY };

    const rect = svg.getBoundingClientRect();
    return {
      x: pageX - rect.left,
      y: pageY - rect.top
    };
  }

  function getEnvelopeAnchors() {
    const envelope = envelopeRef.current;
    if (!envelope) return null;

    const rect = envelope.getBoundingClientRect();
    return {
      leftWrist: toSvgPoint(rect.left + rect.width * 0.18, rect.top + rect.height * 0.72),
      rightWrist: toSvgPoint(rect.right - rect.width * 0.18, rect.top + rect.height * 0.72),
      leftShoulder: toSvgPoint(rect.left + rect.width * 0.08, window.innerHeight + 8),
      rightShoulder: toSvgPoint(rect.right - rect.width * 0.08, window.innerHeight + 8)
    };
  }

  function getSealCenter() {
    const seal = sealRef.current;
    if (!seal) return null;

    const rect = seal.getBoundingClientRect();
    return toSvgPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
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
    const anchors = getEnvelopeAnchors();
    if (!anchors) return;

    rightWrist.current = anchors.rightWrist;
    drawArm(
      leftArmRef.current,
      leftCapRef.current,
      anchors.leftShoulder,
      anchors.leftWrist,
      -1
    );
    drawArm(
      rightArmRef.current,
      rightCapRef.current,
      anchors.rightShoulder,
      anchors.rightWrist,
      1
    );
  }

  function animateRightArmTo(target: Point) {
    const anchors = getEnvelopeAnchors();
    if (!anchors) return;

    const from = rightWrist.current ?? anchors.rightWrist;
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
        anchors.rightShoulder,
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

  function handleEnvelopeEnter() {
    const seal = getSealCenter();
    if (!seal) return;
    animateRightArmTo(seal);
  }

  function handleEnvelopeLeave() {
    const anchors = getEnvelopeAnchors();
    if (!anchors) return;
    animateRightArmTo(anchors.rightWrist);
  }

  function openEnvelope() {
    setState("opening");
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
    }
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      setState("open");
    }, 1650);
  }

  useEffect(() => {
    if (state !== "closed") return undefined;

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
  }, [state]);

  useEffect(() => {
    return () => {
      if (openTimer.current !== null) {
        window.clearTimeout(openTimer.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative mx-auto transition-[min-height] duration-700 ${
        opened
          ? "min-h-0"
          : "fixed inset-0 z-20 flex items-center justify-center overflow-hidden px-4"
      }`}
    >
      {!opened ? (
        <button
          ref={envelopeRef}
          type="button"
          className="group fixed left-1/2 top-1/2 z-20 h-80 w-[min(46rem,88vw)] -translate-x-1/2 -translate-y-1/2 outline-none [perspective:1200px]"
          onClick={openEnvelope}
          onBlur={handleEnvelopeLeave}
          onFocus={handleEnvelopeEnter}
          onMouseEnter={handleEnvelopeEnter}
          onMouseLeave={handleEnvelopeLeave}
          aria-label="Open sealed results letter"
        >
          <span className="absolute inset-x-4 bottom-0 h-56 rounded-sm border border-paper-pencil/25 bg-[#d9c5aa] shadow-[0_24px_42px_rgba(61,47,47,0.24)]" />
          <span className="absolute inset-x-4 bottom-0 h-56 overflow-hidden rounded-sm">
            <span className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-br from-[#eadcc6] via-[#d5bea0] to-[#bfa688]" />
            <span className="absolute bottom-0 left-0 h-full w-1/2 origin-bottom-right skew-y-[28deg] border-r border-paper-pencil/25 bg-[#cfb596]/70" />
            <span className="absolute bottom-0 right-0 h-full w-1/2 origin-bottom-left -skew-y-[28deg] border-l border-paper-pencil/25 bg-[#c7ad8e]/70" />
          </span>
          <span className="absolute inset-x-4 bottom-0 h-56 origin-bottom border border-paper-pencil/20 bg-[#eadcc6] shadow-[0_8px_14px_rgba(61,47,47,0.1)] [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(0deg)] transition-transform duration-500 group-hover:[transform:rotateX(-10deg)]" />
          <span
            ref={sealRef}
            className="absolute left-1/2 top-[10.95rem] h-[4.5rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-[#9e2f2f] shadow-[0_6px_14px_rgba(61,47,47,0.22),inset_0_3px_6px_rgba(255,255,255,0.22),inset_0_-5px_8px_rgba(76,16,16,0.28)] transition-transform group-hover:scale-105"
          >
            <span className="absolute inset-3 rounded-full border border-[#f0c0a8]/35" />
            <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-[#f0c0a8]/45" />
            <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 rotate-[-18deg] bg-[#f0c0a8]/45" />
          </span>
        </button>
      ) : null}

      {state === "closed" ? (
        <svg
          ref={svgRef}
          className="pointer-events-none fixed inset-0 z-30 h-full w-full overflow-visible"
          aria-hidden
        >
          <path
            ref={leftArmRef}
            fill="none"
            stroke="#1a1a1a"
            strokeLinecap="round"
            strokeWidth="13"
          />
          <circle ref={leftCapRef} r="6.5" fill="#1a1a1a" />
          <path
            ref={rightArmRef}
            fill="none"
            stroke="#1a1a1a"
            strokeLinecap="round"
            strokeWidth="13"
          />
          <circle ref={rightCapRef} r="6.5" fill="#1a1a1a" />
        </svg>
      ) : null}

      <div
        className={`relative w-full transition-opacity duration-500 ${
          opened
            ? "opacity-100"
            : "pointer-events-none fixed left-0 top-0 h-0 overflow-hidden opacity-0"
        }`}
        aria-hidden={!opened}
      >
        <div className="relative mx-auto [perspective:2200px]">
          {state === "open" ? children : null}

          {state === "opening" ? (
            <>
              <div className="invisible pointer-events-none">
                {children}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-1/3 z-10 h-1/3 animate-letter-middle-panel overflow-hidden bg-[#fffef9]">
                <div className="absolute inset-x-0 top-[-100%]">
                  {children}
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 top-1/3 z-20 h-1/3 animate-letter-center-cover bg-[#fffef9]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,254,249,0.98), rgba(250,243,232,0.96)), repeating-linear-gradient(transparent, transparent 30px, rgba(180, 140, 100, 0.06) 30px, rgba(180, 140, 100, 0.06) 31px)"
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-40 h-1/3 origin-bottom animate-letter-top-open overflow-hidden bg-[#fffef9]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255,254,249,0.98), rgba(250,243,232,0.96)), repeating-linear-gradient(transparent, transparent 30px, rgba(180, 140, 100, 0.06) 30px, rgba(180, 140, 100, 0.06) 31px)"
                }}
              >
                <div className="absolute inset-0 bg-[#fffef9]">
                  <div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-x-1/2 bg-paper-line/60" />
                </div>
                <div className="absolute inset-0 animate-letter-top-print overflow-hidden bg-[#fffef9]">
                  <div className="absolute inset-x-0 top-0">
                    {children}
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-1/3 origin-top animate-letter-bottom-open overflow-hidden bg-[#fffef9]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(250,243,232,0.96), rgba(255,254,249,0.98)), repeating-linear-gradient(transparent, transparent 30px, rgba(180, 140, 100, 0.06) 30px, rgba(180, 140, 100, 0.06) 31px)"
                }}
              >
                <div className="absolute inset-0 bg-[#fffef9]">
                  <div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-x-1/2 bg-paper-line/60" />
                </div>
                <div className="absolute inset-0 animate-letter-bottom-print overflow-hidden bg-[#fffef9]">
                  <div className="absolute inset-x-0 top-[-200%]">
                    {children}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
