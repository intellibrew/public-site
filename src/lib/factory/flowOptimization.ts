import { clamp, easeOutCubic, lerp, smoothstep } from "./math";
import { LAYOUT } from "./layout";
import { pathTAtLayout } from "./path";
import { primaryPath } from "./products";
import { MACHINE_MAP } from "./machineRegistry";

export type StoryPhase = "underproduction" | "bottleneck" | "optimizing" | "optimized";

export type FlowPhase = StoryPhase;

export const UNDERPRODUCTION_LEAD_MS = 9000;
export const OPTIMIZING_DURATION_MS = 5500;

export const BASELINE_LINE_SPEED = 1;

export const UNDERPRODUCTION_LINE_SPEED = 0.48;

export const BASELINE_MOVER_COUNT = LAYOUT.conveyorRuns[0].movingPackages;
export const UNDERPRODUCTION_MOVER_COUNT = Math.max(2, Math.floor(BASELINE_MOVER_COUNT / 2));
export const OPTIMIZED_MOVER_COUNT = BASELINE_MOVER_COUNT * 2;

export const BOTTLENECK_EXCLUDED_STATION_IDS = ["intake", "packaging"] as const;

export type FlowStationNode = {
  id: string;
  t: number;
};

export const FLOW_STATION_ORDER: FlowStationNode[] = [
  { id: "intake", t: pathTAtLayout(primaryPath, LAYOUT.inputStation.pad) },
  { id: "blanking", t: pathTAtLayout(primaryPath, LAYOUT.blankingPressStation.anchor) },
  { id: "stamping", t: pathTAtLayout(primaryPath, LAYOUT.stampingCellStation.anchor) },
  { id: "subAssembly", t: pathTAtLayout(primaryPath, LAYOUT.subAssemblyStation.anchor) },
  { id: "welding", t: pathTAtLayout(primaryPath, LAYOUT.weldingStation.anchor) },
  { id: "paint", t: pathTAtLayout(primaryPath, LAYOUT.paintBoothStation.anchor) },
  { id: "finalAssembly", t: pathTAtLayout(primaryPath, LAYOUT.finalAssemblyStation.anchor) },
  { id: "packaging", t: pathTAtLayout(primaryPath, LAYOUT.packagingStation.anchor) },
];

export const BOTTLENECK_ELIGIBLE_STATION_IDS = FLOW_STATION_ORDER.map((node) => node.id).filter(
  (id) => !BOTTLENECK_EXCLUDED_STATION_IDS.includes(id as (typeof BOTTLENECK_EXCLUDED_STATION_IDS)[number])
);

export type StorySnapshot = {
  phase: StoryPhase;
  phaseStartedAt: number;
  bottleneckStationId: string;
};

export type FlowState = {
  phase: StoryPhase;
  bottleneckStationId: string;
  machineLive: number;
  conveyorLive: number;
  activeMoverCount: number;
  accentLevel: number;
  pulsePosition: number;
  bottleneckIntensity: number;
  phaseProgress: number;
};

const defaultState = (): FlowState => ({
  phase: "underproduction",
  bottleneckStationId: BOTTLENECK_ELIGIBLE_STATION_IDS[0],
  machineLive: UNDERPRODUCTION_LINE_SPEED,
  conveyorLive: UNDERPRODUCTION_LINE_SPEED,
  activeMoverCount: UNDERPRODUCTION_MOVER_COUNT,
  accentLevel: 0.1,
  pulsePosition: 0,
  bottleneckIntensity: 0,
  phaseProgress: 0,
});

let currentFlowState: FlowState = defaultState();

