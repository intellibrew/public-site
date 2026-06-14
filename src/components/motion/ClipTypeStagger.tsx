"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const CLIP_PADDING = "0.25em";

const CLIP_STYLE: React.CSSProperties = {
  clipPath: "inset(0% 0% 0% 0%)",
  WebkitClipPath: "inset(0% 0% 0% 0%)",
  paddingTop: CLIP_PADDING,
  paddingBottom: CLIP_PADDING,
  marginTop: `calc(${CLIP_PADDING} * -1)`,
  marginBottom: `calc(${CLIP_PADDING} * -1)`,
};

type StaggerPreset = "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "fade" | "scale";
type SplitBy = "line" | "word" | "character";

type ClipTypeStaggerProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  splitBy?: SplitBy;
  preset?: StaggerPreset;
  active?: boolean;
  stagger?: number;
  delay?: number;
  align?: "left" | "center" | "right";
  /** Optional class per line when splitBy is "line" */
  lineClassNames?: string[];
  /** Change to remount and replay the entrance animation */
  replayKey?: number | string;
  transition?: {
    type?: "spring" | "tween";
    stiffness?: number;
    damping?: number;
    duration?: number;
    ease?: number[];
  };
};

function hiddenState(preset: StaggerPreset) {
  switch (preset) {
    case "slideDown":
      return { y: `calc(-100% - ${CLIP_PADDING})`, opacity: 1, scale: 1, x: 0 };
    case "slideLeft":
      return { x: `calc(-100% - ${CLIP_PADDING})`, opacity: 1, scale: 1, y: 0 };
    case "slideRight":
      return { x: `calc(100% + ${CLIP_PADDING})`, opacity: 1, scale: 1, y: 0 };
    case "fade":
      return { opacity: 0, y: 0, x: 0, scale: 1 };
    case "scale":
      return { opacity: 0, scale: 0, y: 0, x: 0 };
    case "slideUp":
    default:
      return { y: `calc(100% + ${CLIP_PADDING})`, opacity: 1, scale: 1, x: 0 };
  }
}

function splitText(text: string, splitBy: SplitBy): string[] {
  if (splitBy === "line") {
    return text.split("\n").filter((line) => line.trim() !== "");
  }
  if (splitBy === "character") {
    return text.split("");
  }
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

export function ClipTypeStagger({
  text,
  as: Tag = "span",
  className = "",
  splitBy = "line",
  preset = "slideUp",
  active = false,
  stagger = 0.1,
  delay = 0,
  align = "center",
  lineClassNames,
  replayKey = 0,
  transition = { type: "spring", stiffness: 200, damping: 20 },
}: ClipTypeStaggerProps) {
  const parts = useMemo(() => splitText(text, splitBy), [text, splitBy]);

  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  const variants = useMemo(() => {
    const hidden = hiddenState(preset);
    return {
      hidden,
      visible: (i: number) => ({
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          ...transition,
          delay: delay + i * stagger,
        },
      }),
    };
  }, [preset, transition, delay, stagger]);

  let tokenIndex = 0;

  const renderWordOrChar = (part: string, index: number) => {
    const isSpace = splitBy === "word" && /^\s+$/.test(part);
    if (isSpace) {
      return (
        <span key={`space-${index}-${replayKey}`} style={{ whiteSpace: "pre" }}>
          {part}
        </span>
      );
    }

    const i = tokenIndex;
    tokenIndex += 1;

    if (splitBy === "line") {
      return (
        <span
          key={`line-${index}-${replayKey}`}
          className={lineClassNames?.[i]}
          style={{
            ...CLIP_STYLE,
            position: "relative",
            width: "100%",
            display: "block",
            overflow: "hidden",
          }}
        >
          <motion.span
            custom={i}
            variants={variants}
            initial="hidden"
            animate={active ? "visible" : "hidden"}
            style={{ display: "block", width: "100%", transformStyle: "preserve-3d" }}
          >
            {part}
          </motion.span>
        </span>
      );
    }

    if (splitBy === "character") {
      return (
        <span
          key={`char-${index}-${replayKey}`}
          style={{ ...CLIP_STYLE, display: "inline-block", verticalAlign: "top", position: "relative" }}
        >
          <motion.span
            custom={i}
            variants={variants}
            initial="hidden"
            animate={active ? "visible" : "hidden"}
            style={{ display: "inline-block", transformStyle: "preserve-3d" }}
          >
            {part}
          </motion.span>
        </span>
      );
    }

    return (
      <span
        key={`word-${index}-${replayKey}`}
        style={{
          ...CLIP_STYLE,
          display: "inline-block",
          verticalAlign: "top",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.span
          custom={i}
          variants={variants}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          style={{ display: "inline-block", transformStyle: "preserve-3d" }}
        >
          {part}
        </motion.span>
      </span>
    );
  };

  return (
    <Tag
      className={className}
      aria-label={text.replace(/\n/g, " ")}
      style={{
        margin: 0,
        display: "flex",
        flexDirection: splitBy === "line" ? "column" : "row",
        flexWrap: splitBy === "word" ? "wrap" : undefined,
        alignItems: splitBy === "line" && align === "center" ? "center" : undefined,
        justifyContent,
        width: "100%",
        gap: 0,
      }}
    >
      <span aria-hidden="true" style={{ display: "contents" }}>
        {parts.map((part, index) => renderWordOrChar(part, index))}
      </span>
    </Tag>
  );
}
