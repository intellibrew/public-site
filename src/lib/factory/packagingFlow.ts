import { clamp, smoothstep } from "./math";
import { crossedPathThreshold } from "./stationPathEvents";

export const PACKAGING_PATH_T = 0.964;

export const PALLET_A_CAPACITY = 4;
export const PALLET_B_CAPACITY = 3;

const PHASE_MS = {
  seal: 1600,
  place: 2600,
  label: 1000,
  dispatch: 5200,
} as const;

export type PackagingCyclePhase = "idle" | "sealing" | "placing" | "labeling" | "dispatching";

export type PackagingFlowSnapshot = {
  phase: PackagingCyclePhase;
  seal: number;
  crane: number;
  label: number;
  inbound: number;
  stackALayers: number;
  stackBLayers: number;
  dispatchProgress: number;
};

type PackagingFlowState = {
  queued: number;
  stackA: number;
  stackB: number;
  activePallet: "A" | "B";
  phase: PackagingCyclePhase;
  phaseStartMs: number;
  dispatchTarget: "A" | "B" | null;
  lastElapsedMs: number;
};

const defaultState = (): PackagingFlowState => ({
  queued: 0,
  stackA: 0,
  stackB: 0,
  activePallet: "A",
  phase: "idle",
  phaseStartMs: 0,
  dispatchTarget: null,
  lastElapsedMs: 0,
});

let flowState = defaultState();

export function resetPackagingFlow() {
  flowState = defaultState();
}

export function queuePackagingArrival() {
  flowState.queued += 1;
}

export function crossedPackagingThreshold(prevPathT: number, pathT: number) {
  return crossedPathThreshold(prevPathT, pathT, PACKAGING_PATH_T);
}

function palletIsFull(pallet: "A" | "B", state: PackagingFlowState) {
  return pallet === "A" ? state.stackA >= PALLET_A_CAPACITY : state.stackB >= PALLET_B_CAPACITY;
}

function beginPhase(phase: PackagingCyclePhase, elapsedMs: number) {
  flowState.phase = phase;
  flowState.phaseStartMs = elapsedMs;
}

function phaseProgress(elapsedMs: number, durationMs: number, live: number) {
  if (durationMs <= 0 || live <= 0.001) return 0;
  const elapsed = Math.max(0, elapsedMs - flowState.phaseStartMs);
  return clamp(elapsed / (durationMs / live), 0, 1);
}

function choosePlacementPallet(state: PackagingFlowState): "A" | "B" | null {
  if (state.stackA < PALLET_A_CAPACITY) return "A";
  if (state.stackB < PALLET_B_CAPACITY) return "B";
  return null;
}

function completePlacement(state: PackagingFlowState) {
  const target = state.activePallet;
  if (target === "A") {
    state.stackA = Math.min(PALLET_A_CAPACITY, state.stackA + 1);
  } else {
    state.stackB = Math.min(PALLET_B_CAPACITY, state.stackB + 1);
  }
  if (state.queued > 0) {
    state.queued -= 1;
  }
}

function startDispatch(state: PackagingFlowState, target: "A" | "B", elapsedMs: number) {
  state.dispatchTarget = target;
  beginPhase("dispatching", elapsedMs);
}

function finishDispatch(state: PackagingFlowState) {
  if (state.dispatchTarget === "A") {
    state.stackA = 0;
    state.activePallet = "B";
  } else if (state.dispatchTarget === "B") {
    state.stackB = 0;
    state.activePallet = "A";
  }
  state.dispatchTarget = null;
}

function idleSnapshot(state: PackagingFlowState): PackagingFlowSnapshot {
  return {
    phase: "idle",
    seal: 0,
    crane: 0,
    label: 0,
    inbound: 0,
    stackALayers: state.stackA,
    stackBLayers: state.stackB,
    dispatchProgress: 0,
  };
}

