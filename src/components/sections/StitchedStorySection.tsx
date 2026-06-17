"use client";

import { useEffect, useRef, useState } from "react";
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
const SOLUTION_ACTIVATE = 0.56;
const SUBTEXT_DELAY_MS = 320;

type StitchedStorySectionProps = {
  scrollProgress: MotionValue<number>;
};

export function StitchedStorySection({ scrollProgress }: StitchedStorySectionProps) {
  const storyStart = JOURNEY.problem.fadeIn[0];
  const storyEnd = JOURNEY.solution.fadeOut[1];

  const storyProgress = useTransform(scrollProgress, [storyStart, storyEnd], [0, 1]);

  const problemTextOpacity = useTransform(storyProgress, [0, 0.06, 0.45, PROBLEM_END], [0, 1, 1, 0]);
  const solutionTextOpacity = useTransform(storyProgress, [PROBLEM_END, 0.64, 0.92, 1], [0, 1, 1, 0]);

  const problemVisualOpacity = useTransform(storyProgress, [0, 0.06, 0.45, PROBLEM_END], [0, 1, 1, 0]);
  const solutionVisualOpacity = useTransform(storyProgress, [PROBLEM_END, 0.64, 0.92, 1], [0, 1, 1, 0]);

  const problemTextVisibility = useTransform(problemTextOpacity, (v) => (v > 0.02 ? "visible" : "hidden"));
  const solutionTextVisibility = useTransform(solutionTextOpacity, (v) => (v > 0.02 ? "visible" : "hidden"));
  const problemVisualVisibility = useTransform(problemVisualOpacity, (v) => (v > 0.02 ? "visible" : "hidden"));
  const solutionVisualVisibility = useTransform(solutionVisualOpacity, (v) => (v > 0.02 ? "visible" : "hidden"));

  const [problemHeadingActive, setProblemHeadingActive] = useState(false);
  const [solutionHeadingActive, setSolutionHeadingActive] = useState(false);
  const [problemSubtextActive, setProblemSubtextActive] = useState(false);
  const [solutionSubtextActive, setSolutionSubtextActive] = useState(false);
  const [problemVisualActive, setProblemVisualActive] = useState(false);
  const [problemCycle, setProblemCycle] = useState(0);
  const [solutionCycle, setSolutionCycle] = useState(0);
  const [mobileLayoutPhase, setMobileLayoutPhase] = useState<"problem" | "solution">("problem");

  const problemEverActiveRef = useRef(false);
  const solutionEverActiveRef = useRef(false);
  const problemSubtextDoneRef = useRef(false);
  const solutionSubtextDoneRef = useRef(false);
  const problemHeadingActiveRef = useRef(false);
  const solutionHeadingActiveRef = useRef(false);
  const problemSubtextActiveRef = useRef(false);
  const solutionSubtextActiveRef = useRef(false);
  const problemVisualActiveRef = useRef(false);
  const mobileLayoutPhaseRef = useRef<"problem" | "solution">("problem");
  const problemSubtextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solutionSubtextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (problemSubtextTimerRef.current) clearTimeout(problemSubtextTimerRef.current);
      if (solutionSubtextTimerRef.current) clearTimeout(solutionSubtextTimerRef.current);
    };
  }, []);

  useMotionValueEvent(storyProgress, "change", (p) => {
    const absoluteProgress = scrollProgress.get();
    const nextLayoutPhase = p < PROBLEM_END ? "problem" : "solution";
    if (nextLayoutPhase !== mobileLayoutPhaseRef.current) {
      mobileLayoutPhaseRef.current = nextLayoutPhase;
      setMobileLayoutPhase(nextLayoutPhase);
    }

    const nextProblemVisual =
      absoluteProgress >= JOURNEY.factory.fadeOut[1] && p >= 0.06 && p < SOLUTION_ACTIVATE;
    if (nextProblemVisual !== problemVisualActiveRef.current) {
      problemVisualActiveRef.current = nextProblemVisual;
      setProblemVisualActive(nextProblemVisual);
    }

    if (p >= 0 && p < HERO_RESET_THRESHOLD) {
      if (problemEverActiveRef.current || solutionEverActiveRef.current) {
        problemEverActiveRef.current = false;
        solutionEverActiveRef.current = false;
        problemSubtextDoneRef.current = false;
        solutionSubtextDoneRef.current = false;
        problemHeadingActiveRef.current = false;
        solutionHeadingActiveRef.current = false;
        problemSubtextActiveRef.current = false;
        solutionSubtextActiveRef.current = false;
        setProblemHeadingActive(false);
        setSolutionHeadingActive(false);
        setProblemSubtextActive(false);
        setSolutionSubtextActive(false);
      }
      return;
    }

    const shouldActivateProblem = p >= PROBLEM_ACTIVATE && p < PROBLEM_END;
    const shouldActivateSolution = p >= SOLUTION_ACTIVATE;

    if (shouldActivateProblem && !problemEverActiveRef.current) {
      problemEverActiveRef.current = true;
      setProblemCycle((c) => c + 1);
      if (!problemHeadingActiveRef.current) {
        problemHeadingActiveRef.current = true;
        setProblemHeadingActive(true);
      }
      if (!problemSubtextDoneRef.current) {
        if (problemSubtextTimerRef.current) clearTimeout(problemSubtextTimerRef.current);
        problemSubtextTimerRef.current = setTimeout(() => {
          problemSubtextDoneRef.current = true;
          problemSubtextActiveRef.current = true;
          setProblemSubtextActive(true);
          problemSubtextTimerRef.current = null;
        }, SUBTEXT_DELAY_MS);
      } else if (!problemSubtextActiveRef.current) {
        problemSubtextActiveRef.current = true;
        setProblemSubtextActive(true);
      }
    } else if (problemEverActiveRef.current) {
      if (!problemHeadingActiveRef.current) {
        problemHeadingActiveRef.current = true;
        setProblemHeadingActive(true);
      }
      if (problemSubtextDoneRef.current && !problemSubtextActiveRef.current) {
        problemSubtextActiveRef.current = true;
        setProblemSubtextActive(true);
      }
    }

    if (shouldActivateSolution && !solutionEverActiveRef.current) {
      solutionEverActiveRef.current = true;
      setSolutionCycle((c) => c + 1);
      if (!solutionHeadingActiveRef.current) {
        solutionHeadingActiveRef.current = true;
        setSolutionHeadingActive(true);
      }
      if (!solutionSubtextDoneRef.current) {
        if (solutionSubtextTimerRef.current) clearTimeout(solutionSubtextTimerRef.current);
        solutionSubtextTimerRef.current = setTimeout(() => {
          solutionSubtextDoneRef.current = true;
          solutionSubtextActiveRef.current = true;
          setSolutionSubtextActive(true);
          solutionSubtextTimerRef.current = null;
        }, SUBTEXT_DELAY_MS);
      } else if (!solutionSubtextActiveRef.current) {
        solutionSubtextActiveRef.current = true;
        setSolutionSubtextActive(true);
      }
    } else if (solutionEverActiveRef.current) {
      if (!solutionHeadingActiveRef.current) {
        solutionHeadingActiveRef.current = true;
        setSolutionHeadingActive(true);
      }
      if (solutionSubtextDoneRef.current && !solutionSubtextActiveRef.current) {
        solutionSubtextActiveRef.current = true;
        setSolutionSubtextActive(true);
      }
    }
  });

  return (
    <section
      id="story"
      className="factory-scroll-panel factory-stitched-story relative h-full overflow-hidden"
      aria-label="Problem and solution"
    >
      <div className="factory-stitched-story__grid relative z-10 mx-auto flex h-full max-h-full flex-col gap-3 px-5 py-[calc(var(--site-header-total)+0.5rem)] max-lg:justify-between lg:flex-row lg:items-center lg:gap-10 lg:px-10 lg:py-[calc(var(--site-header-total)+1rem)]">
        <div className="factory-stitched-story__text relative min-h-0 w-full shrink-0 lg:min-h-[18rem] lg:flex-[0_0_40%]">
          <motion.div
            className={`factory-stitched-story__text-panel factory-stitched-story__text-panel--problem flex flex-col space-y-4 lg:absolute lg:inset-0 lg:justify-center lg:space-y-5 ${mobileLayoutPhase === "solution" ? "max-lg:hidden" : ""}`}
            style={{ opacity: problemTextOpacity, visibility: problemTextVisibility }}
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
                  fromY={120}
                  rotateFrom={3}
                  stagger={0.07}
                  transition={{ duration: 0.85, delay: 0.05, ease: [0, 0.75, 0.25, 0.98] }}
                />
                <span className="flex flex-wrap items-baseline gap-x-[0.28em]">
                  <MaskedTextReveal
                    as="span"
                    text="is"
                    className="text-white"
                    active={problemHeadingActive}
                    fromY={120}
                    rotateFrom={3}
                    stagger={0.07}
                    transition={{ duration: 0.85, delay: 0.18, ease: [0, 0.75, 0.25, 0.98] }}
                  />
                  <MaskedTextReveal
                    as="span"
                    text="still slow,"
                    className="text-primary"
                    active={problemHeadingActive}
                    fromY={120}
                    rotateFrom={3}
                    stagger={0.07}
                    transition={{ duration: 0.85, delay: 0.24, ease: [0, 0.75, 0.25, 0.98] }}
                  />
                </span>
                <MaskedTextReveal
                  as="span"
                  text="manual,"
                  className="block text-primary"
                  active={problemHeadingActive}
                  fromY={120}
                  rotateFrom={3}
                  stagger={0.07}
                  transition={{ duration: 0.85, delay: 0.3, ease: [0, 0.75, 0.25, 0.98] }}
                />
                <MaskedTextReveal
                  as="span"
                  text="and dated."
                  className="block text-primary"
                  active={problemHeadingActive}
                  fromY={120}
                  rotateFrom={3}
                  stagger={0.07}
                  transition={{ duration: 0.85, delay: 0.38, ease: [0, 0.75, 0.25, 0.98] }}
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
            className={`factory-stitched-story__text-panel factory-stitched-story__text-panel--solution flex flex-col space-y-4 lg:absolute lg:inset-0 lg:justify-center lg:space-y-5 ${mobileLayoutPhase === "problem" ? "max-lg:hidden" : ""}`}
            style={{ opacity: solutionTextOpacity, visibility: solutionTextVisibility }}
          >
            <span className="shiny-badge w-fit self-start px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
              Solution
            </span>

            <div className="space-y-0 font-fragment text-heading leading-snug" key={`solution-heading-${solutionCycle}`}>
              <MaskedTextReveal
                as="span"
                text="Intelligence for"
                className="block text-white"
                active={solutionHeadingActive}
                fromY={120}
                rotateFrom={3}
                stagger={0.07}
                transition={{ duration: 0.85, delay: 0.05, ease: [0, 0.75, 0.25, 0.98] }}
              />
              <MaskedTextReveal
                as="span"
                text="Factories"
                className="block text-primary"
                active={solutionHeadingActive}
                fromY={120}
                rotateFrom={3}
                stagger={0.07}
                transition={{ duration: 0.85, delay: 0.18, ease: [0, 0.75, 0.25, 0.98] }}
              />
            </div>

            <TextRevealAuto
              key={`solution-subtext-${solutionCycle}`}
              text="One platform. Complete automation. From inputs to a full production line model."
              className="factory-stitched-story__subtext max-w-md font-body text-sm leading-relaxed md:text-base"
              mutedColor={MUTED}
              primaryColor={BODY}
              active={solutionSubtextActive}
              delay={0}
              stagger={0.022}
              duration={0.2}
            />
          </motion.div>
        </div>

        <div className="factory-stitched-story__visual relative flex w-full min-h-0 flex-1 items-center justify-center lg:flex-[0_0_60%] lg:self-stretch">
          <motion.div
            className={`factory-stitched-story__visual-panel factory-stitched-story__visual-panel--problem flex justify-center lg:absolute lg:inset-0 lg:items-center ${mobileLayoutPhase === "solution" ? "max-lg:hidden" : ""}`}
            style={{ opacity: problemVisualOpacity, visibility: problemVisualVisibility }}
          >
            <AdvancedFactoryAnimation active={problemVisualActive} />
          </motion.div>

          <motion.div
            className={`factory-stitched-story__visual-panel factory-stitched-story__visual-panel--solution flex items-center justify-center overflow-hidden lg:overflow-visible lg:absolute lg:inset-0 ${mobileLayoutPhase === "problem" ? "max-lg:hidden" : ""}`}
            style={{ opacity: solutionVisualOpacity, visibility: solutionVisualVisibility }}
          >
            <div className="w-full min-w-0 max-lg:mx-auto lg:max-w-none">
              <FlowDiagram />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
