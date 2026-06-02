import * as THREE from "three";
import { smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, blendProductShape, makeProduct, PRODUCT_SHAPE_CUBE, PRODUCT_SHAPE_CUBOID } from "../products";
import { pressPhase } from "../stationMotion";
import type { StampingRig } from "../types";
import { machineLiveMultiplier } from "../flowOptimization";
import { stationAnimationTime } from "../flowAnimation";

export function tickStamping(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.stampingRig as StampingRig | undefined;
  if (!rig) return;

  const baseLive = smoothstep(0.78, 0.95, progress);
  const live = machineLiveMultiplier(baseLive, "stamping");
  const animMs = stationAnimationTime(group, elapsedMs, "stamping", baseLive);
  const cycle = pressPhase(animMs * 0.00078);
  const stroke = cycle.stroke * live;
  const impact = cycle.impact * live;

  const ramHomeY = rig.ramAssembly.userData.homeY as number;
  const ramStroke = rig.ramAssembly.userData.stroke as number;
  rig.ramAssembly.position.y = ramHomeY - stroke * ramStroke;

  const dieMat = rig.dieGlow.material as THREE.MeshStandardMaterial;
  dieMat.opacity = 0.16 + impact * 0.68;
  dieMat.emissiveIntensity = impact * 2.8 * live;

  const sideMat = rig.sideGlow.material as THREE.MeshStandardMaterial;
  sideMat.opacity = 0.12 + stroke * 0.22 + impact * 0.34;
  sideMat.emissiveIntensity = (0.3 + impact * 1.4) * live;

  const guardMat = rig.guardGlow.material as THREE.MeshStandardMaterial;
  guardMat.opacity = 0.1 + (cycle.phase === "down" ? 0.28 : 0.08) * live;
  guardMat.emissiveIntensity = (0.25 + impact * 1.2) * live;

  rig.feedPulse.scale.setScalar(0.92 + stroke * 0.14);
  const feedMat = rig.feedPulse.material as THREE.MeshStandardMaterial;
  feedMat.opacity = 0.14 + (1 - stroke) * 0.28 * live;

  const partShape = blendProductShape(PRODUCT_SHAPE_CUBOID, PRODUCT_SHAPE_CUBE, smoothstep(0, 1, impact));
  applyProductShape(rig.stampedPart, partShape);
  rig.stampedPart.position.y = 0.24 + partShape.height / 2;
  rig.stampedPart.visible = live > 0.08;
}

