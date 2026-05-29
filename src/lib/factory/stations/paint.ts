import * as THREE from "three";
import { smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import type { PaintBoothRig } from "../types";

export function tickPaintBooth(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.paintRig as PaintBoothRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.89, 0.99, progress);
  const phase = elapsedMs * 0.00088;
  const sprayPulse = (Math.sin(phase * 2.6) * 0.5 + 0.5) * live;
  const flicker = (Math.sin(phase * 21) * 0.28 + Math.sin(phase * 37 + 1.1) * 0.18 + 0.54);

  rig.sprayNozzles.forEach((cone, index) => {
    const coneMat = cone.material as THREE.MeshStandardMaterial;
    const wave = Math.sin(phase * 4.2 + index * 0.45) * 0.5 + 0.5;
    coneMat.opacity = (0.06 + wave * 0.28 + sprayPulse * 0.14) * live;
    coneMat.emissiveIntensity = (0.18 + wave * 0.9 + sprayPulse * 0.4) * live;
    cone.scale.y = 0.55 + wave * 0.7 * live;
  });

  rig.sprayLight.intensity = (0.22 + sprayPulse * 1.65 + flicker * 0.45) * live;

  const uvMat = rig.uvBar.material as THREE.MeshStandardMaterial;
  uvMat.emissiveIntensity = (1.4 + Math.sin(phase * 3.8) * 0.5) * live;

  const beaconMat = rig.beacon.material as THREE.MeshStandardMaterial;
  beaconMat.opacity = (0.24 + sprayPulse * 0.52) * live;
  beaconMat.emissiveIntensity = (0.28 + sprayPulse * 1.4) * live;
  rig.beacon.scale.setScalar(0.88 + sprayPulse * 0.22);
}

