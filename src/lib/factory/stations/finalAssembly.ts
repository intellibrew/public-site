import * as THREE from "three";
import { lerp, smoothstep } from "../math";
import { box, cylinder, sphere } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import type { FinalAssemblyRig } from "../types";

export function tickFinalAssembly(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.finalAssemblyRig as FinalAssemblyRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.9, 1, progress);
  const phase = elapsedMs * 0.00084;

  const gantryCycle = Math.sin(phase * 0.62) * 0.5 + 0.5;
  rig.gantryCarriage.position.x = lerp(0.52, 2.6, gantryCycle);

  const plungeRaw = -Math.sin(phase * 1.84) * 0.5 + 0.5;
  const plunge = Math.max(0, plungeRaw) * live;
  rig.gantrySlide.position.y = -plunge * 0.24;

  const robotPhase = phase * 0.48;
  rig.robotBaseYaw.rotation.y = Math.sin(robotPhase) * 0.92;
  rig.robotShoulder.rotation.z = -0.72 + Math.sin(robotPhase + 1.1) * 0.26;
  rig.robotElbow.rotation.z = 1.08 + Math.sin(robotPhase + 2.0) * 0.2;
  rig.robotWrist.rotation.z = -0.2 - Math.sin(robotPhase + 1.6) * 0.22;
  const gripSpread = Math.max(0, Math.sin(robotPhase * 2.1 + 0.5)) * 0.028 * live;
  rig.robotGripperL.position.z = 0.068 + gripSpread;
  rig.robotGripperR.position.z = -0.068 - gripSpread;

  rig.workPulses.forEach((pulse, idx) => {
    const pMat = pulse.material as THREE.MeshStandardMaterial;
    const wave = Math.sin(phase * 3.2 + idx * 1.15) * 0.5 + 0.5;
    pMat.opacity = (0.08 + wave * 0.42) * live;
    pMat.emissiveIntensity = (0.35 + wave * 1.4) * live;
  });

  rig.beaconMeshes.forEach((beacon, idx) => {
    const bMat = beacon.material as THREE.MeshStandardMaterial;
    const bWave = Math.sin(phase * 2.1 + idx * 0.85) * 0.5 + 0.5;
    bMat.opacity = (0.2 + bWave * 0.5) * live;
    bMat.emissiveIntensity = (0.22 + bWave * 1.3) * live;
    beacon.scale.setScalar(0.88 + bWave * 0.2 * live);
  });

  const lightPulse = (Math.sin(phase * 2.6) * 0.5 + 0.5) * live;
  rig.assemblyLight.intensity = 0.15 + lightPulse * 1.5;
}

