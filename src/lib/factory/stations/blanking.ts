import * as THREE from "three";
import { smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, blendProductShape, makeProduct, PRODUCT_SHAPE_CUBOID, PRODUCT_SHAPE_RECTANGLE } from "../products";
import { pressPhase } from "../stationMotion";
import type { BlankingRig } from "../types";

export function tickBlankingPress(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.blankingRig as BlankingRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.86, 0.98, progress);
  const cycle = pressPhase(elapsedMs * 0.00042);
  const stroke = cycle.stroke * live;
  const impact = cycle.impact * live;

  const ramHomeY = rig.ramAssembly.userData.homeY as number;
  const ramStroke = rig.ramAssembly.userData.stroke as number;
  rig.ramAssembly.position.y = ramHomeY - stroke * ramStroke;

  rig.hydraulics.forEach((rod, index) => {
    const homeY = rod.userData.homeY as number;
    const rodStroke = rod.userData.stroke as number;
    rod.position.y = homeY - stroke * rodStroke;
    rod.scale.y = 0.72 + stroke * 0.28 + (index % 2) * 0.02;
  });

  const dieMaterial = rig.dieGlow.material as THREE.MeshStandardMaterial;
  dieMaterial.opacity = 0.18 + impact * 0.72;
  dieMaterial.emissiveIntensity = impact * 2.4 * live;

  rig.gateGlows.forEach((gate, index) => {
    const gateMaterial = gate.material as THREE.MeshStandardMaterial;
    const flash = cycle.phase === "down" || cycle.phase === "dwell" ? 0.38 : 0.12;
    gateMaterial.opacity = (0.14 + flash + impact * 0.28) * live;
    gateMaterial.emissiveIntensity = (0.4 + impact * 1.6 + index * 0.08) * live;
  });

  const stripMaterial = rig.statusStrip.material as THREE.MeshStandardMaterial;
  stripMaterial.emissiveIntensity = (0.35 + stroke * 1.1 + impact * 1.8) * live;

  rig.beacon.scale.setScalar(0.88 + impact * 0.22);
  const beaconMaterial = rig.beacon.material as THREE.MeshStandardMaterial;
  beaconMaterial.opacity = 0.22 + impact * 0.58;
  beaconMaterial.emissiveIntensity = (0.5 + impact * 2.2) * live;

  const blankShape = blendProductShape(PRODUCT_SHAPE_RECTANGLE, PRODUCT_SHAPE_CUBOID, smoothstep(0, 1, impact));
  applyProductShape(rig.dieBlank, blankShape);
  rig.dieBlank.position.y = 0.222 + blankShape.height / 2;
  rig.dieBlank.visible = live > 0.08;
}