export function buildPaintBooth(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { paintBoothStation } = LAYOUT;
  const anchor = layoutPoint(paintBoothStation.anchor);
  group.position.set(anchor.x, 0, anchor.z);
  group.rotation.y = paintBoothStation.angle;
  group.scale.setScalar(paintBoothStation.scale);

  const conveyorPoint = layoutPoint({ x: paintBoothStation.anchor.x, y: 52 });
  const cz = (conveyorPoint.z - anchor.z) / paintBoothStation.scale;

  group.add(box([2.22, 0.034, 1.62], [0, 0.025, cz], materials.machineDark, false));
  group.add(box([1.94, 0.014, 1.36], [0, 0.048, cz], materials.zone, false));
  group.add(box([1.74, 0.008, 0.08], [0, 0.062, cz], materials.darkSteel, false));
  group.add(box([1.78, 0.01, 0.038], [0, 0.068, cz - 0.64], materials.paintGreen, false));
  group.add(box([1.78, 0.01, 0.038], [0, 0.068, cz + 0.64], materials.paintGreen, false));

  const colH = 1.62;
  const colW = 0.22;
  const colZ = [-0.08, 1.22] as const;
  const colX = [-0.76, 0.76] as const;
  colX.forEach((cx) => {
    colZ.forEach((czt) => {
      group.add(box([colW, colH, colW], [cx, colH / 2, czt], materials.machineDark));
      group.add(box([colW + 0.042, 0.022, colW + 0.042], [cx, 0.14, czt], materials.tealGlow));
      group.add(box([colW + 0.042, 0.022, colW + 0.042], [cx, colH - 0.12, czt], materials.tealGlow));
      const ledStrip = box([0.016, colH * 0.72, 0.012], [cx + (cx < 0 ? 0.115 : -0.115), colH * 0.5, czt], materials.paintGreen);
      const ledMat = ledStrip.material as THREE.MeshStandardMaterial;
      ledMat.opacity = 0.72;
      group.add(ledStrip);
    });
  });

  group.add(box([1.78, 0.19, 0.26], [0, colH + 0.1, colZ[0]], materials.machineDark));
  group.add(box([1.78, 0.19, 0.26], [0, colH + 0.1, colZ[1]], materials.machineDark));
  group.add(box([0.26, 0.19, 1.58], [colX[0], colH + 0.1, cz], materials.machineDark));
  group.add(box([0.26, 0.19, 1.58], [colX[1], colH + 0.1, cz], materials.machineDark));
  group.add(box([1.58, 0.018, 0.024], [0, colH + 0.2, colZ[0] + 0.14], materials.tealGlow));
  group.add(box([1.58, 0.018, 0.024], [0, colH + 0.2, colZ[1] - 0.14], materials.tealGlow));

  const manifold = cylinder(0.042, 0.042, 1.62, [0, 1.52, cz], materials.steel, 12);
  manifold.rotation.z = Math.PI / 2;
  group.add(manifold);
  group.add(box([1.62, 0.07, 0.07], [0, 1.52, cz], materials.darkSteel));
  const supplyPipe = cylinder(0.028, 0.028, 0.48, [0, 1.52, cz - 0.28], materials.steel, 10);
  supplyPipe.rotation.x = Math.PI / 2;
  group.add(supplyPipe);
  group.add(box([1.44, 0.014, 0.08], [0, 1.56, cz], materials.paintGreen));

  const sprayNozzles: THREE.Mesh[] = [];
  for (let i = -3; i <= 3; i += 1) {
    const nx = i * 0.22;
    group.add(cylinder(0.016, 0.012, 0.18, [nx, 1.38, cz], materials.steel, 8));
    const tip = cylinder(0.038, 0.013, 0.042, [nx, 1.27, cz], materials.machineLight, 10);
    group.add(tip);
    const cone = cylinder(0.01, 0.13, 0.46, [nx, 1.01, cz], materials.paintGreen, 10);
    const coneMat = cone.material as THREE.MeshStandardMaterial;
    coneMat.transparent = true;
    coneMat.opacity = 0.18;
    coneMat.emissiveIntensity = 0.55;
    sprayNozzles.push(cone);
    group.add(cone);
  }

  const uvBar = box([1.52, 0.032, 0.028], [0, 1.3, cz], materials.tealGlow);
  const uvBarMat = uvBar.material as THREE.MeshStandardMaterial;
  uvBarMat.color.setHex(0x86efac);
  uvBarMat.emissive.setHex(0x4ade80);
  uvBarMat.emissiveIntensity = 1.8;
  group.add(uvBar);

  [-0.76, 0.76].forEach((sx) => {
    const armDir = sx < 0 ? 1 : -1;
    const sideArm = cylinder(0.022, 0.022, 0.56, [sx + armDir * 0.28, 0.82, cz], materials.steel, 8);
    sideArm.rotation.x = Math.PI / 2;
    group.add(sideArm);
    const sideNozzle = cylinder(0.032, 0.012, 0.08, [sx, 0.82, cz], materials.machineLight, 8);
    sideNozzle.rotation.z = sx < 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(sideNozzle);
  });

  [-0.3, 0.3].forEach((sx) => {
    group.add(cylinder(0.082, 0.098, 0.48, [sx, colH + 0.44, cz], materials.machineDark, 12));
    const fanCap = cylinder(0.13, 0.13, 0.038, [sx, colH + 0.7, cz], materials.steel, 14);
    group.add(fanCap);
    const exhaustRing = cylinder(0.096, 0.096, 0.008, [sx, colH + 0.69, cz], materials.paintGreen, 14);
    const exMat = exhaustRing.material as THREE.MeshStandardMaterial;
    exMat.opacity = 0.55;
    group.add(exhaustRing);
  });

  group.add(box([0.38, 0.72, 0.28], [1.02, 0.38, cz + 0.08], materials.machineDark));
  group.add(box([0.28, 0.25, 0.038], [1.02, 0.48, cz + 0.23], materials.glass));
  group.add(box([0.26, 0.018, 0.036], [1.02, 0.39, cz + 0.23], materials.tealGlow));
  const indicator = box([0.072, 0.072, 0.038], [0.88, 0.6, cz + 0.23], materials.paintGreen);
  const indMat = indicator.material as THREE.MeshStandardMaterial;
  indMat.opacity = 1;
  indMat.emissiveIntensity = 1.2;
  group.add(indicator);
  for (let i = 0; i < 3; i += 1) {
    group.add(box([0.038, 0.038, 0.028], [1.02 + (i - 1) * 0.06, 0.32, cz + 0.232], i === 1 ? materials.warning : materials.machineLight));
  }

  const sprayLight = new THREE.PointLight(0x4ade80, 0, 3.2);
  sprayLight.position.set(0, 0.88, cz);
  group.add(sprayLight);

  const beacon = cylinder(0.072, 0.072, 0.022, [0, colH + 0.26, cz], materials.safetyGlass, 16);
  const beaconMat = beacon.material as THREE.MeshStandardMaterial;
  beaconMat.color.setHex(0x4ade80);
  beaconMat.emissive.setHex(0x22c55e);
  beaconMat.emissiveIntensity = 0.6;
  beaconMat.opacity = 0.52;
  group.add(beacon);

  group.userData.paintRig = {
    sprayNozzles,
    sprayLight,
    uvBar,
    beacon,
  } satisfies PaintBoothRig;

  return group;
}
