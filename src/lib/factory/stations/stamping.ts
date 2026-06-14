import * as THREE from "three";
import { lerp, smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, blendProductShape, makeProduct, PRODUCT_SHAPE_CUBE, PRODUCT_SHAPE_CUBOID } from "../products";
import { stampingPhase } from "../stationMotion";
import type { StampingRig } from "../types";
import { machineLiveMultiplier } from "../flowOptimization";
import { stationAnimationTime, stationBaseLive } from "../flowAnimation";

export function tickStamping(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.stampingRig as StampingRig | undefined;
  if (!rig) return;

  const baseLive = stationBaseLive(progress, "stamping");
  const live = machineLiveMultiplier(baseLive, "stamping");
  const animMs = stationAnimationTime(group, elapsedMs, "stamping", baseLive);
  const cycle = stampingPhase(animMs * 0.00072);
  const stroke = cycle.stroke * live;
  const impact = cycle.impact * live;

  const ramHomeY = rig.ramAssembly.userData.homeY as number;
  const ramStroke = rig.ramAssembly.userData.stroke as number;
  rig.ramAssembly.position.y = ramHomeY - stroke * ramStroke;

  rig.hydraulics.forEach((rod, index) => {
    const homeY = rod.userData.homeY as number;
    const rodStroke = rod.userData.stroke as number;
    rod.position.y = homeY - stroke * rodStroke;
    rod.scale.y = 0.7 + stroke * 0.3 + (index % 2) * 0.015;
  });

  const feedHomeX = rig.feedStrip.userData.homeX as number;
  const feedPitch = rig.feedStrip.userData.pitch as number;
  const feedCycle = Math.floor(animMs * 0.00072);
  rig.feedStrip.position.x = feedHomeX + cycle.pitch * feedPitch + (feedCycle % 4) * feedPitch * 0.02;

  rig.knockOut.position.y = lerp(
    rig.knockOut.userData.homeY as number,
    (rig.knockOut.userData.homeY as number) - 0.06,
    cycle.knockout * live
  );

  const dieMat = rig.dieGlow.material as THREE.MeshStandardMaterial;
  dieMat.opacity = (0.12 + impact * 0.72) * live;
  dieMat.emissiveIntensity = impact * 2.9 * live;

  const sideMat = rig.sideGlow.material as THREE.MeshStandardMaterial;
  sideMat.opacity = (0.1 + stroke * 0.24 + impact * 0.36) * live;
  sideMat.emissiveIntensity = (0.28 + impact * 1.5) * live;

  const guardMat = rig.guardGlow.material as THREE.MeshStandardMaterial;
  guardMat.opacity = (0.08 + (cycle.phase === "down" ? 0.3 : 0.1) + impact * 0.2) * live;
  guardMat.emissiveIntensity = (0.22 + impact * 1.3) * live;

  rig.feedPulse.scale.setScalar(0.88 + cycle.pitch * 0.18 + stroke * 0.08);
  const feedMat = rig.feedPulse.material as THREE.MeshStandardMaterial;
  feedMat.opacity = (0.12 + (1 - stroke) * 0.32 + cycle.pitch * 0.28) * live;
  feedMat.emissiveIntensity = (0.2 + cycle.pitch * 1.1) * live;

  rig.stationMarkers.forEach((marker, index) => {
    const markerMat = marker.material as THREE.MeshStandardMaterial;
    const active = index === cycle.stationIndex;
    const trail = index === (cycle.stationIndex + 5) % 6;
    const glow = active ? cycle.stationGlow : trail ? cycle.stationGlow * 0.35 : 0;
    markerMat.opacity = (0.22 + glow * 0.62) * live;
    markerMat.emissiveIntensity = (0.25 + glow * 1.8) * live;
    marker.scale.setScalar(0.85 + glow * 0.28);
  });

  const stripMat = rig.statusStrip.material as THREE.MeshStandardMaterial;
  stripMat.emissiveIntensity = (0.28 + stroke * 0.95 + impact * 1.7) * live;

  rig.beacon.scale.setScalar(0.88 + impact * 0.2);
  const beaconMat = rig.beacon.material as THREE.MeshStandardMaterial;
  beaconMat.opacity = (0.22 + impact * 0.58) * live;
  beaconMat.emissiveIntensity = (0.4 + impact * 2.1) * live;
  beaconMat.emissive.setHex(cycle.phase === "down" || cycle.phase === "dwell" ? 0xf59e0b : 0x22c55e);

  rig.impactLight.intensity = (0.08 + impact * 2.6) * live;

  const partShape = blendProductShape(PRODUCT_SHAPE_CUBOID, PRODUCT_SHAPE_CUBE, smoothstep(0, 1, impact));
  applyProductShape(rig.stampedPart, partShape);
  const partBaseY = 0.24 + partShape.height / 2;
  rig.stampedPart.position.y = partBaseY + cycle.knockout * 0.05;
  rig.stampedPart.position.z = 0.02 + cycle.knockout * 0.04;
  rig.stampedPart.visible = live > 0.05 && (stroke > 0.06 || cycle.knockout > 0.02);
  rig.stampedPart.scale.setScalar(0.9 + impact * 0.1);
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

  const feedStrip = new THREE.Group();
  feedStrip.userData.homeX = -0.58;
  feedStrip.userData.pitch = 0.18;
  feedStrip.position.set(-0.58, 0.216, 0.02);
  feedStrip.add(box([0.78, 0.005, 0.28], [0.39, 0, 0], materials.steel, false));
  for (let i = 0; i < 5; i += 1) {
    feedStrip.add(box([0.004, 0.003, 0.24], [0.12 + i * 0.14, 0.004, 0], materials.darkSteel, false));
  }
  group.add(feedStrip);

  const stationMarkers: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i += 1) {
    const marker = cylinder(0.014, 0.014, 0.012, [0.64, 0.2, 0.1], materials.tealGlow, 10);
    marker.position.set(-0.38 + i * 0.14, 0.92, -0.16);
    const markerMat = marker.material as THREE.MeshStandardMaterial;
    markerMat.transparent = true;
    markerMat.opacity = 0.28;
    markerMat.emissiveIntensity = 0.3;
    stationMarkers.push(marker);
    group.add(marker);
  }

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

  const knockOut = new THREE.Group();
  knockOut.userData.homeY = 0.78;
  knockOut.position.set(0, 0.78, 0.02);
  knockOut.add(cylinder(0.022, 0.022, 0.08, [0, -0.04, 0], materials.steel, 10));
  knockOut.add(box([0.06, 0.04, 0.06], [0, -0.08, 0], materials.machineLight));
  group.add(knockOut);

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

  const hydraulics: THREE.Mesh[] = [];
  [-0.22, 0.22].forEach((x) => {
    const rod = cylinder(0.038, 0.044, 0.38, [x, 0.62, 0.02], materials.steel, 12);
    rod.userData.homeY = 0.62;
    rod.userData.stroke = RAM_STROKE;
    hydraulics.push(rod);
    group.add(rod);
    group.add(cylinder(0.058, 0.058, 0.06, [x, 0.84, 0.02], materials.hydraulic, 12));
  });

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

  const statusStrip = box([0.48, 0.01, 0.032], [0, 1.08, -0.14], materials.tealGlow);
  const statusStripMat = statusStrip.material as THREE.MeshStandardMaterial;
  statusStripMat.emissiveIntensity = 0.32;
  group.add(statusStrip);

  const beacon = cylinder(0.072, 0.072, 0.012, [0.42, 0.14, -0.48], materials.safetyGlass, 14);
  const beaconMat = beacon.material as THREE.MeshStandardMaterial;
  beaconMat.opacity = 0.26;
  beaconMat.emissiveIntensity = 0.45;
  group.add(beacon);

  const impactLight = new THREE.PointLight(0xffa31a, 0, 2);
  impactLight.position.set(0, 0.3, 0.02);
  group.add(impactLight);

  group.userData.stampingRig = {
    ramAssembly,
    hydraulics,
    feedStrip,
    stationMarkers,
    knockOut,
    dieGlow,
    stampedPart,
    sideGlow,
    guardGlow,
    feedPulse,
    beacon,
    statusStrip,
    impactLight,
  } satisfies StampingRig;

  return group;
}