export function buildBlankingPress(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { blankingPressStation } = LAYOUT;
  const anchor = layoutPoint(blankingPressStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = blankingPressStation.angle;
  group.scale.setScalar(blankingPressStation.scale);

  const RAM_HOME_Y = 0.94;
  const RAM_STROKE = 0.36;

  group.add(box([2.28, 0.04, 1.52], [0, 0.034, 0], materials.machineDark, false));
  group.add(box([2.02, 0.016, 1.24], [0, 0.064, 0], materials.zone, false));
  [-0.82, 0.82].forEach((x) => {
    [-0.58, 0.58].forEach((z) => {
      group.add(cylinder(0.022, 0.026, 0.018, [x, 0.078, z], materials.steel, 10));
    });
  });
  group.add(box([1.76, 0.008, 0.04], [0, 0.078, -0.58], materials.tealGlow, false));
  group.add(box([1.76, 0.008, 0.04], [0, 0.078, 0.58], materials.tealGlow, false));

  group.add(box([1.22, 0.1, 0.96], [0, 0.13, 0.04], materials.hydraulic));
  group.add(box([1.06, 0.028, 0.72], [0, 0.2, 0.04], materials.machineLight));
  group.add(box([0.92, 0.014, 0.58], [0, 0.214, 0.04], materials.darkSteel));
  const dieGlow = box([0.34, 0.012, 0.26], [0, 0.222, 0.04], materials.safetyGlass);
  const dieGlowMat = dieGlow.material as THREE.MeshStandardMaterial;
  dieGlowMat.opacity = 0.22;
  dieGlowMat.emissiveIntensity = 0.6;
  group.add(dieGlow);
  const dieBlank = makeProduct(materials.enamel, [0, 0.222 + PRODUCT_SHAPE_RECTANGLE.height / 2, 0.04]);
  group.add(dieBlank);

  const columnPositions: [number, number][] = [
    [-0.46, 0.14],
    [0.46, 0.14],
    [-0.46, -0.22],
    [0.46, -0.22],
  ];
  columnPositions.forEach(([x, z]) => {
    group.add(cylinder(0.1, 0.12, 0.78, [x, 0.58, z], materials.machineDark, 12));
    group.add(cylinder(0.082, 0.1, 0.06, [x, 0.22, z], materials.darkSteel, 12));
    group.add(box([0.16, 0.06, 0.16], [x, 0.99, z], materials.machine));
    group.add(box([0.12, 0.014, 0.12], [x, 1.02, z], materials.tealGlow));
  });

  group.add(box([1.14, 0.16, 0.52], [0, 1.06, 0.04], materials.machineDark));
  group.add(box([1.22, 0.04, 0.58], [0, 0.99, 0.04], materials.darkSteel));
  group.add(box([0.82, 0.018, 0.08], [0, 1.14, 0.26], materials.tealGlow));
  [-0.28, 0.28].forEach((x) => {
    group.add(cylinder(0.1, 0.1, 0.14, [x, 1.0, 0.04], materials.machineLight, 16));
    group.add(cylinder(0.06, 0.06, 0.04, [x, 1.08, 0.04], materials.steel, 12));
  });

  const ramAssembly = new THREE.Group();
  ramAssembly.position.set(0, RAM_HOME_Y, 0.04);
  ramAssembly.userData.homeY = RAM_HOME_Y;
  ramAssembly.userData.stroke = RAM_STROKE;

  ramAssembly.add(box([0.88, 0.08, 0.48], [0, 0.04, 0], materials.machineLight));
  ramAssembly.add(box([0.72, 0.034, 0.36], [0, 0.1, 0], materials.darkSteel));
  ramAssembly.add(box([0.46, 0.12, 0.32], [0, -0.02, 0], materials.machine));
  ramAssembly.add(box([0.38, 0.06, 0.24], [0, -0.1, 0], materials.hydraulic));
  ramAssembly.add(box([0.28, 0.034, 0.18], [0, -0.16, 0], materials.steel));
  [-0.34, 0.34].forEach((x) => {
    ramAssembly.add(box([0.05, 0.22, 0.08], [x, 0.02, 0.14], materials.darkSteel));
  });
  group.add(ramAssembly);

  const hydraulics: THREE.Mesh[] = [];
  [-0.28, 0.28].forEach((x) => {
    const rod = cylinder(0.045, 0.052, 0.52, [x, 0.74, 0.04], materials.steel, 14);
    rod.userData.homeY = 0.74;
    rod.userData.stroke = RAM_STROKE;
    hydraulics.push(rod);
    group.add(rod);
    group.add(cylinder(0.07, 0.07, 0.08, [x, 1.0, 0.04], materials.hydraulic, 14));
  });

  [-0.52, 0.52].forEach((x) => {
    group.add(box([0.04, 0.62, 0.06], [x, 0.56, 0.32], materials.darkSteel));
    group.add(box([0.028, 0.52, 0.012], [x, 0.56, 0.36], materials.tealGlow));
  });

  const gateGlows: THREE.Mesh[] = [];
  [-0.62, 0.62].forEach((x) => {
    group.add(box([0.05, 0.72, 0.05], [x, 0.52, 0.38], materials.machineDark));
    group.add(box([0.034, 0.58, 0.034], [x, 0.52, 0.38], materials.darkSteel));
    const gate = box([0.018, 0.48, 0.02], [x, 0.5, 0.42], materials.safetyGlass);
    const gateMat = gate.material as THREE.MeshStandardMaterial;
    gateMat.opacity = 0.18;
    gateMat.emissiveIntensity = 0.45;
    gateGlows.push(gate);
    group.add(gate);
  });
  group.add(box([1.18, 0.026, 0.035], [0, 0.78, 0.44], materials.darkSteel));
  group.add(box([1.12, 0.012, 0.022], [0, 0.78, 0.445], materials.safetyGlass));

  group.add(box([0.42, 0.58, 0.38], [0.92, 0.34, -0.28], materials.machineDark));
  group.add(box([0.36, 0.12, 0.32], [0.92, 0.68, -0.28], materials.machineLight));
  group.add(cylinder(0.1, 0.1, 0.34, [0.92, 0.48, -0.28], materials.hydraulic, 16));
  group.add(cylinder(0.028, 0.028, 0.62, [0.68, 0.72, -0.08], materials.steel, 10));
  group.add(cylinder(0.028, 0.028, 0.62, [0.68, 0.72, 0.16], materials.steel, 10));
  group.add(box([0.14, 0.08, 0.14], [0.78, 0.18, -0.02], materials.orange));

  group.add(box([0.38, 0.72, 0.34], [-0.92, 0.4, -0.22], materials.machineDark));
  group.add(box([0.3, 0.22, 0.02], [-0.92, 0.58, -0.04], materials.glass));
  group.add(box([0.24, 0.016, 0.02], [-0.92, 0.42, -0.04], materials.tealGlow));
  group.add(box([0.18, 0.012, 0.1], [-0.92, 0.28, -0.04], materials.warning));
  group.add(cylinder(0.018, 0.018, 0.018, [-0.92, 0.78, 0.02], materials.redLight, 10));
  group.add(cylinder(0.018, 0.018, 0.018, [-0.92, 0.78, -0.06], materials.paintGreen, 10));

  group.add(box([0.56, 0.014, 0.18], [1.04, 0.1, 0.04], materials.belt, false));
  group.add(box([0.44, 0.014, 0.18], [-1.0, 0.1, 0.04], materials.belt, false));
  group.add(box([0.38, 0.008, 0.04], [1.04, 0.118, 0.04], materials.tealGlow, false));
  group.add(box([0.38, 0.008, 0.04], [-1.0, 0.118, 0.04], materials.tealGlow, false));

  const statusStrip = box([0.64, 0.012, 0.04], [0, 1.15, 0.28], materials.tealGlow);
  const statusStripMat = statusStrip.material as THREE.MeshStandardMaterial;
  statusStripMat.emissiveIntensity = 0.35;
  group.add(statusStrip);

  const beacon = cylinder(0.09, 0.09, 0.014, [0.08, 0.16, -0.62], materials.safetyGlass, 16);
  const beaconMat = beacon.material as THREE.MeshStandardMaterial;
  beaconMat.opacity = 0.28;
  beaconMat.emissiveIntensity = 0.5;
  group.add(beacon);

  group.userData.blankingRig = {
    ramAssembly,
    hydraulics,
    dieGlow,
    dieBlank,
    gateGlows,
    beacon,
    statusStrip,
  } satisfies BlankingRig;

  return group;
}
