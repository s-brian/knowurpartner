"use client";

import { type ReactNode, useState } from "react";

type RelationshipPatternValueRevealProps = {
  children: ReactNode;
  label: string;
};

export function RelationshipPatternValueReveal({
  children,
  label
}: RelationshipPatternValueRevealProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span className="relative inline-block min-w-[9rem] align-baseline">
      <span
        className={`transition-opacity duration-300 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!revealed}
      >
        {children}
      </span>

      {!revealed ? (
        <button
          type="button"
          className="absolute inset-x-[-0.65rem] top-1/2 h-[1.6em] -translate-y-1/2 overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-paper-pencil/70"
          onClick={() => setRevealed(true)}
          aria-label={`Reveal ${label}`}
        >
          <span className="sr-only">Reveal {label}</span>
          <span className="absolute left-[0.15rem] top-[13%] h-[0.58em] w-[calc(100%-0.2rem)] -rotate-[2deg] rounded-[999px_6px_5px_999px] bg-[#050506] before:absolute before:-left-2 before:top-[18%] before:h-[0.35em] before:w-4 before:-rotate-[10deg] before:rounded-full before:bg-[#050506] after:absolute after:-right-2 after:bottom-[12%] after:h-[0.32em] after:w-5 after:rotate-[8deg] after:rounded-full after:bg-[#050506]" />
          <span className="absolute left-[-0.1rem] top-[42%] h-[0.54em] w-[calc(100%+0.25rem)] rotate-[2deg] rounded-[6px_999px_999px_4px] bg-[#050506] before:absolute before:-left-2 before:bottom-[10%] before:h-[0.22em] before:w-5 before:rotate-[8deg] before:rounded-full before:bg-[#050506] after:absolute after:-right-3 after:top-[12%] after:h-[0.4em] after:w-5 after:-rotate-[5deg] after:rounded-full after:bg-[#050506]" />
          <span className="absolute left-[6%] top-[78%] h-[0.12em] w-[80%] -rotate-[4deg] rounded-full bg-[#050506] before:absolute before:-left-3 before:top-0 before:h-full before:w-4 before:-rotate-[12deg] before:rounded-full before:bg-[#050506]" />
          <span className="absolute right-[4%] top-[20%] h-[0.1em] w-[18%] rotate-[9deg] rounded-full bg-paper-cream/75" />
        </button>
      ) : null}
    </span>
  );
}
