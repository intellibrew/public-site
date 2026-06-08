import * as THREE from "three";
import { clamp, lerp } from "../math";
import { box, cylinder, sphere } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import type { WeldingRig } from "../types";
import { machineLiveMultiplier } from "../flowOptimization";
import { stationAnimationTime, stationBaseLive } from "../flowAnimation";
import { weldingPhase } from "../stationMotion";

export function tickWelding(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.weldingRig as WeldingRig | undefined;
  if (!rig) return;

  const baseLive = stationBaseLive(progress, "welding");
  const live = machineLiveMultiplier(baseLive, "welding");
  const animMs = stationAnimationTime(group, elapsedMs, "welding", baseLive);
  const cycle = weldingPhase(animMs * 0.00058);

  const seamStart = -0.06;
  const seamEnd = 0.3;
  const seamX = lerp(seamStart, seamEnd, cycle.travel);
  const arcActive = live * cycle.arc;

  const flickerRaw =
    Math.sin(animMs * 0.031) * 0.42 +
    Math.sin(animMs * 0.053 + 0.7) * 0.28 +
    Math.sin(animMs * 0.079 + 1.4) * 0.18 +
    Math.sin(animMs * 0.017 + 0.3) * 0.12;
  const flicker = clamp((flickerRaw + 1) * 0.5);
  const arcPulse = arcActive * (0.55 + flicker * 0.45);

  rig.torchCarriage.position.x = seamX;

  const standoff = 0.012 + flicker * 0.008;
  rig.needle.position.y = -standoff * arcActive;

  rig.weldArc.scale.set(0.85 + flicker * 0.55 * arcPulse, 0.35 + flicker * 0.95 * arcPulse, 0.85 + flicker * 0.55 * arcPulse);
  rig.sparkCore.scale.setScalar(0.25 + flicker * 1.35 * arcPulse);
  rig.sparkHalo.scale.setScalar(0.3 + flicker * 1.65 * arcPulse);

  const sparkCoreMat = rig.sparkCore.material as THREE.MeshStandardMaterial;
  sparkCoreMat.opacity = (0.22 + flicker * 0.72) * arcPulse;
  sparkCoreMat.emissiveIntensity = (1.4 + flicker * 3.2) * arcPulse;

  const arcMat = rig.weldArc.material as THREE.MeshStandardMaterial;
  arcMat.opacity = (0.38 + flicker * 0.52) * arcPulse;
  arcMat.emissiveIntensity = (1.8 + flicker * 3.4) * arcPulse;

  const sparkHaloMat = rig.sparkHalo.material as THREE.MeshStandardMaterial;
  sparkHaloMat.opacity = (0.12 + flicker * 0.42) * arcPulse;
  sparkHaloMat.emissiveIntensity = (0.8 + flicker * 1.6) * arcPulse;

  rig.sparkFlecks.forEach((fleck, index) => {
    const burstSeed = index * 0.73 + 0.19;
    const burstT = ((animMs * 0.0018 + burstSeed) % 1) * arcActive;
    const angle = index * 0.92 + Math.sin(index * 1.7) * 0.4;
    const speed = 0.09 + (index % 4) * 0.028;
    fleck.position.set(
      Math.cos(angle) * burstT * speed,
      0.018 + burstT * (0.05 + (index % 3) * 0.016) - burstT * burstT * 0.035,
      Math.sin(angle) * burstT * speed
    );
    fleck.scale.setScalar((0.15 + (1 - burstT) * 0.85) * arcPulse);
    const fleckMat = fleck.material as THREE.MeshStandardMaterial;
    fleckMat.opacity = (1 - burstT) * (0.12 + flicker * 0.78) * arcPulse;
    fleckMat.emissiveIntensity = (0.8 + flicker * 2.1) * (1 - burstT * 0.6) * arcPulse;
  });

  const trailWidth = Math.max(0.08, seamX - seamStart + 0.04);
  rig.seamGlow.position.x = seamStart + trailWidth * 0.5 - 0.02;
  rig.seamGlow.scale.x = trailWidth / 0.34;
  const seamMat = rig.seamGlow.material as THREE.MeshStandardMaterial;
  seamMat.opacity = 0.1 + (0.28 + flicker * 0.52) * arcPulse;
  seamMat.emissiveIntensity = 0.18 + (1.1 + flicker * 2.2) * arcPulse;

  rig.sparkLight.intensity = (0.65 + flicker * 3.4) * arcPulse;
  rig.sparkLight.position.y = 0.39 + flicker * 0.02 * arcActive;

  const beaconMat = rig.statusBeacon.material as THREE.MeshStandardMaterial;
  const weldingHue = arcActive > 0.08;
  beaconMat.emissive.setHex(weldingHue ? 0xf59e0b : 0x22c55e);
  beaconMat.opacity = 0.34 + (weldingHue ? flicker * 0.42 : 0.18) * live;
  beaconMat.emissiveIntensity = (weldingHue ? 0.9 + flicker * 1.4 : 0.45) * live;

  rig.windowGlows.forEach((panel, index) => {
    const panelMat = panel.material as THREE.MeshStandardMaterial;
    panelMat.opacity = (0.08 + arcPulse * (0.16 + flicker * 0.22)) * (index === 0 ? 1 : 0.92);
    panelMat.emissiveIntensity = arcPulse * (0.35 + flicker * 0.85);
  });

  rig.smokeWisps.forEach((wisp, index) => {
    const drift = ((animMs * 0.00042 + index * 0.31) % 1) * arcActive;
    wisp.position.y = 0.04 + drift * 0.22;
    wisp.position.x = (index - 1) * 0.04 * drift;
    wisp.scale.setScalar(0.35 + drift * 0.75);
    const wispMat = wisp.material as THREE.MeshStandardMaterial;
    wispMat.opacity = (1 - drift) * 0.16 * arcPulse;
  });
}

