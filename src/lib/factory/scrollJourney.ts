export const JOURNEY_HEIGHT_VH = 650;

export type JourneyPhase = "hero" | "problem" | "solution" | "factory" | "contact";

export const JOURNEY = {
  hero: { fadeOut: [0.05, 0.11] as const },
  problem: { fadeIn: [0.08, 0.14] as const, fadeOut: [0.22, 0.28] as const },
  solution: { fadeIn: [0.25, 0.31] as const, fadeOut: [0.39, 0.45] as const },
  factory: { fadeIn: [0.43, 0.49] as const, fadeOut: [0.68, 0.74] as const },
  contact: { fadeIn: [0.72, 0.78] as const },
} as const;

export const JOURNEY_SNAPS: ReadonlyArray<{ phase: JourneyPhase; progress: number }> = [
  { phase: "hero", progress: 0 },
  { phase: "problem", progress: 0.2 },
  { phase: "solution", progress: 0.38 },
  { phase: "factory", progress: 0.6 },
  { phase: "contact", progress: 0.88 },
];

const TRANSITION_BANDS = [
  {
    start: JOURNEY.hero.fadeOut[0],
    end: JOURNEY.problem.fadeIn[1],
    back: JOURNEY_SNAPS[0].progress,
    forward: JOURNEY_SNAPS[1].progress,
  },
  {
    start: JOURNEY.problem.fadeOut[0],
    end: JOURNEY.solution.fadeIn[1],
    back: JOURNEY_SNAPS[1].progress,
    forward: JOURNEY_SNAPS[2].progress,
  },
  {
    start: JOURNEY.solution.fadeOut[0],
    end: JOURNEY.factory.fadeIn[1],
    back: JOURNEY_SNAPS[2].progress,
    forward: JOURNEY_SNAPS[3].progress,
  },
  {
    start: JOURNEY.factory.fadeOut[0],
    end: JOURNEY.contact.fadeIn[1],
    back: JOURNEY_SNAPS[3].progress,
    forward: JOURNEY_SNAPS[4].progress,
  },
] as const;

export const SNAP_IDLE_MS = 140;
export const SNAP_MIN_DELTA = 0.004;
export const SNAP_NEAR_HOLD = 0.03;
export const SNAP_DURATION_S = 0.62;

export function getJourneyMaxScroll(journeyHeight: number, viewportHeight: number) {
  return Math.max(0, journeyHeight - viewportHeight);
}

export function progressToScrollY(
  progress: number,
  journeyHeight: number,
  viewportHeight: number
) {
  return progress * getJourneyMaxScroll(journeyHeight, viewportHeight);
}

export function scrollYToProgress(
  scrollY: number,
  journeyHeight: number,
  viewportHeight: number
) {
  const maxScroll = getJourneyMaxScroll(journeyHeight, viewportHeight);
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / maxScroll));
}

export function resolveJourneyPhase(progress: number): JourneyPhase {
  if (progress < JOURNEY.problem.fadeIn[0]) return "hero";
  if (progress < JOURNEY.solution.fadeIn[0]) return "problem";
  if (progress < JOURNEY.factory.fadeIn[0]) return "solution";
  if (progress < JOURNEY.contact.fadeIn[0]) return "factory";
  return "contact";
}

export function isInFactoryBand(progress: number) {
  return progress >= JOURNEY.factory.fadeIn[1] && progress < JOURNEY.factory.fadeOut[0];
}

export function shouldMountFactory(progress: number, hasUserScrolled: boolean) {
  return hasUserScrolled && progress >= JOURNEY.factory.fadeIn[0];
}

export function shouldStartFactoryBuild(progress: number, hasUserScrolled: boolean) {
  return hasUserScrolled && progress >= JOURNEY.factory.fadeIn[1];
}

export function resolveSnapProgress(progress: number, direction: 1 | -1 | 0): number | null {
  for (const band of TRANSITION_BANDS) {
    if (progress < band.start || progress > band.end) continue;

    if (direction > 0) return band.forward;
    if (direction < 0) return band.back;
    return Math.abs(progress - band.back) <= Math.abs(progress - band.forward)
      ? band.back
      : band.forward;
  }

  const nearest = JOURNEY_SNAPS.reduce((best, snap) =>
    Math.abs(snap.progress - progress) < Math.abs(best.progress - progress) ? snap : best
  );

  const delta = Math.abs(nearest.progress - progress);
  if (delta > SNAP_MIN_DELTA && delta <= SNAP_NEAR_HOLD) {
    return nearest.progress;
  }

  return null;
}
