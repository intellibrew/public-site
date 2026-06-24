"use client";

type PersonaVizVariant = "design" | "mechanical" | "manufacturing";

type PersonaVizProps = {
  variant: PersonaVizVariant;
};

export function PersonaViz({ variant }: PersonaVizProps) {
  if (variant === "design") {
    return (
      <svg className="factory-narrative-pviz" viewBox="0 0 128 36" aria-hidden="true">
        <path
          className="factory-narrative-mvf"
          strokeWidth="1.3"
          fill="none"
          d="M14,27 L14,13 L34,13 L44,6 L88,6 L88,17 L114,17 L114,27"
        />
        <path
          className="factory-narrative-mvd"
          strokeWidth="1.6"
          fill="none"
          d="M14,27 L14,13 L34,13 L44,6 L88,6 L88,17 L114,17 L114,27"
        />
        <g className="factory-narrative-mvdim" strokeWidth="1">
          <line x1="14" y1="32" x2="114" y2="32" />
          <line x1="14" y1="29.5" x2="14" y2="34.5" />
          <line x1="114" y1="29.5" x2="114" y2="34.5" />
        </g>
        <circle className="factory-narrative-mvdot" r="2.1">
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            path="M14,27 L14,13 L34,13 L44,6 L88,6 L88,17 L114,17 L114,27"
          />
        </circle>
      </svg>
    );
  }

  if (variant === "mechanical") {
    return (
      <svg className="factory-narrative-pviz" viewBox="0 0 128 36" aria-hidden="true">
        <line
          x1="6"
          y1="8"
          x2="102"
          y2="8"
          stroke="var(--narrative-coral)"
          strokeWidth="1"
          strokeDasharray="3 4"
          opacity="0.7"
        />
        <text
          x="124"
          y="11"
          textAnchor="end"
          fontFamily="var(--font-fragment)"
          fontSize="7"
          fill="var(--narrative-coral)"
        >
          takt
        </text>
        <rect className="factory-narrative-mebar b1" x="12" y="4" width="15" height="28" rx="2" />
        <rect className="factory-narrative-mebar b2" x="34" y="4" width="15" height="28" rx="2" />
        <rect className="factory-narrative-mebar b3" x="56" y="4" width="15" height="28" rx="2" />
        <rect className="factory-narrative-mebar b4" x="78" y="4" width="15" height="28" rx="2" />
        <rect className="factory-narrative-mebar b5" x="100" y="4" width="15" height="28" rx="2" />
      </svg>
    );
  }

  return (
    <svg className="factory-narrative-pviz" viewBox="0 0 128 36" aria-hidden="true">
      <rect x="8" y="6" width="98" height="5" rx="2.5" fill="var(--narrative-teal)" opacity="0.12" />
      <rect className="factory-narrative-rfqf" x="8" y="6" width="98" height="5" rx="2.5" />
      <text
        className="factory-narrative-rfqck"
        x="114"
        y="11.5"
        fontFamily="var(--font-fragment)"
        fontSize="8"
        fill="var(--narrative-teal)"
      >
        ✓
      </text>
      <rect x="8" y="16" width="98" height="5" rx="2.5" fill="var(--narrative-teal)" opacity="0.12" />
      <rect
        className="factory-narrative-rfqf"
        x="8"
        y="16"
        width="98"
        height="5"
        rx="2.5"
        style={{ animationDelay: "-1.5s" }}
      />
      <text
        className="factory-narrative-rfqck"
        x="114"
        y="21.5"
        fontFamily="var(--font-fragment)"
        fontSize="8"
        fill="var(--narrative-teal)"
        style={{ animationDelay: "-1.5s" }}
      >
        ✓
      </text>
      <rect x="8" y="26" width="98" height="5" rx="2.5" fill="var(--narrative-teal)" opacity="0.12" />
      <rect
        className="factory-narrative-rfqf"
        x="8"
        y="26"
        width="98"
        height="5"
        rx="2.5"
        style={{ animationDelay: "-3s" }}
      />
      <text
        className="factory-narrative-rfqck"
        x="114"
        y="31.5"
        fontFamily="var(--font-fragment)"
        fontSize="8"
        fill="var(--narrative-teal)"
        style={{ animationDelay: "-3s" }}
      >
        ✓
      </text>
    </svg>
  );
}