export function buildWelding(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { weldingStation } = LAYOUT;
  const anchor = layoutPoint(weldingStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = weldingStation.angle;
  group.scale.setScalar(weldingStation.scale);

  const seamY = 0.333;
  const seamZ = 0.18;
  const seamCenterX = 0.12;

  group.add(box([2.32, 0.04, 1.56], [0, 0.034, 0], materials.machineDark, false));
  group.add(box([2.05, 0.014, 1.28], [0, 0.064, 0], materials.zone, false));
  [-0.88, 0.88].forEach((x) => {
    [-0.58, 0.58].forEach((z) => {
      group.add(cylinder(0.02, 0.024, 0.016, [x, 0.076, z], materials.steel, 10));
    });
  });
  group.add(box([1.72, 0.008, 0.036], [0, 0.078, -0.58], materials.tealGlow, false));
  group.add(box([1.72, 0.008, 0.036], [0, 0.078, 0.58], materials.tealGlow, false));

  const boothPosts: [number, number][] = [
    [-0.52, -0.3],
    [0.68, -0.3],
    [-0.52, 0.3],
    [0.68, 0.3],
  ];
  boothPosts.forEach(([x, z]) => {
    group.add(box([0.08, 0.72, 0.08], [x, 0.46, z], materials.machineDark));
    group.add(box([0.06, 0.04, 0.06], [x, 0.82, z], materials.darkSteel));
  });
  group.add(box([1.28, 0.1, 0.64], [0.08, 0.18, 0], materials.machineDark));
  group.add(box([1.28, 0.08, 0.64], [0.08, 0.82, 0], materials.machineDark));
  group.add(box([1.28, 0.64, 0.08], [0.08, 0.5, -0.34], materials.machine));
  group.add(box([0.92, 0.09, 0.22], [0.08, 0.18, 0.24], materials.machineDark));

  group.add(box([0.34, 0.05, 0.14], [0.08, 0.9, -0.08], materials.machine));
  group.add(box([0.62, 0.04, 0.06], [0.08, 0.86, -0.22], materials.darkSteel));

  const windowGlows: THREE.Mesh[] = [];
  [-0.19, 0.35].forEach((x) => {
    const pane = box([0.5, 0.48, 0.016], [x, 0.51, 0.41], materials.safetyGlass, false);
    const paneMat = pane.material as THREE.MeshStandardMaterial;
    paneMat.opacity = 0.2;
    paneMat.emissive.setHex(0xffa31a);
    windowGlows.push(pane);
    group.add(pane);
  });
  group.add(box([0.04, 0.5, 0.022], [0.08, 0.51, 0.41], materials.machineDark));
  group.add(box([1.12, 0.026, 0.035], [0.08, 0.78, 0.43], materials.darkSteel));

  group.add(box([0.86, 0.06, 0.34], [seamCenterX, 0.84, seamZ - 0.02], materials.machineDark));
  group.add(box([0.22, 0.28, 0.22], [seamCenterX, 0.98, seamZ - 0.02], materials.darkSteel));
  group.add(cylinder(0.06, 0.06, 0.14, [seamCenterX, 1.08, seamZ - 0.02], materials.steel, 12));

  group.add(box([0.5, 0.68, 0.58], [-0.92, 0.38, 0.18], materials.machineDark));
  group.add(box([0.44, 0.06, 0.5], [-0.92, 0.74, 0.18], materials.machineLight));
  group.add(box([0.38, 0.42, 0.04], [-0.92, 0.48, 0.48], materials.hydraulic));
  for (let row = 0; row < 4; row += 1) {
    group.add(box([0.32, 0.012, 0.018], [-0.92, 0.28 + row * 0.1, 0.49], materials.darkSteel));
  }
  group.add(cylinder(0.13, 0.13, 0.028, [-0.92, 0.78, 0.18], materials.darkSteel, 18));
  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI;
    group.add(box([0.1, 0.012, 0.018], [-0.92 + Math.cos(angle) * 0.04, 0.78, 0.18 + Math.sin(angle) * 0.04], materials.steel));
  }
  group.add(cylinder(0.028, 0.028, 0.72, [-0.62, 0.62, 0.18], materials.steel, 10));
  group.add(box([0.14, 0.08, 0.12], [-0.72, 0.16, 0.18], materials.orange));

  group.add(box([0.34, 0.62, 0.3], [-0.58, 0.35, 0.46], materials.machineDark));
  group.add(box([0.26, 0.18, 0.02], [-0.58, 0.56, 0.62], materials.glass));
  group.add(box([0.2, 0.014, 0.02], [-0.58, 0.4, 0.62], materials.tealGlow));
  group.add(cylinder(0.016, 0.016, 0.016, [-0.58, 0.7, 0.56], materials.redLight, 10));
  group.add(cylinder(0.016, 0.016, 0.016, [-0.58, 0.7, 0.48], materials.paintGreen, 10));

  group.add(box([0.82, 0.05, 0.1], [seamCenterX, 0.76, seamZ], materials.darkSteel));
  group.add(box([0.06, 0.12, 0.06], [seamCenterX, 0.7, seamZ], materials.machineLight));

  group.add(box([0.62, 0.08, 0.46], [seamCenterX, 0.25, seamZ], materials.hydraulic));
  group.add(box([0.48, 0.028, 0.28], [seamCenterX, 0.31, seamZ], materials.machineLight));
  group.add(box([0.38, 0.018, 0.22], [seamCenterX, 0.328, seamZ], materials.steel));
  [-0.18, 0.18].forEach((x) => {
    group.add(box([0.06, 0.1, 0.08], [seamCenterX + x, 0.36, seamZ + 0.14], materials.darkSteel));
    group.add(box([0.04, 0.04, 0.04], [seamCenterX + x, 0.42, seamZ + 0.14], materials.steel));
  });

  const seamGlow = box([0.34, 0.012, 0.055], [seamCenterX, seamY, seamZ], materials.warning);
  const seamGlowMat = seamGlow.material as THREE.MeshStandardMaterial;
  seamGlowMat.transparent = true;
  seamGlowMat.opacity = 0.48;
  seamGlowMat.emissive.setHex(0xff9f1c);
  seamGlowMat.emissiveIntensity = 1.1;
  group.add(seamGlow);

  const torchCarriage = new THREE.Group();
  torchCarriage.position.set(seamCenterX, 0, seamZ);

  const needle = new THREE.Group();
  needle.add(cylinder(0.016, 0.013, 0.34, [0, 0.57, 0], materials.steel, 14));
  needle.add(cylinder(0.012, 0.004, 0.09, [0, 0.36, 0], materials.machineLight, 14));
  needle.add(box([0.08, 0.05, 0.08], [0, 0.74, 0], materials.machine));
  needle.add(box([0.04, 0.04, 0.04], [0, 0.78, 0], materials.tealGlow));
  torchCarriage.add(needle);

  const weldArc = cylinder(0.012, 0.006, 0.058, [0, seamY + 0.018, 0], materials.warning, 10);
  const weldArcMat = weldArc.material as THREE.MeshStandardMaterial;
  weldArcMat.transparent = true;
  weldArcMat.opacity = 0.82;
  weldArcMat.emissive.setHex(0xffffff);
  weldArcMat.emissiveIntensity = 2.6;
  torchCarriage.add(weldArc);

  const sparkCore = sphere(0.038, [0, seamY + 0.012, 0], materials.warning, 16);
  const sparkCoreMat = sparkCore.material as THREE.MeshStandardMaterial;
  sparkCoreMat.transparent = true;
  sparkCoreMat.opacity = 0.88;
  sparkCoreMat.emissive.setHex(0xffffff);
  sparkCoreMat.emissiveIntensity = 2.4;
  torchCarriage.add(sparkCore);

  const sparkHalo = sphere(0.085, [0, seamY + 0.012, 0], materials.safetyGlass, 16);
  const sparkHaloMat = sparkHalo.material as THREE.MeshStandardMaterial;
  sparkHaloMat.opacity = 0.32;
  sparkHaloMat.emissive.setHex(0xffa31a);
  sparkHaloMat.emissiveIntensity = 1.2;
  torchCarriage.add(sparkHalo);

  const sparkFlecks: THREE.Mesh[] = [];
  for (let i = 0; i < 14; i += 1) {
    const fleck = sphere(0.007 + (i % 3) * 0.003, [0, seamY + 0.02, 0], materials.warning, 8);
    const fleckMat = fleck.material as THREE.MeshStandardMaterial;
    fleckMat.transparent = true;
    fleckMat.opacity = 0.55;
    fleckMat.emissive.setHex(i % 2 === 0 ? 0xffffff : 0xffa31a);
    fleckMat.emissiveIntensity = 1.6;
    sparkFlecks.push(fleck);
    torchCarriage.add(fleck);
  }

  const smokeWisps: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i += 1) {
    const wisp = sphere(0.035 + i * 0.012, [0, seamY + 0.04, 0], materials.safetyGlass, 10);
    const wispMat = wisp.material as THREE.MeshStandardMaterial;
    wispMat.transparent = true;
    wispMat.opacity = 0.12;
    wispMat.emissive.setHex(0x94a3b8);
    wispMat.emissiveIntensity = 0.2;
    smokeWisps.push(wisp);
    torchCarriage.add(wisp);
  }

  const sparkLight = new THREE.PointLight(0xffb15c, 0, 2.2);
  sparkLight.position.set(0, 0.42, 0);
  torchCarriage.add(sparkLight);

  group.add(torchCarriage);

  group.add(box([0.42, 0.028, 0.028], [-0.68, 0.58, 0.18], materials.darkSteel));

  [-0.58, 0.74].forEach((x) => {
    group.add(box([0.045, 0.66, 0.045], [x, 0.48, 0.44], materials.machineDark));
    const curtain = box([0.016, 0.5, 0.014], [x, 0.5, 0.47], materials.safetyGlass);
    const curtainMat = curtain.material as THREE.MeshStandardMaterial;
    curtainMat.opacity = 0.14;
    curtainMat.emissiveIntensity = 0.35;
    group.add(curtain);
  });

  const statusBeacon = cylinder(0.085, 0.085, 0.014, [0.52, 0.12, -0.52], materials.safetyGlass, 16);
  const statusBeaconMat = statusBeacon.material as THREE.MeshStandardMaterial;
  statusBeaconMat.opacity = 0.32;
  statusBeaconMat.emissive.setHex(0x22c55e);
  statusBeaconMat.emissiveIntensity = 0.45;
  group.add(statusBeacon);

  group.add(box([0.52, 0.014, 0.18], [1.02, 0.1, 0.04], materials.belt, false));
  group.add(box([0.38, 0.008, 0.04], [1.02, 0.118, 0.04], materials.tealGlow, false));

  group.userData.weldingRig = {
    torchCarriage,
    needle,
    weldArc,
    sparkCore,
    sparkHalo,
    sparkFlecks,
    seamGlow,
    sparkLight,
    statusBeacon,
    windowGlows,
    smokeWisps,
  } satisfies WeldingRig;

  return group;
}
