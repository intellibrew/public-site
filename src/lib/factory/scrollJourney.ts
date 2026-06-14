export const JOURNEY_HEIGHT_VH = 750;

export type JourneyPhase =
  | "hero"
  | "factory"
  | "problem"
  | "solution"
  | "customers"
  | "contact";

export const JOURNEY = {
  hero: { fadeOut: [0.04, 0.09] as const },
  factory: { fadeIn: [0.08, 0.12] as const, fadeOut: [0.24, 0.3] as const },
  problem: { fadeIn: [0.3, 0.36] as const, fadeOut: [0.4, 0.43] as const },
  solution: { fadeIn: [0.42, 0.46] as const, fadeOut: [0.52, 0.56] as const },
  customers: { fadeIn: [0.56, 0.62] as const, fadeOut: [0.7, 0.76] as const },
  contact: { fadeIn: [0.74, 0.8] as const },
} as const;

export const JOURNEY_SNAPS: ReadonlyArray<{ phase: JourneyPhase; progress: number }> = [
  { phase: "hero", progress: 0 },
  { phase: "factory", progress: 0.14 },
  { phase: "problem", progress: 0.36 },
  { phase: "solution", progress: 0.48 },
  { phase: "customers", progress: 0.64 },
  { phase: "contact", progress: 0.84 },
];

const TRANSITION_BANDS = [
  {
    start: JOURNEY.hero.fadeOut[0],
    end: JOURNEY.factory.fadeIn[1],
    back: JOURNEY_SNAPS[0].progress,
    forward: JOURNEY_SNAPS[1].progress,
  },
  {
    start: JOURNEY.factory.fadeOut[0],
    end: JOURNEY.problem.fadeIn[1],
    back: JOURNEY_SNAPS[1].progress,
    forward: JOURNEY_SNAPS[2].progress,
  },
  {
    start: JOURNEY.problem.fadeOut[0],
    end: JOURNEY.solution.fadeIn[1],
    back: JOURNEY_SNAPS[2].progress,
    forward: JOURNEY_SNAPS[3].progress,
  },
  {
    start: JOURNEY.solution.fadeOut[0],
    end: JOURNEY.customers.fadeIn[1],
    back: JOURNEY_SNAPS[3].progress,
    forward: JOURNEY_SNAPS[4].progress,
  },
  {
    start: JOURNEY.customers.fadeOut[0],
    end: JOURNEY.contact.fadeIn[1],
    back: JOURNEY_SNAPS[4].progress,
    forward: JOURNEY_SNAPS[5].progress,
  },
] as const;

export const SNAP_IDLE_MS = 160;
export const SNAP_MIN_DELTA = 0.004;
export const SNAP_NEAR_HOLD = 0.035;
export const SNAP_DURATION_S = 0.55;
export const SNAP_COMMIT_FRACTION = 0.42;

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
  if (progress < JOURNEY.factory.fadeIn[0]) return "hero";
  if (progress < JOURNEY.problem.fadeIn[0]) return "factory";
  if (progress < JOURNEY.solution.fadeIn[0]) return "problem";
  if (progress < JOURNEY.customers.fadeIn[0]) return "solution";
  if (progress < JOURNEY.contact.fadeIn[0]) return "customers";
  return "contact";
}

export function isInFactoryBand(progress: number) {
  return progress >= JOURNEY.factory.fadeIn[1] && progress < JOURNEY.factory.fadeOut[0];
}

/** Free-scroll zone — journey snap is disabled so the factory sim is not interrupted. */
export function shouldDisableJourneySnap(progress: number) {
  const inFactoryFreeScroll =
    progress >= JOURNEY.factory.fadeIn[0] && progress <= JOURNEY.factory.fadeOut[1];
  const inStoryHandoff =
    progress >= JOURNEY.problem.fadeOut[0] && progress <= JOURNEY.solution.fadeIn[1];

  return (
    inFactoryFreeScroll || inStoryHandoff
  );
}

export function isFactoryPhase(progress: number) {
  return progress >= JOURNEY.factory.fadeIn[0] && progress <= JOURNEY.problem.fadeIn[0];
}

export function shouldMountFactory(progress: number, hasUserScrolled: boolean) {
  return hasUserScrolled && progress >= JOURNEY.factory.fadeIn[0];
}

export function shouldStartFactoryBuild(progress: number, hasUserScrolled: boolean) {
  return hasUserScrolled && progress >= JOURNEY.factory.fadeIn[1];
}

function getTransitionBand(progress: number) {
  for (const band of TRANSITION_BANDS) {
    if (progress >= band.start && progress <= band.end) return band;
  }
  return null;
}

function getBandCommitTarget(
  band: (typeof TRANSITION_BANDS)[number],
  progress: number,
  direction: 1 | -1 | 0
) {
  const span = band.end - band.start;
  const commitAt = band.start + span * SNAP_COMMIT_FRACTION;
  const commitBackAt = band.end - span * SNAP_COMMIT_FRACTION;

  if (direction > 0) {
    if (progress >= commitAt) return band.forward;
    return band.back;
  }
  if (direction < 0) {
    if (progress <= commitBackAt) return band.back;
    return band.forward;
  }

  return Math.abs(progress - band.back) <= Math.abs(progress - band.forward)
    ? band.back
    : band.forward;
}

export function resolveSnapProgress(progress: number, direction: 1 | -1 | 0): number | null {
  const band = getTransitionBand(progress);
  if (band) {
    return getBandCommitTarget(band, progress, direction);
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

/** Snap immediately when the user has scrolled far enough into a transition band. */
export function shouldCommitTransition(progress: number, direction: 1 | -1): boolean {
  const band = getTransitionBand(progress);
  if (!band) return false;

  const span = band.end - band.start;
  const commitAt = band.start + span * SNAP_COMMIT_FRACTION;
  const commitBackAt = band.end - span * SNAP_COMMIT_FRACTION;

  if (direction > 0) return progress >= commitAt;
  return progress <= commitBackAt;
}

export function getNearestSnapIndex(progress: number): number {
  let nearestIdx = 0;
  let nearestDelta = Infinity;

  JOURNEY_SNAPS.forEach((snap, index) => {
    const delta = Math.abs(snap.progress - progress);
    if (delta < nearestDelta) {
      nearestDelta = delta;
      nearestIdx = index;
    }
  });

  return nearestIdx;
}

export function getAdjacentSnapProgress(
  progress: number,
  direction: "prev" | "next"
): number | null {
  const index = getNearestSnapIndex(progress);
  if (direction === "prev") {
    if (index <= 0) return null;
    return JOURNEY_SNAPS[index - 1].progress;
  }
  if (index >= JOURNEY_SNAPS.length - 1) return null;
  return JOURNEY_SNAPS[index + 1].progress;
}

export function isInTransitionBand(progress: number): boolean {
  return getTransitionBand(progress) != null;
}