export function buildFinalAssembly(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { finalAssemblyStation } = LAYOUT;
  const anchor = layoutPoint(finalAssemblyStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = finalAssemblyStation.angle;
  group.scale.setScalar(finalAssemblyStation.scale);

  const inner = new THREE.Group();
  inner.scale.z = 1;
  group.add(inner);

  const workPulses: THREE.Mesh[] = [];
  const beaconMeshes: THREE.Mesh[] = [];
  const colH = 1.78;

  inner.add(box([3.0, 0.04, 1.06], [1.65, 0.02, -0.71], materials.machineDark, false));
  inner.add(box([2.72, 0.014, 0.82], [1.65, 0.044, -0.71], materials.zone, false));
  inner.add(box([1.06, 0.04, 0.84], [0.65, 0.02, -1.65], materials.machineDark, false));
  inner.add(box([0.82, 0.014, 0.62], [0.65, 0.044, -1.65], materials.zone, false));
  inner.add(box([1.06, 0.012, 1.06], [0.65, 0.056, -0.71], materials.tealGlow, false));
  inner.add(box([2.9, 0.008, 0.032], [1.65, 0.068, -0.22], materials.warning, false));
  inner.add(box([0.032, 0.008, 1.82], [0.22, 0.068, -1.19], materials.warning, false));
  inner.add(box([2.72, 0.008, 0.024], [1.65, 0.068, -1.22], materials.tealGlow, false));
  inner.add(box([0.024, 0.008, 1.72], [1.18, 0.068, -1.19], materials.tealGlow, false));
  inner.add(box([2.6, 0.006, 0.06], [1.65, 0.074, -0.71], materials.darkSteel, false));
  inner.add(box([0.06, 0.006, 1.58], [0.65, 0.074, -1.17], materials.darkSteel, false));

  const gCols: [number, number][] = [
    [0.32, -0.3], [0.32, -1.14],
    [3.04, -0.3], [3.04, -1.14],
  ];
  gCols.forEach(([cx, cz]) => {
    inner.add(box([0.2, colH, 0.2], [cx, colH / 2, cz], materials.machineDark));
    inner.add(box([0.26, 0.024, 0.26], [cx, 0.14, cz], materials.tealGlow));
    inner.add(box([0.26, 0.024, 0.26], [cx, colH - 0.08, cz], materials.tealGlow));
    const ledDir = cx < 1.5 ? 0.11 : -0.11;
    inner.add(box([0.014, colH * 0.66, 0.016], [cx + ledDir, colH * 0.5, cz], materials.tealGlow));
  });
  [0.32, 1.14].forEach((cx) => {
    inner.add(box([0.2, colH, 0.2], [cx, colH / 2, -2.04], materials.machineDark));
    inner.add(box([0.26, 0.024, 0.26], [cx, 0.14, -2.04], materials.tealGlow));
    inner.add(box([0.26, 0.024, 0.26], [cx, colH - 0.08, -2.04], materials.tealGlow));
  });

  const railY = colH + 0.04;
  inner.add(box([2.92, 0.072, 0.072], [1.65, railY, -0.3], materials.darkSteel));
  inner.add(box([2.92, 0.072, 0.072], [1.65, railY, -1.14], materials.darkSteel));
  [0.38, 1.1, 1.86, 2.68].forEach((cx) => {
    inner.add(box([0.072, 0.072, 0.9], [cx, railY, -0.72], materials.darkSteel));
  });
  inner.add(box([2.92, 0.02, 0.9], [1.65, railY + 0.046, -0.72], materials.machineDark));
  inner.add(box([2.72, 0.01, 0.016], [1.65, railY + 0.062, -0.28], materials.tealGlow));
  inner.add(box([2.72, 0.01, 0.016], [1.65, railY + 0.062, -1.12], materials.tealGlow));

  const gantryCarriage = new THREE.Group();
  gantryCarriage.position.set(0.52, railY, -0.72);
  inner.add(gantryCarriage);
  gantryCarriage.add(box([0.46, 0.22, 1.06], [0, 0, 0], materials.machine));
  gantryCarriage.add(box([0.42, 0.068, 0.96], [0, 0.145, 0], materials.machineLight));
  [[-0.2, 0.42], [-0.2, -0.42], [0.2, 0.42], [0.2, -0.42]].forEach(([dx, dz]) => {
    gantryCarriage.add(box([0.13, 0.1, 0.1], [dx, -0.04, dz], materials.darkSteel));
  });
  gantryCarriage.add(box([0.13, 0.74, 0.13], [0, -0.37, 0], materials.machineDark));
  gantryCarriage.add(box([0.016, 0.56, 0.018], [0.075, -0.37, 0.072], materials.tealGlow));
  for (let i = 0; i < 7; i += 1) {
    gantryCarriage.add(box([0.18, 0.044, 0.044], [0, 0.048, -0.46 - i * 0.065], materials.darkSteel));
  }
  const gantrySlide = new THREE.Group();
  gantrySlide.position.set(0, 0, 0);
  gantryCarriage.add(gantrySlide);
  gantrySlide.add(box([0.26, 0.1, 0.26], [0, -0.75, 0], materials.machineLight));
  [[-0.09, -0.09], [-0.09, 0.09], [0.09, -0.09], [0.09, 0.09]].forEach(([px, pz]) => {
    gantrySlide.add(box([0.042, 0.16, 0.042], [px, -0.84, pz], materials.steel));
  });
  gantrySlide.add(cylinder(0.14, 0.14, 0.01, [0, -0.9, 0], materials.tealGlow, 20));
  gantrySlide.add(cylinder(0.022, 0.026, 0.06, [0, -0.935, 0], materials.machineLight, 12));

  [1.55, 2.15, 2.76].forEach((fx, idx) => {
    inner.add(box([0.44, 0.068, 0.72], [fx, 0.055, -0.72], materials.hydraulic));
    inner.add(box([0.36, 0.02, 0.62], [fx, 0.088, -0.72], materials.machineLight));
    [[-0.13, -0.24], [-0.13, 0.24], [0.13, -0.24], [0.13, 0.24]].forEach(([px, pz]) => {
      inner.add(cylinder(0.015, 0.019, 0.1, [fx + px, 0.138, -0.72 + pz], materials.steel, 8));
    });
    const wPulse = cylinder(0.19, 0.19, 0.007, [fx, 0.066, -0.72], materials.safetyGlass, 24);
    const wPMat = wPulse.material as THREE.MeshStandardMaterial;
    wPMat.opacity = 0.18;
    wPMat.emissive.setHex(0x14b8a6);
    wPMat.emissiveIntensity = 0.7;
    inner.add(wPulse);
    workPulses.push(wPulse);
    if (idx === 1) {
      inner.add(box([0.2, 0.055, 0.14], [fx, 0.122, -0.72], materials.machineLight));
      inner.add(box([0.11, 0.042, 0.08], [fx, 0.178, -0.72], materials.darkSteel));
      inner.add(box([0.08, 0.014, 0.06], [fx, 0.2, -0.72], materials.tealGlow));
    }
    const bayLamp = cylinder(0.022, 0.022, 0.18, [fx, colH + 0.24, -0.72], materials.safetyGlass, 12);
    const blMat = bayLamp.material as THREE.MeshStandardMaterial;
    blMat.color.setHex(0x4ade80);
    blMat.emissive.setHex(0x22c55e);
    blMat.emissiveIntensity = 0.4;
    blMat.opacity = 0.42;
    inner.add(bayLamp);
  });

  inner.add(box([0.58, 1.5, 0.48], [0.66, 0.75, -0.72], materials.machineDark));
  inner.add(box([0.5, 0.022, 0.4], [0.66, 1.51, -0.72], materials.machineLight));
  const hmiMain = box([0.38, 0.26, 0.032], [0.66, 0.84, -0.5], materials.glass);
  inner.add(hmiMain);
  const hmiMat = hmiMain.material as THREE.MeshStandardMaterial;
  hmiMat.emissiveIntensity = 0.55;
  inner.add(box([0.32, 0.018, 0.028], [0.66, 0.7, -0.49], materials.tealGlow));
  for (let i = 0; i < 4; i += 1) {
    const bx = 0.48 + i * 0.09;
    inner.add(box([0.042, 0.042, 0.032], [bx, 0.56, -0.49], i % 2 === 0 ? materials.tealGlow : materials.warning));
  }
  inner.add(cylinder(0.042, 0.042, 0.044, [0.88, 0.42, -0.49], materials.redLight, 16));
  inner.add(cylinder(0.058, 0.044, 0.014, [0.88, 0.462, -0.49], materials.redLight, 16));
  inner.add(box([0.04, 1.08, 0.04], [0.92, 0.54, -0.72], materials.darkSteel));
  inner.add(box([0.04, 1.08, 0.04], [0.42, 0.54, -0.72], materials.darkSteel));
  inner.add(box([0.62, 0.044, 0.044], [0.98, 1.52, -0.72], materials.darkSteel));
  inner.add(box([0.044, 0.044, 0.78], [0.32, 1.52, -1.41], materials.darkSteel));

  inner.add(box([0.4, 0.78, 0.34], [3.06, 0.39, -0.84], materials.machineDark));
  const hmiB = box([0.28, 0.22, 0.032], [3.06, 0.52, -0.67], materials.glass);
  inner.add(hmiB);
  const hmiBMat = hmiB.material as THREE.MeshStandardMaterial;
  hmiBMat.emissiveIntensity = 0.5;
  inner.add(box([0.26, 0.018, 0.028], [3.06, 0.4, -0.666], materials.tealGlow));
  inner.add(cylinder(0.034, 0.034, 0.044, [2.96, 0.28, -0.664], materials.tealGlow, 12));
  inner.add(cylinder(0.028, 0.028, 0.044, [3.06, 0.28, -0.664], materials.warning, 12));

  inner.add(cylinder(0.36, 0.42, 0.2, [0.65, 0.12, -1.35], materials.machineDark, 32));
  inner.add(cylinder(0.26, 0.32, 0.09, [0.65, 0.245, -1.35], materials.machine, 28));
  inner.add(cylinder(0.3, 0.26, 0.04, [0.65, 0.298, -1.35], materials.tealGlow, 28));
  inner.add(cylinder(0.16, 0.2, 0.18, [0.65, 0.1, -1.35], materials.darkSteel, 16));
  const chute = box([0.044, 0.044, 0.28], [0.65, 0.29, -1.54], materials.machineLight);
  chute.rotation.x = 0.2;
  inner.add(chute);
  inner.add(box([0.38, 0.032, 0.28], [0.65, 0.44, -1.55], materials.steel));
  inner.add(box([0.008, 0.2, 0.26], [0.46, 0.54, -1.55], materials.darkSteel));
  inner.add(box([0.008, 0.2, 0.26], [0.84, 0.54, -1.55], materials.darkSteel));

  inner.add(box([0.4, 0.08, 0.4], [0.65, 0.04, -1.74], materials.darkSteel));
  inner.add(cylinder(0.16, 0.2, 0.42, [0.65, 0.25, -1.74], materials.machineDark, 24));
  inner.add(box([0.34, 0.032, 0.34], [0.65, 0.466, -1.74], materials.tealGlow));
  const robotBaseYaw = new THREE.Group();
  robotBaseYaw.position.set(0.65, 0.598, -1.74);
  inner.add(robotBaseYaw);
  robotBaseYaw.add(cylinder(0.13, 0.155, 0.2, [0, 0, 0], materials.orange, 24));
  const robotShoulder = new THREE.Group();
  robotShoulder.position.set(0.09, 0.11, 0);
  robotShoulder.rotation.z = -0.72;
  robotBaseYaw.add(robotShoulder);
  robotShoulder.add(sphere(0.09, [0, 0, 0], materials.machineLight));
  robotShoulder.add(box([0.46, 0.13, 0.14], [0.23, 0, 0], materials.orange));
  const robotElbow = new THREE.Group();
  robotElbow.position.set(0.46, 0, 0);
  robotElbow.rotation.z = 1.08;
  robotShoulder.add(robotElbow);
  robotElbow.add(sphere(0.082, [0, 0, 0], materials.machineLight));
  robotElbow.add(box([0.38, 0.11, 0.11], [0.19, 0, 0], materials.orange));
  robotElbow.add(box([0.05, 0.18, 0.05], [0.1, 0.03, 0], materials.darkSteel));
  const robotWrist = new THREE.Group();
  robotWrist.position.set(0.38, 0, 0);
  robotWrist.rotation.z = -0.2;
  robotElbow.add(robotWrist);
  robotWrist.add(cylinder(0.06, 0.07, 0.16, [0.1, 0, 0], materials.machineDark, 16));
  robotWrist.add(box([0.12, 0.05, 0.05], [0.22, 0, 0], materials.machineDark));
  const robotGripperL = box([0.032, 0.14, 0.03], [0.31, -0.04, 0.068], materials.steel);
  const robotGripperR = box([0.032, 0.14, 0.03], [0.31, -0.04, -0.068], materials.steel);
  robotWrist.add(robotGripperL, robotGripperR);
  robotWrist.add(box([0.038, 0.038, 0.038], [0.18, 0, 0], materials.tealGlow));

  inner.add(box([0.06, 1.14, 0.06], [1.1, 0.57, -1.88], materials.darkSteel));
  inner.add(box([0.3, 0.2, 0.24], [1.1, 1.19, -1.88], materials.machineDark));
  inner.add(box([0.24, 0.14, 0.052], [1.1, 1.19, -1.77], materials.glass));
  inner.add(cylinder(0.042, 0.042, 0.062, [1.1, 1.19, -1.74], materials.darkSteel, 12));
  const visionRing = cylinder(0.084, 0.084, 0.008, [1.1, 1.19, -1.72], materials.tealGlow, 20);
  visionRing.rotation.x = Math.PI / 2;
  const vrMat = visionRing.material as THREE.MeshStandardMaterial;
  vrMat.emissiveIntensity = 1.2;
  inner.add(visionRing);
  workPulses.push(visionRing);
  inner.add(box([0.08, 0.042, 0.34], [1.06, 1.07, -2.0], materials.steel));
  inner.add(box([0.22, 0.14, 0.18], [1.1, 1.19, -2.06], materials.machineDark));
  inner.add(cylinder(0.032, 0.032, 0.05, [1.1, 1.19, -2.08], materials.darkSteel, 10));

  inner.add(box([2.78, 0.065, 0.26], [1.65, colH + 0.34, -1.09], materials.darkSteel));
  inner.add(box([2.78, 0.014, 0.22], [1.65, colH + 0.38, -1.09], materials.machine));
  inner.add(box([0.26, 0.065, 1.62], [1.09, colH + 0.34, -1.19], materials.darkSteel));
  inner.add(box([0.22, 0.014, 1.58], [1.09, colH + 0.38, -1.19], materials.machine));
  inner.add(box([0.4, 0.13, 0.2], [0.65, 1.24, -0.54], materials.machineDark));
  inner.add(box([0.32, 0.016, 0.14], [0.65, 1.31, -0.54], materials.steel));
  for (let i = 0; i < 3; i += 1) {
    inner.add(cylinder(0.016, 0.016, 0.042, [0.53 + i * 0.13, 1.22, -0.54], materials.machineLight, 8));
  }

  inner.add(box([0.042, 1.14, 0.042], [0.32, 0.57, -0.3], materials.machineLight));
  const curtainH = box([0.012, 1.06, 0.022], [0.32, 0.57, -0.28], materials.tealGlow);
  const chMat = curtainH.material as THREE.MeshStandardMaterial;
  chMat.transparent = true;
  chMat.opacity = 0.34;
  inner.add(curtainH);
  inner.add(box([0.042, 1.14, 0.042], [0.32, 0.57, -1.22], materials.machineLight));
  const curtainV = box([0.022, 1.06, 0.012], [0.3, 0.57, -1.22], materials.tealGlow);
  const cvMat = curtainV.material as THREE.MeshStandardMaterial;
  cvMat.transparent = true;
  cvMat.opacity = 0.34;
  inner.add(curtainV);

  const makeBeacon = (bx: number, bz: number) => {
    inner.add(cylinder(0.022, 0.026, 0.34, [bx, colH + 0.19, bz], materials.darkSteel, 12));
    const b = cylinder(0.068, 0.068, 0.025, [bx, colH + 0.38, bz], materials.safetyGlass, 18);
    const bMat = b.material as THREE.MeshStandardMaterial;
    bMat.color.setHex(0x4ade80);
    bMat.emissive.setHex(0x22c55e);
    bMat.emissiveIntensity = 0.6;
    bMat.opacity = 0.5;
    inner.add(b);
    beaconMeshes.push(b);
  };
  makeBeacon(0.66, -0.72);
  makeBeacon(3.04, -0.3);
  makeBeacon(0.32, -2.04);

  const assemblyLight = new THREE.PointLight(0x5eead4, 0, 3.8);
  assemblyLight.position.set(1.2, 0.7, -0.72);
  inner.add(assemblyLight);

  inner.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      (child.material as THREE.Material).side = THREE.DoubleSide;
    }
  });

  group.userData.finalAssemblyRig = {
    gantryCarriage,
    gantrySlide,
    robotBaseYaw,
    robotShoulder,
    robotElbow,
    robotWrist,
    robotGripperL,
    robotGripperR,
    workPulses,
    beaconMeshes,
    assemblyLight,
  } satisfies FinalAssemblyRig;

  return group;
}
