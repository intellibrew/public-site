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
  rejectActivity = 0
) {
  const rig = group.userData.qualityCheckRig as QcRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.72, 0.88, progress);
  rig.rejectPusher.position.z = lerp(0.23, -0.19, rejectActivity);

  const beamMat = rig.scanBeam.material as THREE.MeshStandardMaterial;
  beamMat.opacity = (0.12 + scanActivity * 0.42 + rejectActivity * 0.18) * live;
  beamMat.emissiveIntensity = (0.5 + scanActivity * 1.2) * live;

  const greenMat = rig.greenLamp.material as THREE.MeshStandardMaterial;
  greenMat.emissiveIntensity = (0.25 + scanActivity * 1.4) * live * (1 - rejectActivity * 0.65);
  greenMat.opacity = (0.28 + scanActivity * 0.48) * live * (1 - rejectActivity * 0.5);

  const redMat = rig.redLamp.material as THREE.MeshStandardMaterial;
  redMat.emissiveIntensity = (0.35 + rejectActivity * 2.4) * live;
  redMat.opacity = (0.2 + rejectActivity * 0.68) * live;

  rig.rejectLight.intensity = rejectActivity * 1.6 * live;

  if (rig.branchPulse) {
    const branchMat = rig.branchPulse.material as THREE.MeshStandardMaterial;
    branchMat.opacity = rejectActivity * 0.42 * live;
    branchMat.emissiveIntensity = rejectActivity * 1.5 * live;
  }
}

export function buildQualityCheck(materials: Materials) {
  const qcStation = prepGroup(new THREE.Group());
  qcStation.userData.stationId = "qualityCheck";

  qcStation.add(box([0.82, 0.036, 0.52], [0, 0.224, 0], materials.machineDark, false));
  qcStation.add(box([0.7, 0.01, 0.4], [0, 0.248, 0], materials.zone, false));
  qcStation.add(box([0.055, 0.72, 0.055], [-0.38, 0.58, -0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [-0.38, 0.58, 0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [0.38, 0.58, -0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [0.38, 0.58, 0.24], materials.machineDark));
  qcStation.add(box([0.86, 0.07, 0.08], [0, 0.94, -0.24], materials.darkSteel));
  qcStation.add(box([0.86, 0.07, 0.08], [0, 0.94, 0.24], materials.darkSteel));
  qcStation.add(box([0.09, 0.07, 0.56], [-0.38, 0.94, 0], materials.darkSteel));
  qcStation.add(box([0.09, 0.07, 0.56], [0.38, 0.94, 0], materials.darkSteel));
  qcStation.add(box([0.68, 0.014, 0.026], [0, 0.99, -0.24], materials.tealGlow));
  qcStation.add(box([0.68, 0.014, 0.026], [0, 0.99, 0.24], materials.tealGlow));

  qcStation.add(box([0.32, 0.18, 0.28], [0, 0.79, 0], materials.machine));
  qcStation.add(box([0.22, 0.06, 0.22], [0, 0.67, 0], materials.darkSteel));
  const qcLens = cylinder(0.04, 0.045, 0.07, [0, 0.62, 0], materials.glass, 14);
  qcLens.rotation.x = Math.PI / 2;
  qcStation.add(qcLens);

  const scanBeam = box([0.62, 0.012, 0.44], [0, 0.48, 0], materials.tealGlow, false);
  const scanBeamMat = scanBeam.material as THREE.MeshStandardMaterial;
  scanBeamMat.transparent = true;
  scanBeamMat.opacity = 0.14;
  scanBeamMat.emissiveIntensity = 0.5;
  qcStation.add(scanBeam);

  qcStation.add(box([0.04, 0.42, 0.04], [0.48, 0.82, 0.24], materials.darkSteel));
  const greenLamp = cylinder(0.046, 0.046, 0.04, [0.48, 1.04, 0.24], materials.paintGreen, 16);
  const redLamp = cylinder(0.046, 0.046, 0.04, [0.48, 1.1, 0.24], materials.redLight, 16);
  const greenLampMat = greenLamp.material as THREE.MeshStandardMaterial;
  const redLampMat = redLamp.material as THREE.MeshStandardMaterial;
  greenLampMat.transparent = true;
  redLampMat.transparent = true;
  greenLampMat.opacity = 0.42;
  redLampMat.opacity = 0.22;
  qcStation.add(greenLamp, redLamp);

  qcStation.add(box([0.32, 0.38, 0.16], [-0.42, 0.39, 0.34], materials.machineDark));
  qcStation.add(box([0.24, 0.1, 0.12], [-0.42, 0.52, 0.24], materials.machineLight));

  const rejectPusher = new THREE.Group();
  rejectPusher.position.set(-0.2, 0.29, 0.23);
  rejectPusher.add(box([0.36, 0.07, 0.06], [0, 0, 0], materials.steel));
  rejectPusher.add(box([0.46, 0.18, 0.045], [0, 0.02, -0.08], materials.warning));
  rejectPusher.add(box([0.38, 0.016, 0.02], [0, 0.12, -0.106], materials.darkSteel));
  qcStation.add(rejectPusher);
  qcStation.add(box([0.12, 0.08, 0.38], [-0.42, 0.3, 0.07], materials.darkSteel));

  qcStation.add(box([0.036, 0.42, 0.42], [0.53, 0.45, -0.02], materials.machineLight));
  const guardPanel = box([0.012, 0.34, 0.36], [0.552, 0.45, -0.02], materials.safetyGlass, false);
  const guardMat = guardPanel.material as THREE.MeshStandardMaterial;
  guardMat.opacity = 0.22;
  qcStation.add(guardPanel);
  qcStation.add(box([0.26, 0.48, 0.18], [0.64, 0.34, -0.3], materials.machineDark));
  qcStation.add(box([0.17, 0.12, 0.026], [0.64, 0.43, -0.392], materials.glass));
  qcStation.add(box([0.13, 0.012, 0.024], [0.64, 0.34, -0.394], materials.tealGlow));
  qcStation.add(cylinder(0.026, 0.026, 0.034, [0.58, 0.25, -0.394], materials.redLight, 12));
  qcStation.add(cylinder(0.022, 0.022, 0.034, [0.66, 0.25, -0.394], materials.paintGreen, 12));

  const rejectLight = new THREE.PointLight(0xef4444, 0, 1.4);
  rejectLight.position.set(0, 0.48, -0.24);
  qcStation.add(rejectLight);

  qcStation.userData.qualityCheckRig = {
    rejectPusher,
    scanBeam,
    greenLamp,
    redLamp,
    rejectLight,
  } satisfies QcRig;

  return qcStation;
}
