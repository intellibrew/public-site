"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

type MaskedTextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  textColor?: string;
  align?: "left" | "center" | "right";
  fromY?: number;
  rotateFrom?: number;
  blur?: number;
  stagger?: number;
  once?: boolean;
  /** When set, overrides scroll-into-view detection */
  active?: boolean;
  viewportAmount?: number;
  wordMaskPadding?: number;
  transition?: {
    type?: string;
    duration?: number;
    delay?: number;
    ease?: number[] | string;
  };
};

export function MaskedTextReveal({
  text,
  as: Tag = "h2",
  className = "",
  textColor,
  align = "left",
  fromY = 48,
  rotateFrom = 0,
  blur = 0,
  stagger = 0.05,
  once = true,
  active,
  viewportAmount = 0.4,
  wordMaskPadding = 4,
  transition = { type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.55, delay: 0.04 },
}: MaskedTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { amount: viewportAmount, once });
  const revealLatchedRef = useRef(false);

  if (active) {
    revealLatchedRef.current = true;
  } else if (active === false && !once) {
    revealLatchedRef.current = false;
  }

  const showFinal = active !== undefined ? revealLatchedRef.current : inView;

  const words = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    return trimmed.split(/\s+/g);
  }, [text]);

  const wordVariants = useMemo(() => {
    const makeTransition = (i: number) => {
      const animDelay = typeof transition.delay === "number" ? transition.delay : 0;
      return { ...transition, delay: animDelay + i * stagger };
    };

    return {
      hidden: {
        y: fromY,
        rotate: rotateFrom,
        filter: blur > 0 ? `blur(${blur}px)` : "blur(0px)",
        opacity: 1,
      },
      visible: (i: number) => ({
        y: 0,
        rotate: 0,
        filter: "blur(0px)",
        opacity: 1,
        transition: makeTransition(i),
      }),
    };
  }, [fromY, rotateFrom, blur, stagger, transition]);

  const justifyContent =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <Tag
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      aria-label={text}
      className={className}
      style={{
        margin: 0,
        padding: 0,
        display: "flex",
        flexWrap: "wrap",
        columnGap: "0.28em",
        justifyContent,
        color: textColor,
        transform: "translateZ(0)",
      }}
    >
      {words.length === 0 ? (
        <span style={{ minWidth: "max-content" }}>{text}</span>
      ) : (
        words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            aria-hidden="true"
            style={{
              display: "inline-flex",
              overflow: "hidden",
              paddingTop: wordMaskPadding,
              paddingBottom: wordMaskPadding,
              marginTop: -wordMaskPadding,
              marginBottom: -wordMaskPadding,
            }}
          >
            <motion.span
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate={showFinal ? "visible" : "hidden"}
              style={{
                display: "inline-block",
                transformOrigin: "50% 100%",
                willChange: showFinal ? "transform" : "auto",
                backfaceVisibility: "hidden",
              }}
            >
              {word}
            </motion.span>
          </span>
        ))
      )}
    </Tag>
  );
}