export function buildStamping(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { stampingCellStation } = LAYOUT;
  const anchor = layoutPoint(stampingCellStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = stampingCellStation.angle;
  group.scale.setScalar(stampingCellStation.scale);

  const RAM_HOME_Y = 0.78;
  const RAM_STROKE = 0.22;

  group.add(box([1.62, 0.032, 1.08], [0, 0.032, 0], materials.machineDark, false));
  group.add(box([1.38, 0.014, 0.82], [0, 0.056, 0], materials.zone, false));
  group.add(box([0.42, 0.01, 0.04], [-0.72, 0.068, 0.38], materials.tealGlow, false));
  group.add(box([0.42, 0.01, 0.04], [0.72, 0.068, 0.38], materials.tealGlow, false));

  group.add(box([0.78, 0.11, 0.66], [0, 0.12, -0.06], materials.hydraulic));
  group.add(box([0.64, 0.024, 0.48], [0, 0.19, -0.06], materials.machineLight));
  group.add(box([0.18, 0.58, 0.24], [-0.34, 0.46, 0.02], materials.machineDark));
  group.add(box([0.18, 0.58, 0.24], [0.34, 0.46, 0.02], materials.machineDark));
  group.add(box([0.14, 0.48, 0.18], [-0.34, 0.42, 0.14], materials.darkSteel));
  group.add(box([0.14, 0.48, 0.18], [0.34, 0.42, 0.14], materials.darkSteel));
  group.add(box([0.08, 0.52, 0.08], [-0.34, 0.2, 0.14], materials.machine));
  group.add(box([0.08, 0.52, 0.08], [0.34, 0.2, 0.14], materials.machine));
  group.add(box([0.74, 0.14, 0.28], [0, 0.76, 0.02], materials.machineDark));
  group.add(box([0.82, 0.038, 0.32], [0, 0.69, 0.02], materials.darkSteel));
  group.add(box([0.56, 0.018, 0.06], [0, 0.74, 0.18], materials.tealGlow));

  group.add(box([0.52, 0.22, 0.34], [0, 0.9, -0.18], materials.machineDark));
  group.add(box([0.44, 0.08, 0.26], [0, 1.02, -0.18], materials.machineLight));
  group.add(box([0.38, 0.014, 0.05], [0, 1.06, -0.18], materials.tealGlow));

  group.add(box([0.58, 0.34, 0.1], [0, 0.42, -0.32], materials.machineDark));
  group.add(box([0.48, 0.014, 0.05], [0, 0.58, -0.28], materials.tealGlow));
  group.add(box([0.24, 0.38, 0.28], [0.64, 0.24, -0.04], materials.machineDark));
  group.add(box([0.18, 0.14, 0.02], [0.64, 0.32, 0.1], materials.glass));
  const sideGlow = box([0.16, 0.014, 0.02], [0.64, 0.2, 0.1], materials.safetyGlass);
  const sideGlowMat = sideGlow.material as THREE.MeshStandardMaterial;
  sideGlowMat.opacity = 0.16;
  sideGlowMat.emissiveIntensity = 0.35;
  group.add(sideGlow);

  group.add(box([0.44, 0.06, 0.32], [0, 0.2, 0.02], materials.hydraulic));
  group.add(box([0.52, 0.022, 0.36], [0, 0.244, 0.02], materials.machineDark));
  const dieGlow = box([0.24, 0.01, 0.14], [0, 0.24, 0.02], materials.safetyGlass);
  const dieGlowMat = dieGlow.material as THREE.MeshStandardMaterial;
  dieGlowMat.opacity = 0.18;
  dieGlowMat.emissiveIntensity = 0.55;
  group.add(dieGlow);
  const stampedPart = makeProduct(materials.enamel, [0, 0.24 + PRODUCT_SHAPE_CUBOID.height / 2, 0.02]);
  applyProductShape(stampedPart, PRODUCT_SHAPE_CUBOID);
  group.add(stampedPart);

  const ramAssembly = new THREE.Group();
  ramAssembly.position.set(0, RAM_HOME_Y, 0.02);
  ramAssembly.userData.homeY = RAM_HOME_Y;
  ramAssembly.userData.stroke = RAM_STROKE;

  ramAssembly.add(box([0.52, 0.06, 0.28], [0, 0.04, 0], materials.machineLight));
  ramAssembly.add(box([0.38, 0.034, 0.2], [0, -0.02, 0], materials.darkSteel));
  ramAssembly.add(cylinder(0.05, 0.045, 0.12, [0, -0.08, 0], materials.steel, 16));
  ramAssembly.add(box([0.18, 0.08, 0.14], [0, -0.16, 0], materials.machine));
  ramAssembly.add(box([0.12, 0.04, 0.1], [0, -0.22, 0], materials.hydraulic));
  ramAssembly.add(box([0.08, 0.022, 0.06], [0, -0.27, 0], materials.steel));
  [-0.22, 0.22].forEach((x) => {
    ramAssembly.add(box([0.034, 0.18, 0.05], [x, 0.02, 0.1], materials.machineDark));
  });
  group.add(ramAssembly);

  const guardGlow = box([0.46, 0.28, 0.018], [0, 0.34, 0.22], materials.safetyGlass);
  const guardGlowMat = guardGlow.material as THREE.MeshStandardMaterial;
  guardGlowMat.opacity = 0.14;
  guardGlowMat.emissiveIntensity = 0.3;
  group.add(guardGlow);
  group.add(box([0.52, 0.026, 0.032], [0, 0.48, 0.23], materials.darkSteel));
  group.add(box([0.52, 0.026, 0.032], [0, 0.2, 0.23], materials.darkSteel));
  group.add(box([0.026, 0.3, 0.032], [-0.24, 0.34, 0.23], materials.darkSteel));
  group.add(box([0.026, 0.3, 0.032], [0.24, 0.34, 0.23], materials.darkSteel));

  group.add(box([0.52, 0.04, 0.08], [0, 0.26, 0.34], materials.darkSteel));
  group.add(box([0.44, 0.012, 0.04], [0, 0.29, 0.34], materials.machineLight));
  const feedPulse = box([0.12, 0.018, 0.06], [0.18, 0.3, 0.34], materials.tealGlow);
  const feedPulseMat = feedPulse.material as THREE.MeshStandardMaterial;
  feedPulseMat.opacity = 0.22;
  feedPulseMat.transparent = true;
  group.add(feedPulse);

  group.add(box([0.4, 0.012, 0.16], [-0.82, 0.088, 0.02], materials.belt, false));
  group.add(box([0.4, 0.012, 0.16], [0.82, 0.088, 0.02], materials.belt, false));

  group.userData.stampingRig = {
    ramAssembly,
    dieGlow,
    stampedPart,
    sideGlow,
    guardGlow,
    feedPulse,
  } satisfies StampingRig;

  return group;
}
