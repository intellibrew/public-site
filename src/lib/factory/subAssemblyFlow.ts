import { LAYOUT } from "./layout";
import { clamp, smoothstep } from "./math";
import { pathTAtLayout } from "./path";
import { primaryPath } from "./products";
import { crossedPathThreshold } from "./stationPathEvents";

export const SUB_ASSEMBLY_PATH_T = pathTAtLayout(
  primaryPath,
  LAYOUT.subAssemblyStation.anchor
);

export const TARGET_STACK_CAPACITY = 4;

const PHASE_MS = {
  pickPlace: 5200,
  unload: 2800,
  dwell: 900,
} as const;

export type SubAssemblyCyclePhase = "idle" | "picking" | "dwell" | "unloading";

export type SubAssemblyFlowSnapshot = {
  phase: SubAssemblyCyclePhase;
  cycleProgress: number;
  targetStack: number;
  sourceReady: boolean;
  queued: number;
};

type SubAssemblyFlowState = {
  queued: number;
  targetStack: number;
  phase: SubAssemblyCyclePhase;
  phaseStartMs: number;
  unloadFrom: number;
};

const defaultState = (): SubAssemblyFlowState => ({
  queued: 0,
  targetStack: 0,
  phase: "idle",
  phaseStartMs: 0,
  unloadFrom: 0,
});

let flowState = defaultState();

export function resetSubAssemblyFlow() {
  flowState = defaultState();
}

export function queueSubAssemblyArrival() {
  flowState.queued += 1;
}

export function crossedSubAssemblyThreshold(prevPathT: number, pathT: number) {
  return crossedPathThreshold(prevPathT, pathT, SUB_ASSEMBLY_PATH_T);
}

function beginPhase(phase: SubAssemblyCyclePhase, elapsedMs: number) {
  flowState.phase = phase;
  flowState.phaseStartMs = elapsedMs;
}

function phaseProgress(elapsedMs: number, durationMs: number, live: number) {
  if (durationMs <= 0 || live <= 0.001) return 0;
  const elapsed = Math.max(0, elapsedMs - flowState.phaseStartMs);
  return clamp(elapsed / (durationMs / live), 0, 1);
}

function idleSnapshot(state: SubAssemblyFlowState): SubAssemblyFlowSnapshot {
  return {
    phase: "idle",
    cycleProgress: 0,
    targetStack: state.targetStack,
    sourceReady: state.queued > 0,
    queued: state.queued,
  };
}

export function advanceSubAssemblyFlow(elapsedMs: number, live: number): SubAssemblyFlowSnapshot {
  if (live <= 0.02) {
    return idleSnapshot(flowState);
  }

  const state = flowState;

  if (state.phase === "idle") {
    if (state.targetStack >= TARGET_STACK_CAPACITY) {
      state.unloadFrom = state.targetStack;
      beginPhase("unloading", elapsedMs);
    } else if (state.queued > 0) {
      beginPhase("picking", elapsedMs);
    } else {
      return idleSnapshot(state);
    }
  }

  if (state.phase === "picking") {
    const cycleProgress = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.pickPlace, live));
    const placingStack =
      state.targetStack + smoothstep(0.68, 0.78, cycleProgress) * 0.95;

    if (cycleProgress >= 1) {
      state.targetStack = Math.min(TARGET_STACK_CAPACITY, state.targetStack + 1);
      if (state.queued > 0) {
        state.queued -= 1;
      }
      beginPhase("dwell", elapsedMs);
    }

    return {
      phase: "picking",
      cycleProgress,
      targetStack: placingStack,
      sourceReady: state.queued > 0 && cycleProgress < 0.12,
      queued: state.queued,
    };
  }

  if (state.phase === "dwell") {
    const dwell = phaseProgress(elapsedMs, PHASE_MS.dwell, live);
    if (dwell >= 1) {
      if (state.queued > 0 && state.targetStack < TARGET_STACK_CAPACITY) {
        beginPhase("picking", elapsedMs);
      } else if (state.targetStack >= TARGET_STACK_CAPACITY) {
        state.unloadFrom = state.targetStack;
        beginPhase("unloading", elapsedMs);
      } else {
        state.phase = "idle";
      }
    }

    return {
      phase: "dwell",
      cycleProgress: 0,
      targetStack: state.targetStack,
      sourceReady: state.queued > 0,
      queued: state.queued,
    };
  }

  if (state.phase === "unloading") {
    const unload = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.unload, live));
    const targetStack = Math.max(0, state.unloadFrom * (1 - unload));

    if (unload >= 1) {
      state.targetStack = 0;
      state.phase = "idle";
      if (state.queued > 0) {
        beginPhase("picking", elapsedMs);
      }
    } else {
      state.targetStack = targetStack;
    }

    return {
      phase: "unloading",
      cycleProgress: 0,
      targetStack,
      sourceReady: state.queued > 0,
      queued: state.queued,
    };
  }

  return idleSnapshot(state);
}

export function subAssemblyPreviewSnapshot(): SubAssemblyFlowSnapshot {
  return {
    phase: "picking",
    cycleProgress: 0.52,
    targetStack: 1.6,
    sourceReady: false,
    queued: 0,
  };
}
