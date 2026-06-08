import type * as THREE from "three";
import { clamp, smoothstep } from "./math";
import { machineLiveMultiplier } from "./flowOptimization";

const STATION_REVEAL_LIVE: Record<string, [number, number]> = {
  intake: [0.2, 0.3],
  blanking: [0.24, 0.32],
  stamping: [0.28, 0.36],
  subAssembly: [0.32, 0.4],
  welding: [0.36, 0.44],
  paint: [0.4, 0.48],
  packaging: [0.48, 0.6],
};

export function stationBaseLive(progress: number, stationId: string) {
  const [start, end] = STATION_REVEAL_LIVE[stationId] ?? [0.78, 0.95];
  return smoothstep(start, end, progress);
}

type AnimClock = {
  lastMs: number;
  timeMs: number;
};

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
