import * as THREE from "three";
import { box, line, lineSegments } from "./mesh";
import { prepGroup } from "./reveal";
import type { Materials } from "./materials";

export function buildFloor(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  group.userData.buildFromScale = 0.58;
  group.userData.buildFromLift = 0.44;

  const hallWidth = 13.9;
  const hallDepth = 8.9;
  group.add(box([hallWidth, 0.1, hallDepth], [0, -0.05, 0], materials.floor, false));
  group.add(box([11.6, 0.022, 7.05], [0.2, 0.018, 0.05], materials.floorInset, false));
  group.add(box([12.9, 0.09, 0.1], [0, 0.035, 3.78], materials.darkSteel, false));
  group.add(box([0.1, 0.09, 7.7], [5.95, 0.035, 0], materials.darkSteel, false));
  group.add(box([13.05, 0.11, 0.12], [0, 0.065, -3.78], materials.darkSteel, false));
  group.add(box([0.12, 0.11, 7.88], [-5.95, 0.065, 0], materials.darkSteel, false));

  group.add(box([0.72, 0.006, 6.4], [0.35, 0.024, 0.05], materials.floorInset, false));

  group.add(box([13.2, 0.05, 0.06], [0, 0.028, -3.72], materials.darkSteel, false));
  group.add(box([0.06, 0.05, 8.0], [-6.72, 0.028, 0], materials.darkSteel, false));
  group.add(box([0.06, 0.05, 8.0], [6.72, 0.028, 0], materials.darkSteel, false));

  const minorPoints: THREE.Vector3[] = [];
  const majorPoints: THREE.Vector3[] = [];
  const width = 11.9;
  const depth = 7.2;
  const y = 0.045;

  for (let i = 0; i <= 30; i += 1) {
    const x = -width / 2 + (width / 30) * i;
    const target = i % 5 === 0 ? majorPoints : minorPoints;
    target.push(new THREE.Vector3(x, y, -depth / 2), new THREE.Vector3(x, y, depth / 2));
  }

  for (let i = 0; i <= 18; i += 1) {
    const z = -depth / 2 + (depth / 18) * i;
    const target = i % 3 === 0 ? majorPoints : minorPoints;
    target.push(new THREE.Vector3(-width / 2, y, z), new THREE.Vector3(width / 2, y, z));
  }

  group.add(lineSegments(minorPoints, 0x1b6f70, 0.2));
  group.add(lineSegments(majorPoints, 0x5eead4, 0.34));

  const boundaryY = 0.06;
  group.add(
    line(
      [
        new THREE.Vector3(-5.15, boundaryY, -3.15),
        new THREE.Vector3(5.15, boundaryY, -3.15),
        new THREE.Vector3(5.15, boundaryY, 3.15),
        new THREE.Vector3(-5.15, boundaryY, 3.15),
        new THREE.Vector3(-5.15, boundaryY, -3.15),
      ],
      0x5eead4,
      0.82
    )
  );

  return group;
}

export function buildShell(materials: Materials) {
  const group = prepGroup(new THREE.Group());

  const wallHeight = 2.78;
  const wallMidY = wallHeight / 2;
  const wallThickness = 0.12;
  const backZ = -4.28;
  const leftX = -6.9;

  group.add(box([13.9, wallHeight, wallThickness], [0, wallMidY, backZ], materials.wall, false));
  group.add(box([wallThickness, wallHeight, 8.9], [leftX, wallMidY, 0], materials.wall, false));

  group.add(box([13.4, 0.08, 0.08], [0, 0.04, backZ + 0.08], materials.darkSteel, false));
  group.add(box([0.08, 0.08, 8.6], [leftX + 0.08, 0.04, 0], materials.darkSteel, false));

  group.add(box([0.18, wallHeight, 0.18], [leftX + 0.04, wallMidY, backZ + 0.04], materials.darkSteel, false));

  group.add(box([13.2, 0.06, 0.14], [0, wallHeight - 0.03, backZ + 0.02], materials.darkSteel, false));
  group.add(box([0.14, 0.06, 8.2], [leftX + 0.02, wallHeight - 0.03, 0], materials.darkSteel, false));

  for (let y = 0.55; y <= 2.35; y += 0.62) {
    group.add(box([13.1, 0.018, 0.04], [0, y, backZ + 0.08], materials.darkSteel, false));
  }

  for (let x = -5.9; x <= 5.9; x += 2.35) {
    group.add(box([0.1, wallHeight, 0.16], [x, wallMidY, backZ + 0.08], materials.darkSteel, false));
  }

  for (let z = -3.65; z <= 3.65; z += 1.85) {
    group.add(box([0.16, wallHeight, 0.1], [leftX + 0.06, wallMidY, z], materials.darkSteel, false));
  }

  for (let x = -4.8; x <= 4.8; x += 1.6) {
    const windowPane = box([1.05, 0.72, 0.045], [x, 1.92, backZ + 0.1], materials.safetyGlass, false);
    const windowMat = windowPane.material as THREE.MeshStandardMaterial;
    windowMat.opacity = 0.22;
    windowMat.emissive.setHex(0x5eead4);
    windowMat.emissiveIntensity = 0.06;
    group.add(windowPane);
    group.add(box([1.08, 0.028, 0.02], [x, 1.55, backZ + 0.12], materials.darkSteel, false));
  }

  group.add(box([0.035, 1.35, 1.65], [leftX + 0.04, 0.84, -2.65], materials.machineDark, false));
  group.add(box([0.035, 1.35, 1.62], [leftX + 0.04, 0.84, -0.35], materials.machineDark, false));
  group.add(box([0.03, 0.88, 0.52], [leftX + 0.05, 0.52, 2.6], materials.machineLight, false));
  group.add(box([0.03, 0.08, 0.56], [leftX + 0.04, 0.96, 2.6], materials.darkSteel, false));

  group.userData.overheadLights = [] as THREE.PointLight[];
  group.userData.overheadLenses = [] as THREE.MeshStandardMaterial[];

  return group;
}
