import * as THREE from "three";
import { lerp, smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import type { PackagingRig } from "../types";

export function tickPackaging(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.packagingRig as PackagingRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.91, 1, progress);
  const phase = elapsedMs * 0.00072;

  const rawPlunge = Math.sin(phase * 0.44) * 0.5 + 0.5;
  const plunge = smoothstep(0.46, 1.0, rawPlunge) * live;
  rig.sealHead.position.y = lerp(1.86, 1.28, plunge);

  const beamMat = rig.sealBeam.material as THREE.MeshStandardMaterial;
  beamMat.opacity = (0.08 + plunge * 0.54) * live;
  beamMat.emissiveIntensity = (0.3 + plunge * 2.1) * live;

  const swingCycle = Math.sin(phase * 0.32) * 0.5 + 0.5;
  rig.gantryCrane.position.x = lerp(2.2, 4.3, swingCycle);
  rig.gantryCrane.position.z = lerp(-0.38, -1.04, Math.sin(phase * 0.18) * 0.5 + 0.5);

  const amberPulse = Math.sin(phase * 3.8) * 0.5 + 0.5;
  const alMat = rig.amberLamp.material as THREE.MeshStandardMaterial;
  alMat.opacity = (0.28 + amberPulse * 0.52 + plunge * 0.22) * live;
  alMat.emissiveIntensity = (0.28 + amberPulse * 1.2 + plunge * 1.4) * live;

  const beaconSpin = Math.sin(phase * 5.6) * 0.5 + 0.5;
  const sbMat = rig.statusBeacon.material as THREE.MeshStandardMaterial;
  sbMat.opacity = (0.38 + beaconSpin * 0.52) * live;
  sbMat.emissiveIntensity = (0.4 + beaconSpin * 1.8) * live;
  rig.statusBeacon.scale.setScalar(0.92 + beaconSpin * 0.12 * live);

  const lightBase = 0.12 + beaconSpin * 0.4;
  rig.packingLight.intensity = (lightBase + plunge * 2.2) * live;
}

