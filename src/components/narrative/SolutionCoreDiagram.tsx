"use client";

export function SolutionCoreDiagram() {
  return (
    <svg
      className="factory-narrative-core-svg"
      viewBox="-30 0 744 380"
      role="img"
      aria-label="Each team's information flows through one AI model into layout, stations, capex, throughput and quality"
    >
      <defs>
        <radialGradient id="narrativeCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(47,230,176,.55)" />
          <stop offset="100%" stopColor="rgba(47,230,176,0)" />
        </radialGradient>
        <linearGradient id="narrativeCoreFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3df0bd" />
          <stop offset="100%" stopColor="#1aa882" />
        </linearGradient>
      </defs>
      <text className="factory-narrative-io-head" x="64" y="40" textAnchor="middle">
        ROLES
      </text>
      <text className="factory-narrative-io-head" x="600" y="40" textAnchor="middle">
        OUTPUTS
      </text>
      <g fill="none" stroke="var(--narrative-teal)" strokeWidth="1.2" opacity="0.26">
        <path id="narrativeIn0" d="M115,90 C200,90 215,190 250,190" />
        <path id="narrativeIn1" d="M115,160 C200,160 220,190 250,190" />
        <path id="narrativeIn2" d="M115,230 C200,230 220,190 250,190" />
        <path id="narrativeIn3" d="M115,300 C200,300 215,190 250,190" />
        <path id="narrativeOut0" d="M410,190 C495,190 470,70 545,70" />
        <path id="narrativeOut1" d="M410,190 C495,190 475,130 545,130" />
        <path id="narrativeOut2" d="M410,190 L545,190" />
        <path id="narrativeOut3" d="M410,190 C495,190 475,250 545,250" />
        <path id="narrativeOut4" d="M410,190 C495,190 470,310 545,310" />
      </g>
      <g fill="none" stroke="var(--narrative-cyan)" strokeWidth="1.4" className="factory-narrative-flowline" opacity="0.68">
        <use href="#narrativeIn0" />
        <use href="#narrativeIn1" />
        <use href="#narrativeIn2" />
        <use href="#narrativeIn3" />
        <use href="#narrativeOut0" />
        <use href="#narrativeOut1" />
        <use href="#narrativeOut2" />
        <use href="#narrativeOut3" />
        <use href="#narrativeOut4" />
      </g>
      <ellipse
        className="factory-narrative-corebreath"
        cx="330"
        cy="190"
        rx="165"
        ry="132"
        fill="url(#narrativeCoreGlow)"
      />
      <g transform="translate(330,190)">
        <rect x="-80" y="-35" width="160" height="70" rx="17" fill="url(#narrativeCoreFill)" />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fontFamily="var(--font-orbitron)"
          fontWeight="600"
          fontSize="19"
          letterSpacing="0.5"
          fill="#04211a"
        >
          NeoFab AI
        </text>
      </g>
      <g fill="var(--narrative-teal)" opacity="0.75">
        <circle cx="115" cy="90" r="2.8" />
        <circle cx="115" cy="160" r="2.8" />
        <circle cx="115" cy="230" r="2.8" />
        <circle cx="115" cy="300" r="2.8" />
      </g>
      <g fill="var(--narrative-cyan)">
        <circle cx="545" cy="70" r="3.1" />
        <circle cx="545" cy="130" r="3.1" />
        <circle cx="545" cy="190" r="3.1" />
        <circle cx="545" cy="250" r="3.1" />
        <circle cx="545" cy="310" r="3.1" />
      </g>
      <g className="factory-narrative-io-lab" textAnchor="end">
        <text x="100" y="94">
          Design
        </text>
        <text x="100" y="164">
          Mechanical Eng
        </text>
        <text x="100" y="234">
          Manufacturing
        </text>
        <text x="100" y="304">
          Supply chain
        </text>
      </g>
      <g className="factory-narrative-io-lab" textAnchor="start">
        <text x="560" y="74">
          Layout
        </text>
        <text x="560" y="134">
          Stations
        </text>
        <text x="560" y="194">
          CapEx
        </text>
        <text x="560" y="254">
          Throughput
        </text>
        <text x="560" y="314">
          Quality / Defect
        </text>
      </g>
      <g fill="var(--narrative-cyan)">
        <circle r="3">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#narrativeIn0" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-0.7s" repeatCount="indefinite">
            <mpath href="#narrativeIn1" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-1.4s" repeatCount="indefinite">
            <mpath href="#narrativeIn2" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-2.1s" repeatCount="indefinite">
            <mpath href="#narrativeIn3" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-0.4s" repeatCount="indefinite">
            <mpath href="#narrativeOut0" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-1s" repeatCount="indefinite">
            <mpath href="#narrativeOut1" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-1.6s" repeatCount="indefinite">
            <mpath href="#narrativeOut2" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-2.2s" repeatCount="indefinite">
            <mpath href="#narrativeOut3" />
          </animateMotion>
        </circle>
        <circle r="3">
          <animateMotion dur="3s" begin="-2.8s" repeatCount="indefinite">
            <mpath href="#narrativeOut4" />
          </animateMotion>
        </circle>
      </g>
    </svg>
  );
}
