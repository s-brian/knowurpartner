type QuestionDoodleProps = {
  questionId: number;
  className?: string;
};

/**
 * Simple inline doodles (one per journal question). Kept abstract and warm.
 */
export function QuestionDoodle({ questionId, className = "" }: QuestionDoodleProps) {
  const stroke = "#6b5348";
  const fillSoft = "rgba(232, 165, 152, 0.35)";
  const fillMint = "rgba(180, 200, 170, 0.4)";

  const common = {
    viewBox: "0 0 200 200",
    className: `h-full w-full max-h-[min(52vw,320px)] ${className}`,
    fill: "none",
    stroke,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (questionId) {
    case 1:
      return (
        <svg {...common} aria-hidden>
          <path d="M40 120 Q70 60 100 80 T160 70" opacity={0.35} />
          <path fill={fillSoft} d="M55 95 L95 75 L120 130 Z" />
          <path d="M50 140h100M70 140v-35M130 140v-45" />
          <circle cx={100} cy={55} r={18} />
          <path d="M88 52h24M100 40v24" />
        </svg>
      );
    case 2:
      return (
        <svg {...common} aria-hidden>
          <circle cx={70} cy={100} r={22} />
          <circle cx={130} cy={100} r={22} />
          <path
            d="M92 100 Q100 120 108 100"
            strokeDasharray="4 6"
            opacity={0.7}
          />
          <path d="M55 155 Q100 130 145 155" opacity={0.4} />
        </svg>
      );
    case 3:
      return (
        <svg {...common} aria-hidden>
          <path
            fill={fillSoft}
            d="M100 45 C60 55 45 95 100 150 C155 95 140 55 100 45Z"
          />
          <path d="M100 60v55M75 90h50" opacity={0.5} />
        </svg>
      );
    case 4:
      return (
        <svg {...common} aria-hidden>
          <rect x={55} y={70} width={90} height={70} rx={8} fill="#faf3e8" />
          <path d="M70 95h60M70 110h45" opacity={0.45} />
          <path fill={fillMint} d="M130 65 L150 85 L130 105 Z" />
          <circle cx={85} cy={135} r={4} fill={stroke} opacity={0.5} />
        </svg>
      );
    case 5:
      return (
        <svg {...common} aria-hidden>
          <path d="M50 70 A50 50 0 1 1 50 130" opacity={0.35} />
          <rect x={75} y={115} width={80} height={45} rx={6} fill="#faf3e8" />
          <path d="M88 130h54M88 142h40" opacity={0.4} />
          <path d="M160 60 L175 75 L160 90" fill={fillSoft} />
        </svg>
      );
    case 6:
      return (
        <svg {...common} aria-hidden>
          <path
            d="M40 140 Q80 40 120 100 T180 60"
            fill="none"
            opacity={0.45}
          />
          <circle cx={55} cy={145} r={14} />
          <circle cx={145} cy={55} r={14} />
        </svg>
      );
    case 7:
      return (
        <svg {...common} aria-hidden>
          <path d="M50 120 Q100 60 150 120" opacity={0.35} />
          <path d="M70 125 L100 145 L130 125" fill={fillMint} />
          <path d="M85 100h30M100 85v30" opacity={0.5} />
        </svg>
      );
    case 8:
      return (
        <svg {...common} aria-hidden>
          <path
            fill={fillSoft}
            d="M60 120 Q100 70 140 120 Q100 155 60 120Z"
          />
          <circle cx={100} cy={95} r={8} />
          <path d="M70 130h60" opacity={0.4} />
        </svg>
      );
    case 9:
      return (
        <svg {...common} aria-hidden>
          <rect x={55} y={55} width={90} height={70} rx={10} fill="#faf3e8" />
          <path d="M75 80h50M75 95h35M75 110h45" opacity={0.35} />
          <path d="M135 65 L155 50 L165 70 Z" fill={fillMint} />
        </svg>
      );
    case 10:
      return (
        <svg {...common} aria-hidden>
          <path d="M100 150 Q70 120 85 90 Q100 55 115 90 Q130 120 100 150Z" />
          <path d="M100 150v-35" opacity={0.5} />
          <path d="M88 118 Q100 108 112 118" fill={fillSoft} />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx={100} cy={100} r={40} opacity={0.2} />
        </svg>
      );
  }
}
