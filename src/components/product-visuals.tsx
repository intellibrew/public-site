"use client";

import { motion } from "framer-motion";

const fontHeading = "var(--font-orbitron), system-ui, sans-serif";
const fontBody = "var(--font-body), system-ui, sans-serif";

const e = "rgba(16,185,129,";

function GridLine({
  x1,
  y1,
  x2,
  y2,
  delay,
  color,
}: {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  delay: number;
  color: string;
}) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="1"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.4 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    />
  );
}

export function FabPlanVisual() {
  const bomRows = [
    { sno: "1", ref: "1FA31B99", part: "-ve 3D_1", qty: "1", mat: "Steel", delay: 0.3 },
    { sno: "2", ref: "C5FCF8EC", part: "3D printed part", qty: "1", mat: "Aluminum", delay: 0.45 },
    { sno: "3", ref: "0C7A152A", part: "Alloy Socket Head", qty: "6", mat: "Aluminum", delay: 0.6 },
    { sno: "4", ref: "F186F313", part: "Alloy Steel Screw", qty: "5", mat: "Aluminum", delay: 0.75 },
    { sno: "5", ref: "5B8E456D", part: "High-Str Bolt", qty: "1", mat: "Steel", delay: 0.9 },
  ];

  const stationItems = [
    { num: 1, name: "Width Grinding", tag: "Bearing Ring", steps: 2, equip: 2, delay: 2.6 },
    { num: 2, name: "OD Rough Grinding", tag: "Bearing Ring", steps: 2, equip: 2, delay: 2.8 },
    { num: 3, name: "ID Rough Grinding", tag: "Bearing Ring", steps: 2, equip: 2, delay: 3.0 },
    { num: 4, name: "OD Finish Grinding", tag: "Bearing Ring", steps: 2, equip: 1, delay: 3.2 },
    { num: 5, name: "Raceway Honing", tag: "Cone Inner", steps: 1, equip: 1, delay: 3.4 },
  ];

  const layoutRooms = [
    { x: 56, y: 56.5, w: 11, h: 6, label: "QC", delay: 4.0 },
    { x: 70, y: 54.5, w: 22, h: 4.5, label: "CUP OUTER RING", delay: 4.1 },
    { x: 56, y: 62, w: 38, h: 3.5, label: "FACTORY LAYOUT", delay: 4.3 },
    { x: 56, y: 67, w: 11, h: 5, label: "INVENTORY", delay: 4.4 },
    { x: 70, y: 67, w: 15, h: 5, label: "ASSEMBLY", delay: 4.5 },
    { x: 88, y: 67, w: 7, h: 5, label: "OFFICE", delay: 4.6 },
  ];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden font-body"
      data-testid="visual-fabplan-svg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-emerald-900/20" />

      <svg viewBox="0 0 100 85" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-emerald">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrow-emerald"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 6 3 L 0 6 z" fill={`${e}0.6)`} />
          </marker>
          <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={`${e}0.6)`} />
            <stop offset="100%" stopColor={`${e}0.1)`} />
          </linearGradient>
        </defs>

        {[20, 40, 60, 80].map((x, i) => (
          <GridLine key={`v${i}`} x1={`${x}`} y1="0" x2={`${x}`} y2="85" delay={i * 0.08} color={`${e}0.08)`} />
        ))}
        {[17, 34, 51, 68].map((y, i) => (
          <GridLine key={`h${i}`} x1="0" y1={`${y}`} x2="100" y2={`${y}`} delay={i * 0.08 + 0.04} color={`${e}0.08)`} />
        ))}

        <motion.text
          x="3"
          y="4.5"
          fontSize="2"
          fontFamily={fontHeading}
          fontWeight="700"
          letterSpacing="0.08em"
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          INPUTS
        </motion.text>

        <motion.rect
          x="2"
          y="7"
          width="46"
          height="3.5"
          rx="0.5"
          fill={`${e}0.06)`}
          stroke={`${e}0.2)`}
          strokeWidth="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        />
        <motion.text
          x="4"
          y="9.5"
          fontSize="1.65"
          fontFamily={fontBody}
          fill={`${e}0.55)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          CAD Model: Hero Pack (031124)
        </motion.text>

        <motion.path
          d="M 4 18 L 4 30 L 16 30 L 16 18 Z M 4 18 L 10 14.5 L 22 14.5 L 16 18 M 16 18 L 22 14.5 L 22 26.5 L 16 30 M 10 14.5 L 10 26.5 L 4 30"
          fill="none"
          stroke={`${e}0.4)`}
          strokeWidth="0.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        <motion.path
          d="M 7 19 L 7 27 L 14 27 L 14 19 Z"
          fill={`${e}0.06)`}
          stroke={`${e}0.2)`}
          strokeWidth="0.25"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        />
        <motion.ellipse
          cx="10.5"
          cy="23"
          rx="2.8"
          ry="3.2"
          fill="none"
          stroke={`${e}0.35)`}
          strokeWidth="0.35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.ellipse
          cx="10.5"
          cy="23"
          rx="1.4"
          ry="1.6"
          fill={`${e}0.05)`}
          stroke={`${e}0.25)`}
          strokeWidth="0.25"
          strokeDasharray="0.6 0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        />
        {[
          { x: 6, y: 20, w: 2.5, h: 0.4 },
          { x: 6, y: 21.5, w: 3, h: 0.4 },
          { x: 6, y: 25, w: 2, h: 0.4 },
          { x: 12, y: 20, w: 2, h: 0.4 },
          { x: 12.5, y: 25, w: 1.5, h: 0.4 },
        ].map((d, i) => (
          <motion.rect
            key={`cad-d-${i}`}
            x={d.x}
            y={d.y}
            width={d.w}
            height={d.h}
            rx="0.1"
            fill={`${e}0.25)`}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.1 + i * 0.08, duration: 0.3 }}
          />
        ))}
        <motion.line
          x1="4"
          y1="22"
          x2="1.5"
          y2="22"
          stroke={`${e}0.2)`}
          strokeWidth="0.15"
          strokeDasharray="0.5 0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.2 }}
        />
        <motion.line
          x1="4"
          y1="26"
          x2="1.5"
          y2="26"
          stroke={`${e}0.2)`}
          strokeWidth="0.15"
          strokeDasharray="0.5 0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.25 }}
        />
        <motion.text
          x="1"
          y="22.3"
          fontSize="0.85"
          fontFamily="monospace"
          fill={`${e}0.5)`}
          textAnchor="end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          45mm
        </motion.text>
        <motion.text
          x="1"
          y="26.3"
          fontSize="0.85"
          fontFamily="monospace"
          fill={`${e}0.5)`}
          textAnchor="end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
        >
          12mm
        </motion.text>

        <motion.line
          x1="16"
          y1="23"
          x2="23"
          y2="20"
          stroke={`${e}0.15)`}
          strokeWidth="0.15"
          strokeDasharray="0.5 0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.15 }}
        />
        <motion.rect
          x="23"
          y="19"
          width="1"
          height="1"
          rx="0.15"
          fill={`${e}0.15)`}
          stroke={`${e}0.25)`}
          strokeWidth="0.15"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        />

        <motion.line
          x1="4"
          y1="18"
          x2="16"
          y2="18"
          stroke={`${e}0.5)`}
          strokeWidth="0.2"
          initial={{ y1: 18, y2: 18 }}
          animate={{ y1: [18, 30, 18], y2: [18, 30, 18] }}
          transition={{ duration: 3, delay: 0.5, repeat: 1, ease: "linear" }}
        />

        <motion.text
          x="6"
          y="32.5"
          fontSize="1.45"
          fontFamily={fontBody}
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          133 solids | 31 parts
        </motion.text>

        
        <motion.rect
          x="24"
          y="12"
          width="24"
          height="2.5"
          rx="0.4"
          fill={`${e}0.05)`}
          stroke={`${e}0.15)`}
          strokeWidth="0.2"
          initial={{ opacity: 0, x: -3 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        />
        <motion.text
          x="25"
          y="13.8"
          fontSize="1.3"
          fontFamily={fontHeading}
          fontWeight="600"
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Bill of Materials
        </motion.text>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <text x="25" y="16.5" fontSize="1.15" fontFamily={fontBody} fill={`${e}0.5)`}>
            S.NO
          </text>
          <text x="29" y="16.5" fontSize="1.15" fontFamily={fontBody} fill={`${e}0.5)`}>
            REF ID
          </text>
          <text x="36" y="16.5" fontSize="1.15" fontFamily={fontBody} fill={`${e}0.5)`}>
            PART NAME
          </text>
          <text x="46" y="16.5" fontSize="1.15" fontFamily={fontBody} fill={`${e}0.5)`}>
            QTY
          </text>
          <line x1="24" y1="17.2" x2="48" y2="17.2" stroke={`${e}0.12)`} strokeWidth="0.2" />
        </motion.g>

        {bomRows.map((row, i) => (
          <motion.g
            key={`bom-${i}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: row.delay }}
          >
            <text x="25.5" y={18.5 + i * 2.8} fontSize="1.2" fontFamily="monospace" fill={`${e}0.5)`}>
              {row.sno}
            </text>
            <text x="29" y={18.5 + i * 2.8} fontSize="1.1" fontFamily="monospace" fill={`${e}0.45)`}>
              {row.ref}
            </text>
            <text x="36" y={18.5 + i * 2.8} fontSize="1.15" fontFamily={fontBody} fill={`${e}0.65)`}>
              {row.part}
            </text>
            <text x="46.5" y={18.5 + i * 2.8} fontSize="1.2" fontFamily="monospace" fill={`${e}0.5)`} textAnchor="middle">
              {row.qty}
            </text>
            <line x1="24" y1={19.2 + i * 2.8} x2="48" y2={19.2 + i * 2.8} stroke={`${e}0.06)`} strokeWidth="0.15" />
          </motion.g>
        ))}

        <motion.rect
          x="24"
          y="33"
          width="7"
          height="2"
          rx="0.6"
          fill={`${e}0.12)`}
          stroke={`${e}0.3)`}
          strokeWidth="0.25"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
        />
        <motion.text
          x="25"
          y="34.4"
          fontSize="1"
          fontFamily={fontHeading}
          fontWeight="600"
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15 }}
        >
          UNIQUE
        </motion.text>
        <motion.text
          x="32"
          y="34.4"
          fontSize="1.3"
          fontFamily={fontHeading}
          fontWeight="700"
          fill={`${e}0.7)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          31
        </motion.text>
        <motion.rect
          x="36"
          y="33"
          width="7"
          height="2"
          rx="0.6"
          fill={`${e}0.12)`}
          stroke={`${e}0.3)`}
          strokeWidth="0.25"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        />
        <motion.text
          x="37"
          y="34.4"
          fontSize="1"
          fontFamily={fontHeading}
          fontWeight="600"
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
        >
          TOTAL
        </motion.text>
        <motion.text
          x="43.5"
          y="34.4"
          fontSize="1.3"
          fontFamily={fontHeading}
          fontWeight="700"
          fill={`${e}0.7)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          116
        </motion.text>

        <motion.path
          d="M 12 33 C 12 36, 12 36, 15 38"
          fill="none"
          stroke={`${e}0.3)`}
          strokeWidth="0.4"
          markerEnd="url(#arrow-emerald)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        />
        <motion.path
          d="M 35 35 C 35 37, 30 37, 28 38"
          fill="none"
          stroke={`${e}0.3)`}
          strokeWidth="0.4"
          markerEnd="url(#arrow-emerald)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.55 }}
        />

        <motion.rect
          x="2"
          y="38"
          width="46"
          height="5.5"
          rx="0.8"
          fill={`${e}0.04)`}
          stroke={`${e}0.3)`}
          strokeWidth="0.3"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        />
        <motion.rect
          x="3"
          y="38.8"
          width="0"
          height="3.8"
          rx="0.4"
          fill={`${e}0.12)`}
          animate={{ width: [0, 44] }}
          transition={{ duration: 1.5, delay: 1.8, ease: "easeOut" }}
        />
        <motion.text
          x="25"
          y="41.2"
          fontSize="1.6"
          fontFamily={fontHeading}
          fontWeight="700"
          fill={`${e}0.6)`}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9 }}
        >
          GENERATE PROCESS FLOW
        </motion.text>
        <motion.text
          x="25"
          y="42.8"
          fontSize="1.05"
          fontFamily={fontBody}
          fill={`${e}0.5)`}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
        >
          Analyzing 116 components across 31 unique parts...
        </motion.text>

        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={5 + i * 6}
            cy="41"
            r="0.4"
            fill={`${e}0.7)`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.6, 0],
              cx: [5 + i * 6, 48, 52, 60 + i * 3],
            }}
            transition={{ duration: 1.8, delay: 2.2 + i * 0.12, repeat: 2, repeatDelay: 4 }}
          />
        ))}

        <motion.text
          x="52"
          y="4.5"
          fontSize="2"
          fontFamily={fontHeading}
          fontWeight="700"
          letterSpacing="0.08em"
          fill={`${e}0.5)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.4 }}
        >
          OUTPUTS
        </motion.text>

        <motion.rect
          x="52"
          y="6.5"
          width="46"
          height="3"
          rx="0.5"
          fill={`${e}0.06)`}
          stroke={`${e}0.2)`}
          strokeWidth="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
        />
        <motion.text
          x="54"
          y="8.5"
          fontSize="1.4"
          fontFamily={fontHeading}
          fontWeight="600"
          fill={`${e}0.45)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.35 }}
        >
          Production Stations Layout
        </motion.text>

        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }}>
          <rect
            x="52"
            y="10.5"
            width="11"
            height="5"
            rx="0.5"
            fill={`${e}0.06)`}
            stroke={`${e}0.15)`}
            strokeWidth="0.2"
          />
          <text x="53" y="13" fontSize="2" fontFamily={fontHeading} fontWeight="700" fill={`${e}0.65)`}>
            30
          </text>
          <text x="53" y="14.8" fontSize="0.9" fontFamily={fontBody} fill={`${e}0.35)`}>
            Stations
          </text>

          <rect
            x="64"
            y="10.5"
            width="11"
            height="5"
            rx="0.5"
            fill={`${e}0.06)`}
            stroke={`${e}0.15)`}
            strokeWidth="0.2"
          />
          <text x="65" y="13" fontSize="2" fontFamily={fontHeading} fontWeight="700" fill={`${e}0.65)`}>
            62
          </text>
          <text x="65" y="14.8" fontSize="0.9" fontFamily={fontBody} fill={`${e}0.35)`}>
            Steps
          </text>

          <rect
            x="76"
            y="10.5"
            width="11"
            height="5"
            rx="0.5"
            fill={`${e}0.06)`}
            stroke={`${e}0.15)`}
            strokeWidth="0.2"
          />
          <text x="77" y="13" fontSize="2" fontFamily={fontHeading} fontWeight="700" fill={`${e}0.65)`}>
            34
          </text>
          <text x="77" y="14.8" fontSize="0.9" fontFamily={fontBody} fill={`${e}0.35)`}>
            Machines
          </text>

          <rect
            x="88"
            y="10.5"
            width="10"
            height="5"
            rx="0.5"
            fill="rgba(234,179,8,0.04)"
            stroke="rgba(234,179,8,0.2)"
            strokeWidth="0.2"
          />
          <text x="93" y="13.2" fontSize="2.2" fontFamily={fontHeading} fontWeight="700" fill="rgba(234,179,8,0.6)" textAnchor="middle">
            $1.96M
          </text>
        </motion.g>

        {stationItems.map((st) => (
          <motion.g
            key={`st-${st.num}`}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: st.delay }}
          >
            <rect
              x="52"
              y={16 + (st.num - 1) * 7}
              width="46"
              height="6"
              rx="0.8"
              fill={`${e}0.03)`}
              stroke={`${e}0.1)`}
              strokeWidth="0.2"
            />

            <circle
              cx="55"
              cy={19 + (st.num - 1) * 7}
              r="1.8"
              fill={st.num <= 3 ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.12)"}
              stroke={st.num <= 3 ? "rgba(59,130,246,0.4)" : `${e}0.3)`}
              strokeWidth="0.3"
            />
            <text
              x="55"
              y={19.7 + (st.num - 1) * 7}
              textAnchor="middle"
              fontSize="1.5"
              fontFamily={fontHeading}
              fontWeight="700"
              fill={st.num <= 3 ? "rgba(59,130,246,0.8)" : `${e}0.7)`}
            >
              {st.num}
            </text>

            <text
              x="59"
              y={18.8 + (st.num - 1) * 7}
              fontSize="1.4"
              fontFamily={fontHeading}
              fontWeight="600"
              fill={`${e}0.7)`}
            >
              {st.name}
            </text>

            <rect
              x="59"
              y={19.6 + (st.num - 1) * 7}
              width="8"
              height="1.8"
              rx="0.5"
              fill="rgba(16,185,129,0.1)"
              stroke={`${e}0.25)`}
              strokeWidth="0.2"
            />
            <text x="60" y={20.9 + (st.num - 1) * 7} fontSize="1" fontFamily={fontBody} fill={`${e}0.6)`}>
              {st.tag}
            </text>

            <text x="69" y={20.9 + (st.num - 1) * 7} fontSize="0.95" fontFamily="monospace" fill={`${e}0.5)`}>
              {st.steps} steps
            </text>
            <text x="77" y={20.9 + (st.num - 1) * 7} fontSize="0.95" fontFamily="monospace" fill={`${e}0.5)`}>
              {st.equip} equip
            </text>

            <motion.circle
              cx="96"
              cy={19 + (st.num - 1) * 7}
              r="0.6"
              fill="rgba(34,197,94,0.5)"
              stroke="rgba(34,197,94,0.3)"
              strokeWidth="0.2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: st.delay + 0.3, type: "spring" }}
            />
          </motion.g>
        ))}

        <motion.text
          x="52"
          y="53"
          fontSize="1.6"
          fontFamily={fontHeading}
          fontWeight="700"
          letterSpacing="0.06em"
          fill={`${e}0.45)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8 }}
        >
          LAYOUT
        </motion.text>

        <motion.rect
          x="53"
          y="54"
          width="43"
          height="21"
          rx="1"
          fill={`${e}0.03)`}
          stroke={`${e}0.2)`}
          strokeWidth="0.3"
          strokeDasharray="2 1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 3.9 }}
        />

        {layoutRooms.map((room, i) => (
          <g key={`room-${i}`}>
            <motion.rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              rx="0.5"
              fill={`${e}0.06)`}
              stroke={`${e}0.25)`}
              strokeWidth="0.3"
              strokeDasharray="1.5 0.8"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: room.delay }}
            />
            <motion.text
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 0.5}
              textAnchor="middle"
              fontSize={room.w > 15 ? "1.3" : "1"}
              fontFamily={fontHeading}
              fontWeight="600"
              fill={`${e}0.45)`}
              letterSpacing="0.04em"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: room.delay + 0.2 }}
            >
              {room.label}
            </motion.text>
          </g>
        ))}

        <motion.rect
          x={79}
          y={55.8}
          width={1.1}
          height={1.1}
          rx="0.2"
          fill={`${e}0.2)`}
          stroke={`${e}0.4)`}
          strokeWidth="0.2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 4.5, type: "spring" }}
        />

        {[
          { x1: 67.5, y1: 56.5, x2: 70, y2: 56.5 },
          { x1: 81, y1: 57, x2: 81, y2: 60.5 },
          { x1: 75, y1: 65.5, x2: 75, y2: 67 },
        ].map((fl, i) => (
          <motion.line
            key={`fl-${i}`}
            x1={fl.x1}
            y1={fl.y1}
            x2={fl.x2}
            y2={fl.y2}
            stroke={`${e}0.35)`}
            strokeWidth="0.4"
            markerEnd="url(#arrow-emerald)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 4.7 + i * 0.1 }}
          />
        ))}

        <motion.path
          d="M 48 40 C 50 40, 50 30, 52 25"
          fill="none"
          stroke={`${e}0.2)`}
          strokeWidth="0.4"
          strokeDasharray="1.5 1"
          markerEnd="url(#arrow-emerald)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 2.5 }}
        />
        <motion.path
          d="M 48 42 C 50 42, 51 48, 53 54"
          fill="none"
          stroke={`${e}0.2)`}
          strokeWidth="0.4"
          strokeDasharray="1.5 1"
          markerEnd="url(#arrow-emerald)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 3.6 }}
        />
      </svg>

      <motion.div
        className="absolute bottom-3 left-6 flex items-center gap-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm font-body"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 5, duration: 0.6 }}
      >
        <div className="text-center">
          <div className="text-xs font-bold text-emerald-400 tabular-nums font-orbitron">100m x 156m</div>
          <div className="text-[9px] text-emerald-400/60">Factory Size</div>
        </div>
        <div className="w-px h-6 bg-emerald-500/20" />
        <div className="text-center">
          <div className="text-xs font-bold text-emerald-400 tabular-nums font-orbitron">30</div>
          <div className="text-[9px] text-emerald-400/60">Stations</div>
        </div>
        <div className="w-px h-6 bg-emerald-500/20" />
        <div className="text-center">
          <div className="text-xs font-bold text-emerald-400 tabular-nums font-orbitron">46</div>
          <div className="text-[9px] text-emerald-400/60">Machines</div>
        </div>
      </motion.div>
    </div>
  );
}

export function AnvilVisual() {
  const equipmentRows = [
    {
      name: "Mitutoyo Vernier Caliper",
      type: "Measuring Device",
      mfr: "Mitutoyo",
      status: "Estimated",
      cost: "$120",
      delay: 0.4,
    },
    {
      name: "Mitutoyo 293 Micrometer",
      type: "Measuring Device",
      mfr: "Mitutoyo",
      status: "Estimated",
      cost: "$250",
      delay: 0.5,
    },
    {
      name: "TESA Go/No-Go Gauge",
      type: "Measuring Device",
      mfr: "TESA Tech",
      status: "Estimated",
      cost: "$1,200",
      delay: 0.6,
    },
    {
      name: "OCV DCIR Testers",
      type: "Test Equipment",
      mfr: "Hioki",
      status: "Verified",
      cost: "$15,537",
      delay: 0.7,
    },
    {
      name: "BT Lifter LHM230",
      type: "Supporting Tool",
      mfr: "Toyota Material Handling",
      status: "Estimated",
      cost: "$500",
      delay: 0.8,
    },
    {
      name: "Cell Cycler",
      type: "Test Equipment",
      mfr: "Maccor",
      status: "Verified",
      cost: "$175,451",
      delay: 0.9,
    },
    {
      name: "Compression Machines",
      type: "Machine",
      mfr: "Festo",
      status: "Verified",
      cost: "$15,000",
      delay: 1.0,
    },
  ];

  const summaryCards = [
    { count: "6", label: "Machines", total: "$255,091", color: "text-blue-400", delay: 0.15 },
    { count: "7", label: "Tools", total: "$4,960", color: "text-cyan-400", delay: 0.25 },
    { count: "0", label: "Fixtures", total: "$0", color: "text-teal-400", delay: 0.35 },
    { count: "4", label: "Test Equip", total: "$237,732", color: "text-sky-400", delay: 0.45 },
  ];

  const vendors = [
    {
      name: "Hubs",
      parent: "Protolabs",
      tags: ["Within 5kms", "Electronics"],
      services: "3D Printing, CNC Machining, PCB Assembly",
      stars: 4,
      delay: 1.2,
    },
    {
      name: "Caterpillar Inc",
      parent: "Protolabs",
      tags: ["Within 15kms", "Machinery"],
      services: "Construction, Mining Equipment, Power Systems",
      stars: 4.7,
      delay: 1.5,
    },
    {
      name: "RPG Group",
      parent: "KEC International",
      tags: ["Within 5kms", "Electronics"],
      services: "Renewable Energy, Smart Products",
      stars: 4.2,
      delay: 1.8,
    },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden p-3 md:p-5 font-body"
      data-testid="visual-anvil-svg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-blue-900/20" />

      <motion.div
        className="relative z-10 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="text-[11px] font-semibold text-blue-400 tracking-wider mb-1.5 font-orbitron">
          EQUIPMENT SUMMARY
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              className="bg-blue-500/[0.08] border border-blue-500/15 rounded-md px-2 py-1 flex items-center gap-1.5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: card.delay, type: "spring" }}
            >
              <span className={`text-xs font-bold ${card.color} tabular-nums font-orbitron`}>{card.count}</span>
              <div className="flex flex-col">
                <span className="text-[9px] text-blue-300/70 leading-tight">{card.label}</span>
                <span className="text-[8px] text-blue-400/50 font-mono tabular-nums">{card.total}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex gap-2 mt-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[9px] text-blue-400/60 bg-blue-500/[0.08] border border-blue-500/10 rounded px-1.5 py-0.5">
            18 Unique Manufacturers
          </span>
          <span className="text-[9px] text-blue-400/60 bg-blue-500/[0.08] border border-blue-500/10 rounded px-1.5 py-0.5">
            4 Others · $2,220
          </span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 flex-1 flex gap-2 overflow-hidden min-h-0">
        <div className="flex-[3] flex flex-col overflow-hidden">
          <motion.div
            className="flex items-center gap-1 mb-1 text-[8px] font-mono text-blue-400/60 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <span className="flex-[2.5]">Equipment Name</span>
            <span className="flex-1 hidden md:block">Type</span>
            <span className="flex-1 hidden md:block">Manufacturer</span>
            <span className="flex-[0.6] hidden md:block text-center">Status</span>
            <span className="flex-[0.8] text-right">Est. Cost</span>
          </motion.div>
          <div className="border-t border-blue-500/10" />

          {equipmentRows.map((row, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1 py-1 border-b border-blue-500/5"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: row.delay }}
            >
              <div className="flex-[2.5] flex items-center gap-1">
                <motion.div
                  className={`w-1.5 h-1.5 rounded-full ${row.status === "Verified" ? "bg-green-400/60" : "bg-amber-400/50"}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: row.delay + 0.2, type: "spring" }}
                />
                <span className="text-[9px] text-blue-300/90 truncate">{row.name}</span>
              </div>
              <div className="flex-1 hidden md:block">
                <span className="text-[8px] text-blue-400/55 font-mono">{row.type}</span>
              </div>
              <div className="flex-1 hidden md:block">
                <span className="text-[8px] text-blue-400/55">{row.mfr}</span>
              </div>
              <div className="flex-[0.6] hidden md:flex items-center justify-center">
                <span
                  className={`text-[6px] px-1 py-0.5 rounded ${row.status === "Verified" ? "bg-green-500/15 text-green-400/60" : "bg-amber-500/10 text-amber-400/50"}`}
                >
                  {row.status}
                </span>
              </div>
              <div className="flex-[0.8] text-right">
                <span className="text-[9px] text-blue-300/85 font-mono tabular-nums">{row.cost}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="flex-[2] hidden md:flex flex-col border-l border-blue-500/10 pl-2 overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-blue-400/90 tracking-wider font-orbitron">
              VENDOR MATCHING
            </span>
            <span className="text-[9px] text-blue-400/60 font-mono">25 Matches</span>
          </div>

          {vendors.map((vendor, i) => (
            <motion.div
              key={i}
              className="bg-blue-500/5 border border-blue-500/10 rounded-md p-1.5 mb-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: vendor.delay, duration: 0.4 }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-[6px] font-bold text-blue-400/60 font-orbitron">{vendor.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-blue-200/95 font-semibold truncate font-orbitron">{vendor.name}</div>
                  <div className="text-[7px] text-blue-400/55">{vendor.parent}</div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap mb-0.5">
                {vendor.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-[6px] px-1 py-0.5 rounded-full border border-blue-500/15 text-blue-400/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-[6px] text-blue-400/45 mb-0.5 truncate">{vendor.services}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <div
                      key={s}
                      className={`w-1 h-1 rounded-sm ${s < Math.floor(vendor.stars) ? "bg-amber-400/70" : "bg-blue-500/15"}`}
                    />
                  ))}
                  <span className="text-[6px] text-blue-400/50 ml-0.5">{vendor.stars}</span>
                </div>
                <motion.div
                  className="text-[5px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300/60 border border-blue-500/15 font-orbitron"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: vendor.delay + 0.3, type: "spring" }}
                >
                  Request a Quote
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 mt-1.5 bg-blue-500/5 border border-blue-500/10 rounded-md px-3 py-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400/70"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[9px] text-blue-300/80 font-mono font-orbitron">RFQ Pack Ready</span>
            </div>
            <span className="text-[8px] text-blue-400/55">
              <span className="font-bold text-blue-200 tabular-nums">17</span> equipment items · <span className="font-bold text-blue-200 tabular-nums">25</span> vendor matches
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] text-blue-400/55">Total Est.</span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold tabular-nums font-orbitron">
              $500,003
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function CenTorVisual() {
  const nodes = [
    { id: "start", label: "Start", x: 50, y: 6, type: "rect" as const, delay: 0.2, start: true },
    { id: "prep", label: "Cell Preparation", x: 50, y: 18, type: "rect" as const, delay: 0.5 },
    { id: "cycleA", label: "Cycling Station A", x: 25, y: 38, type: "rect" as const, delay: 0.9 },
    { id: "cycleB", label: "Cycling Station B", x: 75, y: 38, type: "rect" as const, delay: 0.9 },
    { id: "check", label: "Voltage Check", x: 50, y: 56, type: "rect" as const, delay: 1.3, highlight: true },
    { id: "assembly", label: "Module Assembly", x: 50, y: 72, type: "rect" as const, delay: 1.6 },
    { id: "bonding", label: "Wire Bonding", x: 50, y: 86, type: "rect" as const, delay: 1.9, highlight: true },
  ];

  const edges = [
    { from: { x: 50, y: 10 }, to: { x: 50, y: 14 }, delay: 0.4 },
    { from: { x: 50, y: 22 }, to: { x: 50, y: 28 }, delay: 0.7 },
    { from: { x: 42, y: 28 }, to: { x: 25, y: 34 }, delay: 0.8 },
    { from: { x: 58, y: 28 }, to: { x: 75, y: 34 }, delay: 0.8 },
    { from: { x: 25, y: 42 }, to: { x: 42, y: 52 }, delay: 1.1 },
    { from: { x: 75, y: 42 }, to: { x: 58, y: 52 }, delay: 1.1 },
    { from: { x: 50, y: 60 }, to: { x: 50, y: 68 }, delay: 1.5 },
    { from: { x: 50, y: 76 }, to: { x: 50, y: 82 }, delay: 1.8 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden font-body" data-testid="visual-centor-svg">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-violet-900/20" />

      <svg viewBox="0 0 100 95" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-violet">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrow-violet"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="3"
            markerHeight="3"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(139,92,246,0.6)" />
          </marker>
        </defs>

        {edges.map((edge, i) => (
          <motion.line
            key={`edge-${i}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="rgba(139,92,246,0.55)"
            strokeWidth="0.7"
            strokeDasharray="2 1.5"
            markerEnd="url(#arrow-violet)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: edge.delay }}
          />
        ))}

        <motion.path
          d="M 50 28 L 50 32 L 42 32"
          fill="none"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        />
        <motion.path
          d="M 50 28 L 50 32 L 58 32"
          fill="none"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        />

        {nodes.map((node) => (
          <g key={node.id}>
            {"start" in node && node.start ? (
              <motion.rect
                x={node.x - 10}
                y={node.y - 3.5}
                width="20"
                height="7"
                rx="1"
                fill="rgba(139,92,246,0.15)"
                stroke="rgba(16,185,129,0.6)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: node.delay, type: "spring" }}
              />
            ) : (
              <motion.rect
                x={node.x - 14}
                y={node.y - 4}
                width="28"
                height="8"
                rx="1.5"
                fill={node.highlight ? "rgba(234,179,8,0.12)" : "rgba(139,92,246,0.1)"}
                stroke={node.highlight ? "rgba(234,179,8,0.5)" : "rgba(139,92,246,0.4)"}
                strokeWidth="0.5"
                strokeDasharray={node.highlight ? "none" : "2 1"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: node.delay, type: "spring" }}
              />
            )}
            <motion.text
              x={node.x}
              y={node.y + (("start" in node && node.start) ? 0.6 : 0.8)}
              textAnchor="middle"
              fill={node.highlight ? "rgba(234,179,8,0.9)" : "rgba(139,92,246,0.88)"}
              fontSize="2.35"
              fontFamily={fontHeading}
              fontWeight="600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: node.delay + 0.15 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}
