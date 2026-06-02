import type * as THREE from "three";
import { clamp } from "./math";
import { machineLiveMultiplier } from "./flowOptimization";

type AnimClock = {
  lastMs: number;
  timeMs: number;
};

/** Accumulated station time that stops advancing when the line is frozen. */
export function stationAnimationTime(
  group: THREE.Group,
  globalElapsedMs: number,
  stationId: string,
  baseLive: number
) {
  const motionLive = machineLiveMultiplier(baseLive, stationId);
  let clock = group.userData.flowAnimClock as AnimClock | undefined;
  if (!clock) {
    clock = { lastMs: globalElapsedMs, timeMs: 0 };
    group.userData.flowAnimClock = clock;
  }

  const delta = Math.max(0, Math.min(48, globalElapsedMs - clock.lastMs));
  clock.lastMs = globalElapsedMs;

  const rate = baseLive > 0.001 ? clamp(motionLive / baseLive, 0, 2) : 0;
  clock.timeMs += delta * rate;

  return clock.timeMs;
}
