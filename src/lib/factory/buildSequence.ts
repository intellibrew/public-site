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

export function makeBuildSequence(materials: Materials): FactoryBuild {
  const floor = revealStep(buildFloor(materials), 0, 0.12);
  const shell = revealStep(buildShell(materials), 0.06, 0.2);
  const intake = revealStep(buildIntake(materials), 0.2, 0.28);
  const blanking = revealStep(buildBlankingPress(materials), 0.24, 0.32);
  const stamping = revealStep(buildStamping(materials), 0.28, 0.36);
  const subAssembly = revealStep(buildSubAssembly(materials), 0.32, 0.4);
  const welding = revealStep(buildWelding(materials), 0.36, 0.44);
  const paint = revealStep(buildPaintBooth(materials), 0.4, 0.48);
  const finalAssembly = revealStep(buildFinalAssembly(materials), 0.44, 0.54);
  const packaging = revealStep(buildPackaging(materials), 0.48, 0.58);
  const conveyor = revealStep(buildConveyor(materials), 0.62, 0.78);
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
      tickConveyor(conveyor.group, progress, elapsedMs);
      tickIntake(intake.group, progress, elapsedMs);
      tickBlankingPress(blanking.group, progress, elapsedMs);
      tickStamping(stamping.group, progress, elapsedMs);
      tickSubAssembly(subAssembly.group, progress, elapsedMs);
      tickWelding(welding.group, progress, elapsedMs);
      tickPaintBooth(paint.group, progress, elapsedMs);
      tickFinalAssembly(finalAssembly.group, progress, elapsedMs);
      tickPackaging(packaging.group, progress, elapsedMs);
      applyFlowVisuals(flowVisuals, flow, stationGroups, elapsedMs);
    },
  };
}

function revealStep(group: THREE.Group, start: number, end: number): RevealStep {
  return { group, start, end };
}
