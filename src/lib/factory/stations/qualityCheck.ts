import * as THREE from "three";
import { lerp, smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import type { Materials } from "../materials";
import type { QcRig } from "../types";

export function tickQualityCheck(
  group: THREE.Group,
  progress: number,
  scanActivity = 0,
  rejectActivity = 0,
  elapsedMs = 0
) {
  const rig = group.userData.qualityCheckRig as QcRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.72, 0.88, progress);
  const passActivity = scanActivity * (1 - rejectActivity * 0.85);
  const scanSweep = scanActivity > 0.02 ? (Math.sin(elapsedMs * 0.009) * 0.5 + 0.5) * scanActivity : 0;

  rig.rejectPusher.position.z = lerp(0.2, -0.17, rejectActivity);

  rig.scannerHead.rotation.x = lerp(0, -0.06, scanActivity) + Math.sin(elapsedMs * 0.0022) * 0.012 * scanActivity;
  rig.scannerHead.position.y = 0.74 + scanSweep * 0.06;

  const beamMat = rig.scanBeam.material as THREE.MeshStandardMaterial;
  beamMat.opacity = (0.08 + scanActivity * 0.38 + rejectActivity * 0.12) * live;
  beamMat.emissiveIntensity = (0.35 + scanActivity * 1.45) * live;

  rig.scanLines.forEach((line, index) => {
    const lineMat = line.material as THREE.MeshStandardMaterial;
    const wave = Math.sin(elapsedMs * 0.011 + index * 0.9) * 0.5 + 0.5;
    lineMat.opacity = (0.05 + scanActivity * wave * 0.42) * live;
    lineMat.emissiveIntensity = (0.15 + scanActivity * wave * 0.95) * live;
  });

  const passMat = rig.passStrip.material as THREE.MeshStandardMaterial;
  passMat.opacity = (0.12 + passActivity * 0.55 + (1 - scanActivity) * 0.08) * live;
  passMat.emissiveIntensity = (0.25 + passActivity * 1.35) * live;
  passMat.emissive.setHex(passActivity > 0.35 ? 0x22c55e : 0x14b8a6);

  const hmiMat = rig.hmiScreen.material as THREE.MeshStandardMaterial;
  const hmiPulse = Math.sin(elapsedMs * 0.0045) * 0.5 + 0.5;
  hmiMat.emissiveIntensity = (0.35 + scanActivity * 0.9 + hmiPulse * 0.15) * live;
  hmiMat.opacity = (0.55 + scanActivity * 0.35) * live;
  if (rejectActivity > 0.4) {
    hmiMat.emissive.setHex(0xef4444);
  } else if (scanActivity > 0.35) {
    hmiMat.emissive.setHex(0x38bdf8);
  } else {
    hmiMat.emissive.setHex(0x2dd4bf);
  }

  const greenMat = rig.greenLamp.material as THREE.MeshStandardMaterial;
  greenMat.emissiveIntensity = (0.2 + passActivity * 1.65) * live;
  greenMat.opacity = (0.32 + passActivity * 0.58) * live;

  const amberMat = rig.amberLamp.material as THREE.MeshStandardMaterial;
  amberMat.emissiveIntensity = (0.15 + scanActivity * 0.85 * (1 - passActivity)) * live;
  amberMat.opacity = (0.22 + scanActivity * 0.42 * (1 - passActivity * 0.7)) * live;

  const redMat = rig.redLamp.material as THREE.MeshStandardMaterial;
  redMat.emissiveIntensity = (0.2 + rejectActivity * 2.6) * live;
  redMat.opacity = (0.18 + rejectActivity * 0.72) * live;

  rig.scanLight.intensity = (0.15 + scanActivity * 1.85) * live;
  rig.rejectLight.intensity = rejectActivity * 1.75 * live;

  if (rig.branchPulse) {
    const branchMat = rig.branchPulse.material as THREE.MeshStandardMaterial;
    branchMat.opacity = rejectActivity * 0.38 * live;
    branchMat.emissiveIntensity = rejectActivity * 1.35 * live;
  }
}

