"use client";

import { useRef, useState, useLayoutEffect } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import AdvancedFactoryAnimation from "@/components/AdvancedFactoryAnimation";
import { MaskedTextReveal } from "@/components/motion/MaskedTextReveal";
import { TextRevealAuto } from "@/components/motion/TextRevealAuto";
import { ProblemBulletList } from "@/components/sections/ProblemBulletList";
import { FlowDiagram } from "@/components/sections/IntroducingSection";
import { JOURNEY } from "@/lib/factory/scrollJourney";

const MUTED = "#475569";
const BODY = "#94a3b8";

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

  const problemTextOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, problemLockedRef, PROBLEM_ACTIVATE, PROBLEM_FADE_OUT_START, PROBLEM_END)
  );
  const solutionTextOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, solutionLockedRef, SOLUTION_ACTIVATE, SOLUTION_FADE_OUT_START, 1)
  );
  const problemVisualOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, problemLockedRef, PROBLEM_ACTIVATE, PROBLEM_FADE_OUT_START, PROBLEM_END)
  );
  const solutionVisualOpacity = useTransform(storyProgress, (p) =>
    panelOpacity(p, solutionLockedRef, SOLUTION_ACTIVATE, SOLUTION_FADE_OUT_START, 1)
  );
  const [showProblemContent, setShowProblemContent] = useState(true);
  const [showSolutionContent, setShowSolutionContent] = useState(false);

  const [problemHeadingActive, setProblemHeadingActive] = useState(false);
  const [solutionHeadingActive, setSolutionHeadingActive] = useState(false);
  const [problemSubtextActive, setProblemSubtextActive] = useState(false);
  const [solutionSubtextActive, setSolutionSubtextActive] = useState(false);
  const [problemVisualActive, setProblemVisualActive] = useState(false);
  const [problemCycle, setProblemCycle] = useState(0);
  const [solutionCycle, setSolutionCycle] = useState(0);

  const problemEverActiveRef = useRef(false);
  const solutionEverActiveRef = useRef(false);

  useMotionValueEvent(storyProgress, "change", (p) => {
    const absoluteProgress = scrollProgress.get();

    if (p < HERO_RESET_THRESHOLD) {
      if (problemEverActiveRef.current || solutionEverActiveRef.current) {
        problemEverActiveRef.current = false;
        solutionEverActiveRef.current = false;
        setProblemHeadingActive(false);
        setSolutionHeadingActive(false);
        setProblemSubtextActive(false);
        setSolutionSubtextActive(false);
      }
      setShowProblemContent(true);
      setShowSolutionContent(false);
      return;
    }

    const shouldActivateProblem = p >= PROBLEM_ACTIVATE && p < PROBLEM_END;
    if (shouldActivateProblem && !problemEverActiveRef.current) {
      problemEverActiveRef.current = true;
      setProblemCycle((c) => c + 1);
      setProblemHeadingActive(true);
      setProblemSubtextActive(true);
    }

    const shouldActivateSolution = p >= SOLUTION_ACTIVATE;
    if (shouldActivateSolution && !solutionEverActiveRef.current) {
      solutionEverActiveRef.current = true;
      setSolutionCycle((c) => c + 1);
      setSolutionHeadingActive(true);
      setSolutionSubtextActive(true);
    }

    const nextProblemVisual =
      absoluteProgress >= JOURNEY.factory.fadeOut[1] && p >= 0.06 && p < SOLUTION_ACTIVATE;
    setProblemVisualActive((prev) => (prev === nextProblemVisual ? prev : nextProblemVisual));

    setShowProblemContent(p < PROBLEM_END);
    setShowSolutionContent(p >= SOLUTION_ACTIVATE);
  });

  const panelHidden = (visible: boolean) => (visible ? "" : " hidden");

  useLayoutEffect(() => {
    const p = storyProgress.get();
    setShowProblemContent(p < PROBLEM_END);
    setShowSolutionContent(p >= SOLUTION_ACTIVATE);
  }, [storyProgress]);

  const headingTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as number[] };

  return (
    <section
      id="story"
      className="factory-scroll-panel factory-stitched-story relative h-full overflow-hidden"
      aria-label="Problem and solution"
    >
      <div className="factory-stitched-story__grid relative z-10 mx-auto flex h-full max-h-full flex-col gap-3 px-5 py-[calc(var(--site-header-total)+0.5rem)] max-lg:justify-start lg:flex-row lg:items-center lg:gap-10 lg:px-10 lg:py-[calc(var(--site-header-total)+1rem)]">
        <div className="factory-stitched-story__text relative w-full shrink-0 lg:min-h-[18rem] lg:flex-[0_0_40%]">
          <motion.div
            className={`factory-stitched-story__text-panel factory-stitched-story__text-panel--problem flex flex-col space-y-4 lg:space-y-5${panelHidden(showProblemContent)}`}
            style={{ opacity: problemTextOpacity }}
          >
            <span className="shiny-badge w-fit shrink-0 self-start px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              Problem
            </span>

            <div
              className="w-full shrink-0 space-y-0 font-fragment text-heading leading-snug"
              key={`problem-heading-${problemCycle}`}
            >
              <MaskedTextReveal
                as="span"
                text="Factory planning"
                className="block text-white"
                active={problemHeadingActive}
                fromY={40}
                transition={{ ...headingTransition, delay: 0.02 }}
              />
              <span className="flex flex-wrap items-baseline gap-x-[0.28em]">
                <MaskedTextReveal
                  as="span"
                  text="is"
                  className="text-white"
                  active={problemHeadingActive}
                  fromY={40}
                  transition={{ ...headingTransition, delay: 0.08 }}
                />
                <MaskedTextReveal
                  as="span"
                  text="still slow,"
                  className="text-primary"
                  active={problemHeadingActive}
                  fromY={40}
                  transition={{ ...headingTransition, delay: 0.12 }}
                />
              </span>
              <MaskedTextReveal
                as="span"
                text="manual,"
                className="block text-primary"
                active={problemHeadingActive}
                fromY={40}
                transition={{ ...headingTransition, delay: 0.16 }}
              />
              <MaskedTextReveal
                as="span"
                text="and dated."
                className="block text-primary"
                active={problemHeadingActive}
                fromY={40}
                transition={{ ...headingTransition, delay: 0.2 }}
              />
            </div>

            <ProblemBulletList
              reveal={{
                active: problemSubtextActive,
                cycle: problemCycle,
                mutedColor: MUTED,
                primaryColor: BODY,
              }}
            />
          </motion.div>

          <motion.div
            className={`factory-stitched-story__text-panel factory-stitched-story__text-panel--solution flex flex-col space-y-4 lg:space-y-5${panelHidden(showSolutionContent)}`}
            style={{ opacity: solutionTextOpacity }}
          >
            <span className="shiny-badge w-fit self-start px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              Solution
            </span>

            <div
              className="space-y-0 font-fragment text-heading leading-snug"
              key={`solution-heading-${solutionCycle}`}
            >
              <MaskedTextReveal
                as="span"
                text="Intelligence for"
                className="block text-white"
                active={solutionHeadingActive}
                fromY={40}
                transition={{ ...headingTransition, delay: 0.02 }}
              />
              <MaskedTextReveal
                as="span"
                text="Factories"
                className="block text-primary"
                active={solutionHeadingActive}
                fromY={40}
                transition={{ ...headingTransition, delay: 0.1 }}
              />
            </div>

            <TextRevealAuto
              key={`solution-subtext-${solutionCycle}`}
              text="One platform. Complete automation. From inputs to a full production line model."
              className="factory-stitched-story__subtext max-w-md font-body text-sm leading-relaxed md:text-base"
              mutedColor={MUTED}
              primaryColor={BODY}
              active={solutionSubtextActive}
            />
          </motion.div>
        </div>

        <div className="factory-stitched-story__visual relative flex w-full min-h-0 flex-1 items-center justify-center overflow-hidden lg:flex-[0_0_60%] lg:self-stretch">
          {showProblemContent ? (
            <motion.div
              className="factory-stitched-story__visual-panel factory-stitched-story__visual-panel--problem flex w-full justify-center overflow-hidden"
              style={{ opacity: problemVisualOpacity }}
            >
              <div className="flex w-full max-w-full justify-center overflow-hidden">
                <AdvancedFactoryAnimation active={problemVisualActive} />
              </div>
            </motion.div>
          ) : null}

          {showSolutionContent ? (
            <motion.div
              className="factory-stitched-story__visual-panel factory-stitched-story__visual-panel--solution flex w-full items-center justify-center overflow-hidden"
              style={{ opacity: solutionVisualOpacity }}
            >
              <div className="w-full min-w-0 max-w-full overflow-hidden max-lg:mx-auto">
                <FlowDiagram />
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
