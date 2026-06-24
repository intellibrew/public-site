"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { NarrativeReveal } from "@/components/narrative/NarrativeReveal";
import { ProblemRingDiagram } from "@/components/narrative/ProblemRingDiagram";
import { SolutionCoreDiagram } from "@/components/narrative/SolutionCoreDiagram";
import { JOURNEY } from "@/lib/factory/scrollJourney";

const HERO_RESET_THRESHOLD = 0.015;
const PROBLEM_ACTIVATE = 0.04;
const PROBLEM_END = 0.52;
const PROBLEM_FADE_OUT_START = 0.45;
const SOLUTION_ACTIVATE = 0.56;
const SOLUTION_FADE_OUT_START = 0.92;

type StitchedStorySectionProps = {
  scrollProgress: MotionValue<number>;
};

function panelOpacity(
  p: number,
  lockedRef: React.MutableRefObject<boolean>,
  activateAt: number,
  fadeOutStart: number,
  fadeOutEnd: number
) {
  if (p < HERO_RESET_THRESHOLD) {
    lockedRef.current = false;
  }
  if (p >= activateAt) {
    lockedRef.current = true;
  }

  if (p >= fadeOutEnd) return 0;
  if (p >= fadeOutStart) {
    return 1 - (p - fadeOutStart) / (fadeOutEnd - fadeOutStart);
  }
  if (lockedRef.current) return 1;
  if (p <= 0) return 0;
  return Math.min(1, p / 0.035);
}

export function StitchedStorySection({ scrollProgress }: StitchedStorySectionProps) {
  const storyStart = JOURNEY.problem.fadeIn[0];
  const storyEnd = JOURNEY.solution.fadeOut[1];

  const storyProgress = useTransform(scrollProgress, [storyStart, storyEnd], [0, 1]);

  const problemLockedRef = useRef(false);
  const solutionLockedRef = useRef(false);

  const problemOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, problemLockedRef, PROBLEM_ACTIVATE, PROBLEM_FADE_OUT_START, PROBLEM_END)
  );
  const solutionOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, solutionLockedRef, SOLUTION_ACTIVATE, SOLUTION_FADE_OUT_START, 1)
  );

  const [showProblemContent, setShowProblemContent] = useState(true);
  const [showSolutionContent, setShowSolutionContent] = useState(false);
  const [problemRevealActive, setProblemRevealActive] = useState(false);
  const [solutionRevealActive, setSolutionRevealActive] = useState(false);
  const [problemCycle, setProblemCycle] = useState(0);
  const [solutionCycle, setSolutionCycle] = useState(0);

  const problemEverActiveRef = useRef(false);
  const solutionEverActiveRef = useRef(false);

  useMotionValueEvent(storyProgress, "change", (p) => {
    if (p < HERO_RESET_THRESHOLD) {
      if (problemEverActiveRef.current || solutionEverActiveRef.current) {
        problemEverActiveRef.current = false;
        solutionEverActiveRef.current = false;
        setProblemRevealActive(false);
        setSolutionRevealActive(false);
      }
      setShowProblemContent(true);
      setShowSolutionContent(false);
      return;
    }

    const shouldActivateProblem = p >= PROBLEM_ACTIVATE && p < PROBLEM_END;
    if (shouldActivateProblem && !problemEverActiveRef.current) {
      problemEverActiveRef.current = true;
      setProblemCycle((c) => c + 1);
      setProblemRevealActive(true);
    }

    const shouldActivateSolution = p >= SOLUTION_ACTIVATE;
    if (shouldActivateSolution && !solutionEverActiveRef.current) {
      solutionEverActiveRef.current = true;
      setSolutionCycle((c) => c + 1);
      setSolutionRevealActive(true);
    }

    setShowProblemContent(p < PROBLEM_END);
    setShowSolutionContent(p >= SOLUTION_ACTIVATE);
  });

  const panelHidden = (visible: boolean) => (visible ? "" : " hidden");

  useLayoutEffect(() => {
    const p = storyProgress.get();
    setShowProblemContent(p < PROBLEM_END);
    setShowSolutionContent(p >= SOLUTION_ACTIVATE);
  }, [storyProgress]);

  return (
    <section
      id="story"
      className="factory-scroll-panel factory-stitched-story factory-narrative relative h-full overflow-hidden"
      aria-label="Problem and solution"
    >
      <div className="relative z-10 mx-auto flex h-full max-h-full w-full items-center justify-center">
        {showProblemContent ? (
          <motion.div
            key={`problem-${problemCycle}`}
            className={`factory-narrative-slide${problemRevealActive ? " factory-narrative-slide--in" : ""} absolute inset-0${panelHidden(showProblemContent)}`}
            style={{ opacity: problemOpacity }}
          >
            <NarrativeReveal delay={0}>
              <div className="factory-narrative-eyebrow">Problem</div>
            </NarrativeReveal>

            <NarrativeReveal delay={1}>
              <h2 className="factory-narrative-headline">
                Factory planning is still{" "}
                <span className="factory-narrative-accent">slow, manual, and dated.</span>
              </h2>
            </NarrativeReveal>

            <NarrativeReveal delay={2}>
              <ProblemRingDiagram />
            </NarrativeReveal>

            <NarrativeReveal delay={3}>
              <p className="factory-narrative-footnote">
                No single source of truth · every figure re-keyed by hand
              </p>
            </NarrativeReveal>
          </motion.div>
        ) : null}

        {showSolutionContent ? (
          <motion.div
            key={`solution-${solutionCycle}`}
            className={`factory-narrative-slide${solutionRevealActive ? " factory-narrative-slide--in" : ""} absolute inset-0${panelHidden(showSolutionContent)}`}
            style={{ opacity: solutionOpacity }}
          >
            <NarrativeReveal delay={0}>
              <div className="factory-narrative-eyebrow">Solution</div>
            </NarrativeReveal>

            <NarrativeReveal delay={1}>
              <h2 className="factory-narrative-headline">
                Intelligence for <span className="factory-narrative-accent">factories.</span>
              </h2>
            </NarrativeReveal>

            <NarrativeReveal delay={2}>
              <p className="factory-narrative-subhead">
                One platform. Complete automation. From inputs to a full production line model.
              </p>
            </NarrativeReveal>

            <NarrativeReveal delay={3}>
              <SolutionCoreDiagram />
            </NarrativeReveal>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