export function buildPackaging(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { packagingStation } = LAYOUT;
  const anchor = layoutPoint(packagingStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = packagingStation.angle;
  group.scale.setScalar(packagingStation.scale);

  group.add(box([5.6, 0.04, 2.6], [1.8, 0.02, -0.68], materials.machineDark, false));
  group.add(box([5.2, 0.014, 2.2], [1.8, 0.044, -0.68], materials.zone, false));
  group.add(box([5.0, 0.006, 0.062], [1.8, 0.074, -0.68], materials.darkSteel, false));
  group.add(box([0.062, 0.006, 2.42], [1.8, 0.074, -0.62], materials.darkSteel, false));

  const archCols: [number, number][] = [[-0.5, -0.32], [-0.5, 0.32], [1.3, -0.32], [1.3, 0.32]];
  archCols.forEach(([cx, cz]) => {
    group.add(box([0.12, 2.32, 0.12], [cx, 1.16, cz], materials.machineDark));
    group.add(box([0.16, 0.026, 0.16], [cx, 0.13, cz], materials.darkSteel));
    group.add(box([0.16, 0.026, 0.16], [cx, 2.26, cz], materials.darkSteel));
  });
  group.add(box([1.96, 0.12, 0.12], [0.4, 2.38, -0.32], materials.machineDark));
  group.add(box([1.96, 0.12, 0.12], [0.4, 2.38,  0.32], materials.machineDark));
  group.add(box([0.12, 0.12, 0.76],  [-0.5, 2.38, 0],   materials.machineDark));
  group.add(box([0.12, 0.12, 0.76],  [ 1.3, 2.38, 0],   materials.machineDark));
  group.add(box([1.84, 0.14, 0.86], [0.4, 2.46, 0], materials.machine));
  group.add(box([1.68, 0.022, 0.72], [0.4, 2.54, 0], materials.machineLight));
  group.add(box([0.022, 1.44, 0.022], [-0.5, 0.92, -0.22], materials.darkSteel));
  group.add(box([0.022, 1.44, 0.022], [-0.5, 0.92,  0.22], materials.darkSteel));
  group.add(box([0.022, 1.44, 0.022], [ 1.3, 0.92, -0.22], materials.darkSteel));
  group.add(box([0.022, 1.44, 0.022], [ 1.3, 0.92,  0.22], materials.darkSteel));

  const sealHead = new THREE.Group();
  sealHead.position.set(0.4, 1.86, 0);
  group.add(sealHead);
  sealHead.add(box([1.0, 0.18, 0.58], [0, 0, 0], materials.machineLight));
  sealHead.add(box([0.8, 0.06, 0.46], [0, -0.12, 0], materials.steel));
  sealHead.add(box([0.72, 0.028, 0.36], [0, -0.15, 0], materials.darkSteel));
  const sealBar = box([0.62, 0.01, 0.26], [0, -0.166, 0], materials.tealGlow, false);
  const sealBarMat = sealBar.material as THREE.MeshStandardMaterial;
  sealBarMat.transparent = true;
  sealBarMat.opacity = 0.72;
  sealBarMat.emissiveIntensity = 1.4;
  sealHead.add(sealBar);
  ([ [-0.38, -0.22], [-0.38, 0.22], [0.38, -0.22], [0.38, 0.22] ] as [number, number][]).forEach(([rx, rz]) => {
    sealHead.add(cylinder(0.016, 0.016, 0.52, [rx, 0.26, rz], materials.steel, 8));
    sealHead.add(box([0.038, 0.038, 0.038], [rx, 0, rz], materials.darkSteel));
  });

  const sealBeam = box([1.62, 0.008, 0.52], [0.4, 0.44, 0], materials.tealGlow, false);
  const sbMat = sealBeam.material as THREE.MeshStandardMaterial;
  sbMat.transparent = true;
  sbMat.opacity = 0.14;
  sbMat.emissiveIntensity = 0.6;
  group.add(sealBeam);

  group.add(box([1.88, 1.84, 1.52], [0.4, 0.92, -1.04], materials.machineDark));
  group.add(box([1.8, 0.14, 1.44], [0.4, 1.86, -1.04], materials.machine));
  group.add(box([1.68, 0.022, 1.32], [0.4, 1.92, -1.04], materials.machineLight));
  group.add(box([1.8, 0.42, 0.058], [0.4, 0.96, -0.29], materials.machine));
  const visionWin = box([0.56, 0.30, 0.038], [0.4, 0.98, -0.266], materials.glass);
  const vwMat = visionWin.material as THREE.MeshStandardMaterial;
  vwMat.emissiveIntensity = 0.45;
  group.add(visionWin);
  const visionLens = cylinder(0.048, 0.048, 0.065, [0.4, 0.98, -0.234], materials.darkSteel, 14);
  visionLens.rotation.x = Math.PI / 2;
  group.add(visionLens);
  const lensGlass = cylinder(0.034, 0.034, 0.048, [0.4, 0.98, -0.22], materials.glass, 14);
  lensGlass.rotation.x = Math.PI / 2;
  group.add(lensGlass);
  group.add(box([0.058, 1.84, 1.52], [-0.502, 0.92, -1.04], materials.machine));
  group.add(box([0.058, 1.84, 1.52], [ 1.302, 0.92, -1.04], materials.machine));
  group.add(box([1.8, 1.84, 0.058], [0.4, 0.92, -1.808], materials.machine));
  group.add(box([1.68, 0.26, 0.72], [0.4, 0.32, -0.56], materials.hydraulic, false));
  group.add(box([1.56, 0.18, 0.58], [0.4, 0.32, -0.56], materials.machineDark, false));
  const conduit = cylinder(0.036, 0.036, 1.82, [1.14, 0.92, -1.792], materials.steel, 10);
  conduit.rotation.x = Math.PI / 2;
  group.add(conduit);
  group.add(box([0.044, 0.044, 0.32], [1.14, 0.92, -1.61], materials.steel));
  group.add(box([0.044, 0.044, 0.32], [-0.26, 0.92, -1.61], materials.steel));
  group.add(box([0.054, 0.62, 0.88], [1.3, 0.78, -1.06], materials.machineLight));
  group.add(box([0.024, 0.44, 0.56], [1.332, 0.78, -1.06], materials.glass));

  group.add(box([0.82, 0.92, 0.62], [1.88, 0.46, -0.78], materials.machineDark));
  group.add(box([0.68, 0.024, 0.52], [1.88, 0.93, -0.78], materials.machineLight));
  const printerScreen = box([0.52, 0.32, 0.044], [1.88, 0.58, -0.482], materials.glass);
  const psMat = printerScreen.material as THREE.MeshStandardMaterial;
  psMat.emissiveIntensity = 0.5;
  group.add(printerScreen);
  const spool = cylinder(0.15, 0.15, 0.34, [1.88, 0.24, -1.12], materials.steel, 14);
  spool.rotation.x = Math.PI / 2;
  group.add(spool);
  const spoolCore = cylinder(0.065, 0.065, 0.36, [1.88, 0.24, -1.12], materials.darkSteel, 10);
  spoolCore.rotation.x = Math.PI / 2;
  group.add(spoolCore);
  group.add(box([0.044, 0.044, 0.46], [1.88, 0.42, -0.92], materials.steel));
  group.add(box([0.52, 0.028, 0.044], [1.88, 0.42, -0.7], materials.steel));
  group.add(cylinder(0.032, 0.032, 0.038, [1.66, 0.30, -0.476], materials.tealGlow, 12));
  group.add(cylinder(0.028, 0.028, 0.038, [1.74, 0.30, -0.476], materials.paintGreen, 12));
  group.add(cylinder(0.024, 0.024, 0.038, [1.82, 0.30, -0.476], materials.machineLight, 12));

  const paX = 2.88, paZ = -0.68;
  group.add(box([1.18, 0.09, 0.98], [paX, 0.045, paZ], materials.darkSteel));
  ([-0.42, 0, 0.42] as number[]).forEach((oz) => {
    group.add(box([0.96, 0.04, 0.16], [paX, 0.02, paZ + oz], materials.darkSteel, false));
  });
  for (let i = 0; i < 4; i += 1) {
    const by = 0.09 + i * 0.27;
    const layerMat = i % 2 === 0 ? materials.machineLight : materials.package;
    group.add(box([1.04, 0.23, 0.82], [paX, by + 0.115, paZ], layerMat));
    group.add(box([0.26, 0.14, 0.038], [paX - 0.22, by + 0.1, paZ - 0.41], materials.enamel, false));
  }

  const pbX = 4.12, pbZ = -0.72;
  group.add(box([0.98, 0.09, 0.82], [pbX, 0.045, pbZ], materials.darkSteel));
  ([-0.32, 0.32] as number[]).forEach((oz) => {
    group.add(box([0.78, 0.04, 0.14], [pbX, 0.02, pbZ + oz], materials.darkSteel, false));
  });
  for (let i = 0; i < 3; i += 1) {
    const by = 0.09 + i * 0.25;
    group.add(box([0.84, 0.21, 0.68], [pbX, by + 0.105, pbZ], i % 2 === 0 ? materials.package : materials.machineLight));
    group.add(box([0.22, 0.12, 0.036], [pbX - 0.18, by + 0.07, pbZ - 0.34], materials.enamel, false));
  }

  const pcX = 1.98, pcZ = -0.72;
  group.add(box([1.06, 0.09, 0.88], [pcX, 0.045, pcZ], materials.darkSteel));
  group.add(box([0.92, 0.23, 0.74], [pcX, 0.205, pcZ], materials.machineLight));
  group.add(box([0.24, 0.14, 0.036], [pcX - 0.2, 0.16, pcZ - 0.37], materials.enamel, false));

  const craneH = 3.28;
  const craneCols: [number, number][] = [[1.94, 0.3], [4.48, 0.3], [1.94, -1.72], [4.48, -1.72]];
  craneCols.forEach(([cx, cz]) => {
    group.add(box([0.13, craneH, 0.13], [cx, craneH / 2, cz], materials.machineDark));
    group.add(box([0.17, 0.024, 0.17], [cx, 0.13, cz], materials.darkSteel));
    group.add(box([0.17, 0.024, 0.17], [cx, craneH - 0.07, cz], materials.darkSteel));
  });
  group.add(box([2.7, 0.1, 0.1], [3.21, craneH, 0.3], materials.darkSteel));
  group.add(box([2.7, 0.1, 0.1], [3.21, craneH, -1.72], materials.darkSteel));
  group.add(box([0.1, 0.1, 2.18], [1.94, craneH, -0.71], materials.darkSteel));
  group.add(box([0.1, 0.1, 2.18], [4.48, craneH, -0.71], materials.darkSteel));
  group.add(box([2.66, 0.065, 2.14], [3.21, craneH + 0.04, -0.71], materials.machineDark));
  group.add(box([2.5, 0.014, 1.98], [3.21, craneH + 0.06, -0.71], materials.machine));
  const gantryCrane = new THREE.Group();
  gantryCrane.position.set(2.2, craneH, -0.71);
  group.add(gantryCrane);
  gantryCrane.add(box([0.58, 0.26, 0.62], [0, 0, 0], materials.machine));
  gantryCrane.add(box([0.5, 0.08, 0.52], [0, 0.17, 0], materials.machineLight));
  gantryCrane.add(cylinder(0.072, 0.072, 0.36, [0, 0.04, 0], materials.darkSteel, 14));
  gantryCrane.add(cylinder(0.048, 0.048, 0.38, [0, 0.04, 0], materials.steel, 10));
  gantryCrane.add(cylinder(0.012, 0.012, 0.88, [0, -0.44, 0], materials.steel, 8));
  gantryCrane.add(box([0.28, 0.14, 0.26], [0, -0.94, 0], materials.machine));
  gantryCrane.add(box([0.22, 0.04, 0.2], [0, -1.02, 0], materials.darkSteel));
  ([ [-0.1, -0.1], [-0.1, 0.1], [0.1, -0.1], [0.1, 0.1] ] as [number, number][]).forEach(([gx, gz]) => {
    gantryCrane.add(box([0.038, 0.22, 0.038], [gx, -1.12, gz], materials.steel));
  });
  group.add(box([0.054, 2.56, 0.054], [4.44, 1.28, 0.22], materials.darkSteel));
  const runLamp = cylinder(0.054, 0.054, 0.052, [4.44, 2.51, 0.22], materials.paintGreen, 16);
  const rlMat = runLamp.material as THREE.MeshStandardMaterial;
  rlMat.transparent = true;
  rlMat.opacity = 0.5;
  rlMat.emissive.setHex(0x22c55e);
  rlMat.emissiveIntensity = 0.5;
  group.add(runLamp);
  const amberLamp = cylinder(0.064, 0.064, 0.064, [4.44, 2.58, 0.22], materials.orange, 16);
  const alMat = amberLamp.material as THREE.MeshStandardMaterial;
  alMat.transparent = true;
  alMat.opacity = 0.62;
  alMat.emissive.setHex(0xf59e0b);
  alMat.emissiveIntensity = 0.7;
  group.add(amberLamp);
  const statusBeacon = cylinder(0.086, 0.086, 0.055, [4.44, 2.66, 0.22], materials.orange, 18);
  const bMat = statusBeacon.material as THREE.MeshStandardMaterial;
  bMat.transparent = true;
  bMat.opacity = 0.76;
  bMat.emissive.setHex(0xf59e0b);
  bMat.emissiveIntensity = 0.9;
  group.add(statusBeacon);
  group.add(cylinder(0.046, 0.064, 0.024, [4.44, 2.726, 0.22], materials.darkSteel, 16));

  group.add(box([0.64, 1.52, 0.52], [-0.34, 0.76, -0.26], materials.machineDark));
  group.add(box([0.54, 0.026, 0.44], [-0.34, 1.53, -0.26], materials.machineLight));
  const hmiPanel = box([0.48, 0.34, 0.048], [-0.34, 0.88, -0.018], materials.glass);
  const hmiMat = hmiPanel.material as THREE.MeshStandardMaterial;
  hmiMat.emissiveIntensity = 0.55;
  group.add(hmiPanel);
  for (let i = 0; i < 4; i += 1) {
    group.add(box([0.32, 0.012, 0.026], [-0.34, 0.9 + i * 0.06, -0.004], materials.machineLight));
  }
  ([ [-0.46, 0.042], [-0.34, 0.042], [-0.22, 0.042] ] as [number, number][]).forEach(([bx, bz], i) => {
    group.add(cylinder(0.034, 0.034, 0.04, [bx, 0.56, bz],
      i === 2 ? materials.redLight : materials.machineLight, 12));
  });
  group.add(cylinder(0.052, 0.052, 0.048, [-0.34, 0.40, -0.014], materials.redLight, 14));
  group.add(cylinder(0.068, 0.052, 0.016, [-0.34, 0.44, -0.014], materials.redLight, 14));
  group.add(box([0.044, 0.64, 0.044], [-0.34, 1.84, -0.26], materials.darkSteel));
  group.add(box([0.044, 0.044, 1.12], [-0.34, 2.16, -0.86], materials.darkSteel));

  const lgPanel = box([0.012, 1.38, 0.86], [-0.48, 0.93, -0.32], materials.safetyGlass, false);
  const lgMat = lgPanel.material as THREE.MeshStandardMaterial;
  lgMat.opacity = 0.2;
  group.add(lgPanel);
  const rgPanel = box([0.012, 1.38, 0.86], [1.38, 0.93, -0.32], materials.safetyGlass, false);
  const rgMat = rgPanel.material as THREE.MeshStandardMaterial;
  rgMat.opacity = 0.2;
  group.add(rgPanel);
  ([ [-0.466, -0.32], [-0.466, 0.32], [1.366, -0.32], [1.366, 0.32] ] as [number, number][]).forEach(([px, pz]) => {
    group.add(box([0.04, 1.44, 0.04], [px, 0.96, pz], materials.machineLight));
  });
  group.add(box([0.04, 0.04, 0.76], [-0.466, 1.65, 0], materials.machineLight));
  group.add(box([0.04, 0.04, 0.76], [ 1.366, 1.65, 0], materials.machineLight));

  group.add(box([5.8, 0.076, 0.3], [2.6, 2.38, -1.68], materials.darkSteel));
  group.add(box([5.8, 0.018, 0.26], [2.6, 2.42, -1.68], materials.machine));
  group.add(box([0.3, 0.076, 2.56], [-0.38, 2.38, -0.78], materials.darkSteel));
  group.add(box([0.26, 0.018, 2.52], [-0.38, 2.42, -0.78], materials.machine));

  const packingLight = new THREE.PointLight(0xf59e0b, 0, 5.5);
  packingLight.position.set(2.4, 1.0, -0.68);
  group.add(packingLight);

  group.userData.packagingRig = {
    sealHead,
    gantryCrane,
    statusBeacon,
    amberLamp,
    sealBeam,
    packingLight,
  } satisfies PackagingRig;

  return group;
}
