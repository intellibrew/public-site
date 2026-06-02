import * as THREE from "three";
import { smoothstep } from "../math";
import { box, cylinder, sphere, torus, beltTurnQuarter, prepareBeltMaterial } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, makeProduct, PRODUCT_SHAPE_CUBE } from "../products";
import { subAssemblyPickPlacePhase } from "../stationMotion";
import type { SubAssemblyRig } from "../types";
import { machineLiveMultiplier } from "../flowOptimization";
import { stationAnimationTime } from "../flowAnimation";

export function tickSubAssembly(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.subAssemblyRig as SubAssemblyRig | undefined;
  if (!rig) return;

  const baseLive = smoothstep(0.78, 0.95, progress);
  const live = machineLiveMultiplier(baseLive, "subAssembly");
  const animMs = stationAnimationTime(group, elapsedMs, "subAssembly", baseLive);
  const pose = subAssemblyPickPlacePhase(animMs * 0.0002);

  rig.baseYaw.rotation.y = pose.yaw * live;
  rig.shoulder.rotation.z = pose.shoulder * live;
  rig.elbow.rotation.z = pose.elbow * live;
  rig.wrist.rotation.z = pose.wrist * live;

  rig.gripperLeft.position.z = pose.grip * live;
  rig.gripperRight.position.z = -pose.grip * live;

  rig.transferPart.visible = pose.carry > 0.5 && live > 0.08;
  rig.transferPart.scale.setScalar(0.88 + pose.carry * 0.18 * live);

  const sourceActive = 1 - smoothstep(0.18, 0.42, pose.carry);
  const targetActive = smoothstep(0.55, 0.82, pose.carry);
  const sourceMat = rig.sourcePulse.material as THREE.MeshStandardMaterial;
  const targetMat = rig.targetPulse.material as THREE.MeshStandardMaterial;
  sourceMat.opacity = (0.12 + sourceActive * 0.38) * live;
  sourceMat.emissiveIntensity = sourceActive * 1.1 * live;
  targetMat.opacity = (0.1 + targetActive * 0.42) * live;
  targetMat.emissiveIntensity = targetActive * 1.2 * live;
}

