"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

type TextRevealAutoProps = {
  text: string;
  className?: string;
  mutedColor?: string;
  primaryColor?: string;
  mode?: "character" | "word" | "sentence";
  active?: boolean;
  delay?: number;
  stagger?: number;
  duration?: number;
  balance?: boolean;
};

function splitTextItems(text: string, mode: "character" | "word" | "sentence") {
  if (!text) return [] as string[];

  if (mode === "character") return text.split("");
  if (mode === "word") return text.match(/([\S]+|\s+)/g) ?? [];
  return text.match(/[^.!?\n]+(?:[.!?]+)?|\n|\s+/g) ?? [];
}

export function TextRevealAuto({
  text,
  className = "",
  mutedColor = "#64748b",
  primaryColor = "#94a3b8",
  mode = "word",
  active = false,
  delay = 0,
  stagger = 0.025,
  duration = 0.22,
  balance = true,
}: TextRevealAutoProps) {
  const items = useMemo(() => splitTextItems(text, mode), [text, mode]);

  let tokenIndex = 0;

  return (
    <div
      className={className}
      role="region"
      aria-label={text}
      style={{
        textWrap: balance ? "balance" : "wrap",
        whiteSpace: "pre-wrap",
        display: "block",
        color: mutedColor,
      }}
    >
      <span aria-hidden="true">
        {items.map((itemStr, idx) => {
          if (itemStr.trim().length === 0 && itemStr !== "\n") {
            return <React.Fragment key={`space-${idx}`}>{itemStr}</React.Fragment>;
          }
          if (itemStr === "\n") {
            return <br key={`br-${idx}`} />;
          }

          const index = tokenIndex;
          tokenIndex += 1;

          return (
            <motion.span
              key={`token-${idx}`}
              initial={{ color: mutedColor }}
              animate={{ color: active ? primaryColor : mutedColor }}
              transition={{
                duration,
                delay: delay + index * stagger,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {itemStr}
            </motion.span>
          );
        })}
      </span>
    </div>
  );
}