export function advancePackagingFlow(elapsedMs: number, live: number): PackagingFlowSnapshot {
  if (live <= 0.02) {
    flowState.lastElapsedMs = elapsedMs;
    return idleSnapshot(flowState);
  }

  const state = flowState;

  if (state.phase === "idle") {
    const nextPallet = choosePlacementPallet(state);
    if (state.queued > 0 && nextPallet) {
      state.activePallet = nextPallet;
      beginPhase("sealing", elapsedMs);
    } else if (palletIsFull("A", state)) {
      startDispatch(state, "A", elapsedMs);
    } else if (palletIsFull("B", state)) {
      startDispatch(state, "B", elapsedMs);
    } else {
      state.lastElapsedMs = elapsedMs;
      return idleSnapshot(state);
    }
  }

  if (state.phase === "sealing") {
    const seal = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.seal, live));
    const inbound = seal < 0.72 ? 1 : 1 - smoothstep(0.72, 1, seal);
    if (seal >= 1) {
      beginPhase("placing", elapsedMs);
    }
    state.lastElapsedMs = elapsedMs;
    return {
      phase: "sealing",
      seal,
      crane: 0,
      label: 0,
      inbound,
      stackALayers: state.stackA,
      stackBLayers: state.stackB,
      dispatchProgress: 0,
    };
  }

  if (state.phase === "placing") {
    const place = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.place, live));
    const crane = place;
    const target = state.activePallet;
    const baseA = state.stackA;
    const baseB = state.stackB;
    const stackALayers = target === "A" ? baseA + place * 0.92 : baseA;
    const stackBLayers = target === "B" ? baseB + place * 0.92 : baseB;

    if (place >= 1) {
      completePlacement(state);
      if (palletIsFull(state.activePallet, state)) {
        startDispatch(state, state.activePallet, elapsedMs);
      } else {
        beginPhase("labeling", elapsedMs);
      }
    }

    state.lastElapsedMs = elapsedMs;
    return {
      phase: "placing",
      seal: 0.35 * (1 - place),
      crane,
      label: 0,
      inbound: 0,
      stackALayers,
      stackBLayers,
      dispatchProgress: 0,
    };
  }

  if (state.phase === "labeling") {
    const label = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.label, live));
    if (label >= 1) {
      const nextPallet = choosePlacementPallet(state);
      if (state.queued > 0 && nextPallet) {
        state.activePallet = nextPallet;
        beginPhase("sealing", elapsedMs);
      } else if (palletIsFull("A", state)) {
        startDispatch(state, "A", elapsedMs);
      } else if (palletIsFull("B", state)) {
        startDispatch(state, "B", elapsedMs);
      } else {
        state.phase = "idle";
      }
    }
    state.lastElapsedMs = elapsedMs;
    return {
      phase: "labeling",
      seal: 0,
      crane: 0,
      label,
      inbound: 0,
      stackALayers: state.stackA,
      stackBLayers: state.stackB,
      dispatchProgress: 0,
    };
  }

  if (state.phase === "dispatching") {
    const dispatch = smoothstep(0, 1, phaseProgress(elapsedMs, PHASE_MS.dispatch, live));
    const crane = dispatch < 0.42 ? dispatch / 0.42 : 1 - smoothstep(0.58, 1, dispatch);
    const target = state.dispatchTarget ?? "A";
    const fullA = target === "A" ? PALLET_A_CAPACITY : state.stackA;
    const fullB = target === "B" ? PALLET_B_CAPACITY : state.stackB;
    const clearStart = 0.48;
    const clearT = smoothstep(clearStart, 0.92, dispatch);
    const stackALayers =
      target === "A" ? Math.max(0, fullA * (1 - clearT)) : state.stackA;
    const stackBLayers =
      target === "B" ? Math.max(0, fullB * (1 - clearT)) : state.stackB;

    if (dispatch >= 1) {
      finishDispatch(state);
      state.phase = "idle";
    }

    state.lastElapsedMs = elapsedMs;
    return {
      phase: "dispatching",
      seal: 0,
      crane,
      label: Math.max(0, 1 - dispatch * 1.4),
      inbound: 0,
      stackALayers,
      stackBLayers,
      dispatchProgress: dispatch,
    };
  }

  state.lastElapsedMs = elapsedMs;
  return idleSnapshot(state);
}

export function packagingPreviewSnapshot(): PackagingFlowSnapshot {
  return {
    phase: "idle",
    seal: 0,
    crane: 0.2,
    label: 0,
    inbound: 0,
    stackALayers: 2,
    stackBLayers: 1,
    dispatchProgress: 0,
  };
}
