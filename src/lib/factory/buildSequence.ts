import * as THREE from "three";
import type { Materials } from "./materials";
import type { FlowState } from "./flowOptimization";
import { setCurrentFlowState } from "./flowOptimization";
import { applyFlowVisuals, buildFlowVisuals, type FlowVisualRig } from "./flowVisuals";
import { buildConveyor, tickConveyor } from "./conveyor";
import { buildFloor, buildShell } from "./shell";
import {
  buildBlankingPress,
  buildFinalAssembly,
  buildIntake,
  buildPackaging,
  buildPaintBooth,
  buildStamping,
  buildSubAssembly,
  buildWelding,
  tickBlankingPress,
  tickFinalAssembly,
  tickIntake,
  tickPackaging,
  tickPaintBooth,
  tickStamping,
  tickSubAssembly,
  tickWelding,
} from "./stations";
import { CLICKABLE_STATION_IDS } from "./machineRegistry";
import { POWER_SUBSTATION_ID } from "./powerSubstation";
import type { RevealStep } from "./types";

export type FactoryBuild = {
  steps: RevealStep[];
  shell: RevealStep;
  conveyor: RevealStep;
  machineGroups: THREE.Group[];
  stationGroups: Map<string, THREE.Group>;
  flowVisuals: FlowVisualRig;
  updateMachines: (progress: number, elapsedMs: number, flow: FlowState) => void;
};

const STATION_STEP_IDS = [
  "intake",
  "blanking",
  "stamping",
  "subAssembly",
  "welding",
  "paint",
  "finalAssembly",
  "packaging",
] as const;

const FLOW_ACTIVE_EPSILON = 0.001;
const MACHINE_OPERATION_START_PROGRESS = 0.985;

function hasLineMotion(flow: FlowState) {
  return (
    flow.machineLive > FLOW_ACTIVE_EPSILON ||
    flow.conveyorLive > FLOW_ACTIVE_EPSILON ||
    flow.activeMoverCount > 0
  );
}

function hasFlowVisualState(flow: FlowState) {
  return flow.accentLevel > FLOW_ACTIVE_EPSILON || flow.bottleneckIntensity > FLOW_ACTIVE_EPSILON;
}

export function makeBuildSequence(materials: Materials): FactoryBuild {
  const floor = revealStep(buildFloor(materials), 0, 0.09);
  const shell = revealStep(buildShell(materials), 0.07, 0.17);
  const intake = revealStep(buildIntake(materials), 0.15, 0.23, 0.22);
  const blanking = revealStep(buildBlankingPress(materials), 0.21, 0.29, 0.24);
  const stamping = revealStep(buildStamping(materials), 0.27, 0.35, 0.26);
  const subAssembly = revealStep(buildSubAssembly(materials), 0.33, 0.41, 0.28);
  const welding = revealStep(buildWelding(materials), 0.39, 0.47, 0.27);
  const paint = revealStep(buildPaintBooth(materials), 0.45, 0.53, 0.25);
  const finalAssembly = revealStep(buildFinalAssembly(materials), 0.51, 0.59, 0.3);
  const packaging = revealStep(buildPackaging(materials), 0.57, 0.65, 0.26);
  const conveyor = revealStep(buildConveyor(materials), 0.68, 0.86, 0.2);
  const steps = [
    floor,
    shell,
    intake,
    blanking,
    stamping,
    subAssembly,
    welding,
    paint,
    finalAssembly,
    packaging,
    conveyor,
  ];

  const stationGroups = new Map<string, THREE.Group>();
  const machineSteps = [
    intake,
    blanking,
    stamping,
    subAssembly,
    welding,
    paint,
    finalAssembly,
    packaging,
  ];
  const machineGroups = machineSteps.map((step) => step.group);
  machineSteps.forEach((step, index) => {
    const id = STATION_STEP_IDS[index];
    if (CLICKABLE_STATION_IDS.includes(id)) {
      step.group.userData.stationId = id;
      stationGroups.set(id, step.group);
    }
  });

  const qcStation = conveyor.group.userData.qcStationGroup as THREE.Group | undefined;
  if (qcStation && CLICKABLE_STATION_IDS.includes("qualityCheck")) {
    stationGroups.set("qualityCheck", qcStation);
  }

  const substationGroup = shell.group.userData.powerSubstationGroup as THREE.Group | undefined;
  if (substationGroup) {
    stationGroups.set(POWER_SUBSTATION_ID, substationGroup);
  }

  const flowVisuals = buildFlowVisuals();

  return {
    steps,
    shell,
    conveyor,
    machineGroups,
    stationGroups,
    flowVisuals,
    updateMachines: (progress, elapsedMs, flow) => {
      setCurrentFlowState(flow);
      if (progress < MACHINE_OPERATION_START_PROGRESS || !hasLineMotion(flow)) return;

      tickIntake(intake.group, progress, elapsedMs);
      tickBlankingPress(blanking.group, progress, elapsedMs);
      tickStamping(stamping.group, progress, elapsedMs);
      tickSubAssembly(subAssembly.group, progress, elapsedMs);
      tickWelding(welding.group, progress, elapsedMs);
      tickPaintBooth(paint.group, progress, elapsedMs);
      tickConveyor(conveyor.group, progress, elapsedMs);
      tickFinalAssembly(finalAssembly.group, progress, elapsedMs);
      tickPackaging(packaging.group, progress, elapsedMs);

      if (hasFlowVisualState(flow)) {
        applyFlowVisuals(flowVisuals, flow, stationGroups, elapsedMs);
      }
    },
  };
}

function revealStep(group: THREE.Group, start: number, end: number, lift?: number): RevealStep {
  if (lift !== undefined) {
    group.userData.buildFromLift = lift;
  }
  return { group, start, end };
}