export function pickRandomBottleneckStationId() {
  const pool = BOTTLENECK_ELIGIBLE_STATION_IDS;
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

export function getStationFlowIndex(stationId: string) {
  return FLOW_STATION_ORDER.findIndex((node) => node.id === stationId);
}

export function setCurrentFlowState(state: FlowState) {
  currentFlowState = state;
}

export function getCurrentFlowState() {
  return currentFlowState;
}

export function dormantFlowState(snapshot: StorySnapshot): FlowState {
  return {
    phase: snapshot.phase,
    bottleneckStationId: snapshot.bottleneckStationId,
    machineLive: 0,
    conveyorLive: 0,
    activeMoverCount: 0,
    accentLevel: 0,
    pulsePosition: 0,
    bottleneckIntensity: 0,
    phaseProgress: 0,
  };
}

function stationNode(stationId?: string) {
  if (!stationId) return undefined;
  return FLOW_STATION_ORDER.find((node) => node.id === stationId);
}

export function stationPulseWake(stationId: string, pulsePosition: number) {
  const node = stationNode(stationId);
  if (!node) return 0;
  return smoothstep(node.t - 0.04, node.t + 0.07, pulsePosition);
}

function bottleneckStationLive(baseLive: number, _stationId: string, flow: FlowState) {
  const freeze = easeOutCubic(flow.bottleneckIntensity);
  return baseLive * (1 - freeze);
}

export function machineLiveMultiplier(baseLive: number, stationId?: string) {
  const flow = currentFlowState;
  if (baseLive <= 0) return 0;

  if (flow.phase === "bottleneck" && stationId) {
    return bottleneckStationLive(baseLive, stationId, flow);
  }

  return baseLive * flow.machineLive;
}

export function accentMultiplier(stationId?: string) {
  const flow = currentFlowState;

  if (flow.phase === "underproduction") {
    return 0.12;
  }

  if (flow.phase === "bottleneck") {
    if (stationId === flow.bottleneckStationId) {
      return lerp(0.12, 0.04, flow.bottleneckIntensity);
    }
    if (stationId) {
      const constraintIndex = getStationFlowIndex(flow.bottleneckStationId);
      const stationIndex = getStationFlowIndex(stationId);
      if (stationIndex > constraintIndex) {
        return lerp(0.1, 0.04, flow.bottleneckIntensity);
      }
    }
    return 0.07;
  }

  if (flow.phase === "optimizing") {
    if (!stationId) {
      return lerp(0.1, 1.25, smoothstep(0.05, 0.95, flow.phaseProgress));
    }
    const wake = stationPulseWake(stationId, flow.pulsePosition);
    const trail = smoothstep(0, 0.22, flow.pulsePosition - (stationNode(stationId)?.t ?? 0));
    return lerp(0.08, 1.35, Math.max(wake, trail * 0.72));
  }

  if (flow.phase === "optimized") {
    return lerp(1.08, 1.4, flow.accentLevel);
  }

  return 0.12;
}

function withBottleneckId(snapshot: StorySnapshot, state: Omit<FlowState, "bottleneckStationId">): FlowState {
  return { ...state, bottleneckStationId: snapshot.bottleneckStationId };
}

export function computeFlowState(snapshot: StorySnapshot, nowMs: number): FlowState {
  const elapsed = Math.max(0, nowMs - snapshot.phaseStartedAt);

  if (snapshot.phase === "underproduction") {
    const phaseProgress = clamp(elapsed / UNDERPRODUCTION_LEAD_MS);
    return withBottleneckId(snapshot, {
      phase: "underproduction",
      machineLive: UNDERPRODUCTION_LINE_SPEED,
      conveyorLive: UNDERPRODUCTION_LINE_SPEED,
      activeMoverCount: UNDERPRODUCTION_MOVER_COUNT,
      accentLevel: 0.1,
      pulsePosition: 0,
      bottleneckIntensity: 0,
      phaseProgress,
    });
  }

  if (snapshot.phase === "bottleneck") {
    const phaseProgress = clamp(elapsed / 3200);
    const ramp = smoothstep(0, 1, phaseProgress);
    const freeze = easeOutCubic(ramp);
    return withBottleneckId(snapshot, {
      phase: "bottleneck",
      machineLive: lerp(UNDERPRODUCTION_LINE_SPEED, 0, freeze),
      conveyorLive: lerp(UNDERPRODUCTION_LINE_SPEED, 0, freeze),
      activeMoverCount: UNDERPRODUCTION_MOVER_COUNT,
      accentLevel: 0.06,
      pulsePosition: 0,
      bottleneckIntensity: ramp,
      phaseProgress,
    });
  }

  if (snapshot.phase === "optimizing") {
    const phaseProgress = clamp(elapsed / OPTIMIZING_DURATION_MS);
    const awaken = easeOutCubic(phaseProgress);
    return withBottleneckId(snapshot, {
      phase: "optimizing",
      machineLive: lerp(0, BASELINE_LINE_SPEED, awaken),
      conveyorLive: lerp(0, BASELINE_LINE_SPEED, smoothstep(0.15, 0.9, awaken)),
      activeMoverCount: lerp(
        UNDERPRODUCTION_MOVER_COUNT,
        OPTIMIZED_MOVER_COUNT,
        smoothstep(0.2, 1, awaken)
      ),
      accentLevel: smoothstep(0.15, 1, awaken),
      pulsePosition: awaken,
      bottleneckIntensity: lerp(1, 0, smoothstep(0, 0.3, phaseProgress)),
      phaseProgress,
    });
  }

  return withBottleneckId(snapshot, {
    phase: "optimized",
    machineLive: BASELINE_LINE_SPEED,
    conveyorLive: BASELINE_LINE_SPEED,
    activeMoverCount: OPTIMIZED_MOVER_COUNT,
    accentLevel: 1,
    pulsePosition: 1,
    bottleneckIntensity: 0,
    phaseProgress: 1,
  });
}

export function flowCaption(
  flow: FlowState,
  snapshot: StorySnapshot
): { label: string; detail: string } | null {
  const constraintName =
    MACHINE_MAP.get(snapshot.bottleneckStationId)?.name ?? snapshot.bottleneckStationId;

  switch (snapshot.phase) {
    case "underproduction":
      return {
        label: "Below target throughput",
        detail: "Line running below capacity - identify bottlenecks to locate constraints",
      };
    case "bottleneck":
      return {
        label: "Line stalled",
        detail: `${constraintName} constraint - click the stalled station`,
      };
    case "optimizing":
      return {
        label: "NeoFab optimizing",
        detail: "Rebalancing flow and clearing constraints across the line",
      };
    case "optimized":
      return {
        label: "Factory optimized",
        detail: "Full production flow restored - balanced output from intake to packaging",
      };
    default:
      return null;
  }
}

export const CONVEYOR_DESIGN_THROUGHPUT_HR = 148;

export type ConveyorPanelMetrics = {
  activeUnits: number;
  lineSpeedPct: number;
  productionPerHour: number;
  cycleTimeSec: number;
  wipLoadPct: number;
  rejectRatePct: number;
  lineStatus: string;
  lineStatusTone: "normal" | "warn" | "alert" | "success";
};

export function computeConveyorPanelMetrics(flow: FlowState): ConveyorPanelMetrics {
  const activeUnits = Math.round(flow.activeMoverCount);
  const lineSpeedPct = Math.round(flow.conveyorLive * 100);
  const wipLoadPct = Math.round((flow.activeMoverCount / OPTIMIZED_MOVER_COUNT) * 100);
  const productionPerHour = Math.round(
    CONVEYOR_DESIGN_THROUGHPUT_HR *
      flow.conveyorLive *
      (flow.activeMoverCount / OPTIMIZED_MOVER_COUNT)
  );
  const cycleTimeSec =
    productionPerHour > 0 ? Math.round((3600 / productionPerHour) * 10) / 10 : 0;

  if (flow.phase === "bottleneck" || flow.bottleneckIntensity > 0.45) {
    return {
      activeUnits,
      lineSpeedPct,
      productionPerHour,
      cycleTimeSec,
      wipLoadPct,
      rejectRatePct: 10,
      lineStatus: "Constraint detected",
      lineStatusTone: "alert",
    };
  }

  if (flow.phase === "optimizing") {
    return {
      activeUnits,
      lineSpeedPct,
      productionPerHour,
      cycleTimeSec,
      wipLoadPct,
      rejectRatePct: 10,
      lineStatus: "Rebalancing",
      lineStatusTone: "normal",
    };
  }

  if (flow.phase === "optimized") {
    return {
      activeUnits,
      lineSpeedPct,
      productionPerHour,
      cycleTimeSec,
      wipLoadPct,
      rejectRatePct: 10,
      lineStatus: "At design rate",
      lineStatusTone: "success",
    };
  }

  return {
    activeUnits,
    lineSpeedPct,
    productionPerHour,
    cycleTimeSec,
    wipLoadPct,
    rejectRatePct: 10,
    lineStatus: "Below capacity",
    lineStatusTone: "warn",
  };
}

export function initialStorySnapshot(
  startedAt = performance.now(),
  bottleneckStationId = pickRandomBottleneckStationId()
): StorySnapshot {
  return { phase: "underproduction", phaseStartedAt: startedAt, bottleneckStationId };
}

export function advanceStorySnapshot(
  prev: StorySnapshot,
  phase: StoryPhase,
  startedAt = performance.now()
): StorySnapshot {
  return {
    phase,
    phaseStartedAt: startedAt,
    bottleneckStationId: prev.bottleneckStationId,
  };
}