export function buildSubAssembly(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { subAssemblyStation } = LAYOUT;
  const anchor = layoutPoint(subAssemblyStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = subAssemblyStation.angle;
  group.scale.setScalar(subAssemblyStation.scale);

  const beltY = 0.178;
  const armLen = 0.86;
  const beltW = 0.22;
  const cornerR = beltW * 0.54;
  const legLen = armLen - cornerR;
  const beltMat = prepareBeltMaterial(materials.belt, 2.2, 1.6);

  group.add(box([0.36, 0.028, 0.36], [0, 0.03, 0], materials.machineDark, false));
  group.add(box([0.3, 0.012, 0.3], [0, 0.052, 0], materials.zone, false));

  const zLeg = box([beltW, 0.016, legLen], [0, beltY, cornerR + legLen * 0.5], beltMat, false);
  const xLeg = box([legLen, 0.016, beltW], [-(cornerR + legLen * 0.5), beltY, 0], beltMat, false);
  const cornerBelt = beltTurnQuarter(cornerR, beltW, 0.016, [0, beltY, 0], beltMat);
  group.add(zLeg, xLeg, cornerBelt);

  group.add(box([beltW * 0.92, 0.008, 0.032], [0, beltY + 0.012, cornerR + legLen * 0.5], materials.darkSteel, false));
  group.add(
    box([0.032, 0.008, beltW * 0.92], [-(cornerR + legLen * 0.5), beltY + 0.012, 0], materials.darkSteel, false)
  );

  const cornerDeck = cylinder(cornerR * 0.92, cornerR * 0.98, 0.008, [0, beltY - 0.004, 0], materials.machineDark, 36);
  group.add(cornerDeck);

  const cornerRim = cylinder(cornerR * 1.02, cornerR * 1.04, 0.006, [0, beltY + 0.013, 0], materials.darkSteel, 36);
  group.add(cornerRim);

  group.add(cylinder(0.3, 0.33, 0.12, [0, 0.06, 0], materials.darkSteel, 30));
  group.add(cylinder(0.2, 0.22, 0.22, [0, 0.23, 0], materials.machineDark, 28));
  group.add(box([0.34, 0.03, 0.34], [0, 0.34, 0], materials.machineLight));

  const sourceTray = box([0.2, 0.05, 0.16], [0, beltY + 0.03, armLen + 0.06], materials.machineLight);
  const targetTray = box([0.16, 0.05, 0.2], [-armLen - 0.06, beltY + 0.03, 0], materials.machineLight);
  group.add(sourceTray, targetTray);
  group.add(box([0.16, 0.014, 0.12], [0, beltY + 0.038, armLen + 0.06], materials.steel));
  group.add(box([0.12, 0.014, 0.16], [-armLen - 0.06, beltY + 0.038, 0], materials.steel));

  const sourcePulse = cylinder(0.08, 0.08, 0.012, [0, beltY + 0.01, armLen - 0.08], materials.safetyGlass, 16);
  const targetPulse = cylinder(0.08, 0.08, 0.012, [-armLen + 0.08, beltY + 0.01, 0], materials.safetyGlass, 16);
  const sourcePulseMat = sourcePulse.material as THREE.MeshStandardMaterial;
  const targetPulseMat = targetPulse.material as THREE.MeshStandardMaterial;
  sourcePulseMat.opacity = 0.24;
  targetPulseMat.opacity = 0.18;
  group.add(sourcePulse, targetPulse);

  const armMount = new THREE.Group();
  armMount.position.set(0, 0.45, 0);
  armMount.rotation.y = Math.PI;
  group.add(armMount);

  const baseYaw = new THREE.Group();
  armMount.add(baseYaw);
  baseYaw.add(cylinder(0.16, 0.18, 0.1, [0, -0.05, 0], materials.darkSteel, 24));
  baseYaw.add(cylinder(0.14, 0.16, 0.18, [0, 0.02, 0], materials.orange, 24));
  baseYaw.add(cylinder(0.11, 0.12, 0.05, [0, 0.13, 0], materials.machineLight, 20));
  baseYaw.add(box([0.08, 0.04, 0.08], [0.1, 0.12, 0], materials.darkSteel));
  baseYaw.add(cylinder(0.014, 0.014, 0.014, [0.12, 0.16, 0.04], materials.paintGreen, 10));

  const shoulder = new THREE.Group();
  shoulder.position.set(0.08, 0.09, 0);
  shoulder.rotation.z = -0.72;
  baseYaw.add(shoulder);
  shoulder.add(sphere(0.09, [0, 0, 0], materials.machineLight));
  shoulder.add(cylinder(0.08, 0.09, 0.05, [0, 0, 0], materials.steel, 16));
  shoulder.add(box([0.44, 0.12, 0.13], [0.22, 0, 0], materials.orange));
  shoulder.add(box([0.38, 0.06, 0.1], [0.19, 0.025, 0], materials.machineLight));
  shoulder.add(box([0.05, 0.14, 0.07], [0.08, -0.02, 0], materials.darkSteel));

  const elbow = new THREE.Group();
  elbow.position.set(0.44, 0, 0);
  elbow.rotation.z = 1.06;
  shoulder.add(elbow);
  elbow.add(sphere(0.082, [0, 0, 0], materials.machineLight));
  elbow.add(cylinder(0.07, 0.078, 0.045, [0, 0, 0], materials.steel, 16));
  elbow.add(box([0.36, 0.1, 0.1], [0.18, 0, 0], materials.orange));
  elbow.add(box([0.06, 0.16, 0.06], [0.08, 0.02, 0], materials.darkSteel));
  const elbowC = torus(0.11, 0.022, Math.PI * 1.35, [0.1, 0.01, 0], materials.steel, 12, 24);
  elbowC.rotation.y = Math.PI / 2;
  elbow.add(elbowC);

  const wrist = new THREE.Group();
  wrist.position.set(0.36, 0, 0);
  wrist.rotation.z = -0.2;
  elbow.add(wrist);
  wrist.add(cylinder(0.055, 0.065, 0.14, [0.08, 0, 0], materials.machineDark, 16));
  wrist.add(box([0.1, 0.04, 0.08], [0.18, 0, 0], materials.machineLight));
  wrist.add(box([0.08, 0.05, 0.1], [0.27, -0.02, 0], materials.darkSteel));
  const gripperLeft = box([0.028, 0.12, 0.022], [0.32, -0.04, 0.058], materials.steel);
  const gripperRight = box([0.028, 0.12, 0.022], [0.32, -0.04, -0.058], materials.steel);
  wrist.add(gripperLeft, gripperRight);
  wrist.add(box([0.018, 0.04, 0.014], [0.33, -0.1, 0.058], materials.machineLight));
  wrist.add(box([0.018, 0.04, 0.014], [0.33, -0.1, -0.058], materials.machineLight));
  wrist.add(cylinder(0.012, 0.012, 0.012, [0.24, 0, 0], materials.steel, 8));

  const transferPart = makeProduct(materials.enamel, [0.32, -0.02, 0]);
  applyProductShape(transferPart, PRODUCT_SHAPE_CUBE);
  transferPart.visible = false;
  wrist.add(transferPart);

  group.add(box([0.18, 0.42, 0.18], [0.34, 0.21, 0.58], materials.machineDark));
  group.add(box([0.13, 0.1, 0.03], [0.34, 0.35, 0.68], materials.glass));
  group.add(box([0.04, 0.52, 0.04], [-0.58, 0.28, -0.18], materials.machineDark));
  const guardPanel = box([0.012, 0.42, 0.28], [-0.6, 0.28, -0.18], materials.safetyGlass, false);
  const guardMat = guardPanel.material as THREE.MeshStandardMaterial;
  guardMat.opacity = 0.18;
  group.add(guardPanel);

  group.userData.subAssemblyRig = {
    baseYaw,
    shoulder,
    elbow,
    wrist,
    gripperLeft,
    gripperRight,
    transferPart,
    sourcePulse,
    targetPulse,
  } satisfies SubAssemblyRig;

  return group;
}
