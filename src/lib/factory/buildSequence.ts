import * as THREE from "three";
import type { Materials } from "./materials";
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
import type { RevealStep } from "./types";

export type FactoryBuild = {
  steps: RevealStep[];
  shell: RevealStep;
  updateMachines: (progress: number, elapsedMs: number) => void;
};

export function makeBuildSequence(materials: Materials): FactoryBuild {
  const floor = revealStep(buildFloor(materials), 0, 0.15);
  const shell = revealStep(buildShell(materials), 0.1, 0.25);
  const conveyor = revealStep(buildConveyor(materials), 0.25, 0.5);
  const intake = revealStep(buildIntake(materials), 0.5, 0.6);
  const blanking = revealStep(buildBlankingPress(materials), 0.54, 0.64);
  const stamping = revealStep(buildStamping(materials), 0.58, 0.68);
  const subAssembly = revealStep(buildSubAssembly(materials), 0.62, 0.72);
  const welding = revealStep(buildWelding(materials), 0.66, 0.76);
  const paint = revealStep(buildPaintBooth(materials), 0.7, 0.8);
  const finalAssembly = revealStep(buildFinalAssembly(materials), 0.74, 0.84);
  const packaging = revealStep(buildPackaging(materials), 0.78, 0.85);
  const steps = [
    floor,
    shell,
    conveyor,
    intake,
    blanking,
    stamping,
    subAssembly,
    welding,
    paint,
    finalAssembly,
    packaging,
  ];

  return {
    steps,
    shell,
    updateMachines: (progress, elapsedMs) => {
      tickConveyor(conveyor.group, progress, elapsedMs);
      tickIntake(intake.group, progress, elapsedMs);
      tickBlankingPress(blanking.group, progress, elapsedMs);
      tickStamping(stamping.group, progress, elapsedMs);
      tickSubAssembly(subAssembly.group, progress, elapsedMs);
      tickWelding(welding.group, progress, elapsedMs);
      tickPaintBooth(paint.group, progress, elapsedMs);
      tickFinalAssembly(finalAssembly.group, progress, elapsedMs);
      tickPackaging(packaging.group, progress, elapsedMs);
    },
  };
}

function revealStep(group: THREE.Group, start: number, end: number): RevealStep {
  return { group, start, end };
}