export function buildQualityCheck(materials: Materials) {
  const qcStation = prepGroup(new THREE.Group());
  qcStation.userData.stationId = "qualityCheck";

  const beltY = 0.224;
  const laneHalf = 0.14;

  qcStation.add(box([0.92, 0.032, 0.58], [0, beltY, 0], materials.machineDark, false));
  qcStation.add(box([0.78, 0.008, 0.44], [0, beltY + 0.018, 0], materials.zone, false));
  qcStation.add(box([0.62, 0.004, 0.34], [0, beltY + 0.026, 0], materials.darkSteel, false));

  const passStrip = box([0.58, 0.003, 0.22], [0, beltY + 0.029, 0], materials.tealGlow, false);
  const passStripMat = passStrip.material as THREE.MeshStandardMaterial;
  passStripMat.transparent = true;
  passStripMat.opacity = 0.14;
  passStripMat.emissive.setHex(0x14b8a6);
  passStripMat.emissiveIntensity = 0.28;
  qcStation.add(passStrip);

  const postX = [-0.34, 0.34] as const;
  postX.forEach((x) => {
    qcStation.add(box([0.042, 0.78, 0.042], [x, 0.61, 0], materials.machineDark));
    qcStation.add(box([0.048, 0.014, 0.048], [x, 0.24, 0], materials.darkSteel));
    qcStation.add(box([0.006, 0.62, 0.006], [x + (x < 0 ? 0.024 : -0.024), 0.58, 0.02], materials.tealGlow));
    qcStation.add(box([0.006, 0.62, 0.006], [x + (x < 0 ? 0.024 : -0.024), 0.58, -0.02], materials.tealGlow));
  });

  qcStation.add(box([0.76, 0.05, 0.06], [0, 1.0, -laneHalf], materials.machineLight));
  qcStation.add(box([0.76, 0.05, 0.06], [0, 1.0, laneHalf], materials.machineLight));
  qcStation.add(box([0.06, 0.05, 0.52], [-0.34, 1.0, 0], materials.machineLight));
  qcStation.add(box([0.06, 0.05, 0.52], [0.34, 1.0, 0], materials.machineLight));
  qcStation.add(box([0.64, 0.012, 0.018], [0, 1.03, -laneHalf + 0.04], materials.tealGlow));
  qcStation.add(box([0.64, 0.012, 0.018], [0, 1.03, laneHalf - 0.04], materials.tealGlow));

  const scannerHead = new THREE.Group();
  scannerHead.position.set(0, 0.74, 0);

  scannerHead.add(box([0.28, 0.1, 0.18], [0, 0, 0], materials.machine));
  scannerHead.add(box([0.22, 0.04, 0.14], [0, -0.05, 0], materials.darkSteel));
  const lensRing = cylinder(0.052, 0.058, 0.028, [0, -0.08, 0], materials.glass, 18);
  lensRing.rotation.x = Math.PI / 2;
  const lensMat = lensRing.material as THREE.MeshStandardMaterial;
  lensMat.opacity = 0.55;
  lensMat.emissive.setHex(0x38bdf8);
  lensMat.emissiveIntensity = 0.35;
  scannerHead.add(lensRing);
  scannerHead.add(cylinder(0.034, 0.034, 0.012, [0, -0.094, 0], materials.steel, 14));

  const scanBeam = box([0.54, 0.008, 0.36], [0, -0.22, 0], materials.tealGlow, false);
  const scanBeamMat = scanBeam.material as THREE.MeshStandardMaterial;
  scanBeamMat.transparent = true;
  scanBeamMat.opacity = 0.1;
  scanBeamMat.emissive.setHex(0x22d3ee);
  scanBeamMat.emissiveIntensity = 0.45;
  scannerHead.add(scanBeam);

  const scanLines: THREE.Mesh[] = [];
  for (let i = -2; i <= 2; i += 1) {
    const line = box([0.44, 0.002, 0.006], [0, -0.28, i * 0.07], materials.tealGlow, false);
    const lineMat = line.material as THREE.MeshStandardMaterial;
    lineMat.transparent = true;
    lineMat.opacity = 0.08;
    lineMat.emissiveIntensity = 0.3;
    scanLines.push(line);
    scannerHead.add(line);
  }

  qcStation.add(scannerHead);

  const stackX = 0.34;
  const stackZ = laneHalf - 0.02;
  qcStation.add(box([0.034, 0.28, 0.034], [stackX, 0.92, stackZ], materials.darkSteel));
  const greenLamp = cylinder(0.034, 0.034, 0.022, [stackX, 1.08, stackZ], materials.paintGreen, 14);
  const amberLamp = cylinder(0.03, 0.03, 0.02, [stackX, 1.05, stackZ], materials.warning, 14);
  const redLamp = cylinder(0.034, 0.034, 0.022, [stackX, 1.02, stackZ], materials.redLight, 14);
  [greenLamp, amberLamp, redLamp].forEach((lamp) => {
    const lampMat = lamp.material as THREE.MeshStandardMaterial;
    lampMat.transparent = true;
    lampMat.opacity = 0.38;
  });
  qcStation.add(greenLamp, amberLamp, redLamp);

  const hmiBase = box([0.14, 0.22, 0.1], [-0.46, 0.52, laneHalf - 0.04], materials.machineDark);
  qcStation.add(hmiBase);
  const hmiScreen = box([0.11, 0.14, 0.012], [-0.46, 0.56, laneHalf + 0.02], materials.glass, false);
  hmiScreen.rotation.x = -0.28;
  const hmiMat = hmiScreen.material as THREE.MeshStandardMaterial;
  hmiMat.transparent = true;
  hmiMat.opacity = 0.62;
  hmiMat.emissive.setHex(0x2dd4bf);
  hmiMat.emissiveIntensity = 0.42;
  qcStation.add(hmiScreen);
  for (let row = 0; row < 3; row += 1) {
    const bar = box([0.06 - row * 0.012, 0.008, 0.004], [-0.46, 0.58 - row * 0.028, laneHalf + 0.026], materials.tealGlow, false);
    const barMat = bar.material as THREE.MeshStandardMaterial;
    barMat.transparent = true;
    barMat.opacity = 0.45 + row * 0.12;
    bar.rotation.x = -0.28;
    qcStation.add(bar);
  }

  const rejectPusher = new THREE.Group();
  rejectPusher.position.set(-0.18, 0.3, 0.2);
  rejectPusher.add(cylinder(0.028, 0.028, 0.14, [0, 0.04, 0], materials.steel, 10));
  rejectPusher.add(box([0.32, 0.05, 0.05], [0, 0, 0.04], materials.machineLight));
  const pusherPad = box([0.38, 0.14, 0.032], [0, 0.02, -0.07], materials.warning, false);
  const pusherMat = pusherPad.material as THREE.MeshStandardMaterial;
  pusherMat.transparent = true;
  pusherMat.opacity = 0.72;
  pusherMat.emissiveIntensity = 0.35;
  rejectPusher.add(pusherPad);
  qcStation.add(rejectPusher);

  qcStation.add(box([0.1, 0.36, 0.04], [-0.42, 0.42, 0.08], materials.darkSteel));
  const guardPanel = box([0.01, 0.32, 0.34], [0.5, 0.48, 0], materials.safetyGlass, false);
  const guardMat = guardPanel.material as THREE.MeshStandardMaterial;
  guardMat.opacity = 0.16;
  guardMat.emissiveIntensity = 0.12;
  qcStation.add(guardPanel);

  const scanLight = new THREE.PointLight(0x38bdf8, 0, 1.8);
  scanLight.position.set(0, 0.52, 0);
  qcStation.add(scanLight);

  const rejectLight = new THREE.PointLight(0xef4444, 0, 1.5);
  rejectLight.position.set(-0.2, 0.44, -0.18);
  qcStation.add(rejectLight);

  qcStation.userData.qualityCheckRig = {
    rejectPusher,
    scannerHead,
    scanBeam,
    scanLines,
    passStrip,
    hmiScreen,
    greenLamp,
    amberLamp,
    redLamp,
    scanLight,
    rejectLight,
  } satisfies QcRig;

  return qcStation;
}
