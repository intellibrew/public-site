import * as THREE from "three";
import { box, line, lineSegments } from "./mesh";
import { prepGroup } from "./reveal";
import type { Materials } from "./materials";
import { FLOOR_GRID_CELL } from "./materials";
import { tagShellWallMesh } from "./shellWalls";
import { buildPowerSubstation } from "./powerSubstation";

function addFloorGrid(
  group: THREE.Group,
  halfW: number,
  halfD: number,
  y: number,
  majorEvery = 5
) {
  const width = halfW * 2;
  const depth = halfD * 2;
  const cellsX = Math.round(width / FLOOR_GRID_CELL);
  const cellsZ = Math.round(depth / FLOOR_GRID_CELL);
  const minorPoints: THREE.Vector3[] = [];
  const majorPoints: THREE.Vector3[] = [];

  for (let i = 0; i <= cellsX; i += 1) {
    const x = -halfW + (width / cellsX) * i;
    const target = i % majorEvery === 0 ? majorPoints : minorPoints;
    target.push(new THREE.Vector3(x, y, -halfD), new THREE.Vector3(x, y, halfD));
  }

  for (let i = 0; i <= cellsZ; i += 1) {
    const z = -halfD + (depth / cellsZ) * i;
    const target = i % majorEvery === 0 ? majorPoints : minorPoints;
    target.push(new THREE.Vector3(-halfW, y, z), new THREE.Vector3(halfW, y, z));
  }

  group.add(lineSegments(minorPoints, 0x1a7f74, 0.3));
  group.add(lineSegments(majorPoints, 0x5eead4, 0.48));
}

function addTrimFrame(
  group: THREE.Group,
  halfW: number,
  halfD: number,
  material: THREE.Material,
  height: number,
  lift: number,
  thickness: number
) {
  const y = lift + height / 2;
  const spanD = halfD * 2 - thickness * 2;

  group.add(box([halfW * 2, height, thickness], [0, y, halfD - thickness / 2], material, false));
  group.add(box([halfW * 2, height, thickness], [0, y, -halfD + thickness / 2], material, false));
  group.add(box([thickness, height, spanD], [halfW - thickness / 2, y, 0], material, false));
  group.add(box([thickness, height, spanD], [-halfW + thickness / 2, y, 0], material, false));
}

export function buildFloor(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  group.userData.buildFromLift = 0.44;

  const hallWidth = 13.9;
  const hallDepth = 8.9;

  const gridWidth = Math.round(11.9 / FLOOR_GRID_CELL) * FLOOR_GRID_CELL;
  const gridDepth = Math.round(7.2 / FLOOR_GRID_CELL) * FLOOR_GRID_CELL;
  const gridHalfW = gridWidth / 2;
  const gridHalfD = gridDepth / 2;

  group.add(box([hallWidth, 0.1, hallDepth], [0, -0.05, 0], materials.floor, false));
  group.add(box([11.6, 0.022, 7.05], [0.2, 0.018, 0.05], materials.floorInset, false));
  group.add(box([0.72, 0.006, 6.4], [0.35, 0.024, 0.05], materials.floorInset, false));

  addTrimFrame(group, gridHalfW, gridHalfD, materials.darkSteel, 0.1, 0.035, 0.12);

  const outerHalfW = hallWidth / 2 - 0.05;
  const outerHalfD = hallDepth / 2 - 0.05;
  addTrimFrame(group, outerHalfW, outerHalfD, materials.darkSteel, 0.05, 0.028, 0.06);

  addFloorGrid(group, gridHalfW, gridHalfD, 0.045);

  const boundaryY = 0.048;
  group.add(
    line(
      [
        new THREE.Vector3(-gridHalfW, boundaryY, -gridHalfD),
        new THREE.Vector3(gridHalfW, boundaryY, -gridHalfD),
        new THREE.Vector3(gridHalfW, boundaryY, gridHalfD),
        new THREE.Vector3(-gridHalfW, boundaryY, gridHalfD),
        new THREE.Vector3(-gridHalfW, boundaryY, -gridHalfD),
      ],
      0x5eead4,
      0.42
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

  group.add(
    tagShellWallMesh(
      box([13.9, wallHeight, wallThickness], [0, wallMidY, backZ], materials.wall, false),
      "back",
      "wall"
    )
  );
  group.add(
    tagShellWallMesh(
      box([wallThickness, wallHeight, 8.9], [leftX, wallMidY, 0], materials.wall, false),
      "left",
      "wall"
    )
  );

  for (const y of [0.62, 1.26]) {
    for (let x = -5.6; x <= 5.6; x += 2.36) {
      group.add(
        tagShellWallMesh(
          box([1.82, 0.62, 0.028], [x, y, backZ + 0.076], materials.wallPanel, false),
          "back",
          "wall"
        )
      );
    }
  }

  for (const y of [0.62, 1.26]) {
    for (let z = -3.42; z <= 3.42; z += 1.7) {
      group.add(
        tagShellWallMesh(
          box([0.028, 0.62, 1.16], [leftX + 0.076, y, z], materials.wallPanel, false),
          "left",
          "wall"
        )
      );
    }
  }

  group.add(
    tagShellWallMesh(
      box([13.4, 0.08, 0.08], [0, 0.04, backZ + 0.08], materials.darkSteel, false),
      "back",
      "trim"
    )
  );
  group.add(
    tagShellWallMesh(
      box([0.08, 0.08, 8.6], [leftX + 0.08, 0.04, 0], materials.darkSteel, false),
      "left",
      "trim"
    )
  );

  group.add(
    tagShellWallMesh(
      box([0.18, wallHeight, 0.18], [leftX + 0.04, wallMidY, backZ + 0.04], materials.darkSteel, false),
      "corner",
      "trim"
    )
  );

  const cornerSpine = tagShellWallMesh(
    box([0.045, wallHeight - 0.2, 0.045], [leftX + 0.09, wallMidY, backZ + 0.09], materials.tealGlow, false),
    "corner",
    "trim"
  );
  const cornerSpineMat = cornerSpine.material as THREE.MeshStandardMaterial;
  cornerSpineMat.emissiveIntensity = 0.22;
  cornerSpineMat.roughness = 0.28;
  group.add(cornerSpine);

  group.add(
    tagShellWallMesh(
      box([13.2, 0.06, 0.14], [0, wallHeight - 0.03, backZ + 0.02], materials.darkSteel, false),
      "back",
      "trim"
    )
  );
  group.add(
    tagShellWallMesh(
      box([0.14, 0.06, 8.2], [leftX + 0.02, wallHeight - 0.03, 0], materials.darkSteel, false),
      "left",
      "trim"
    )
  );

  for (let y = 0.55; y <= 2.35; y += 0.62) {
    group.add(
      tagShellWallMesh(
        box([13.1, 0.018, 0.04], [0, y, backZ + 0.08], materials.darkSteel, false),
        "back",
        "trim"
      )
    );
  }

  for (let x = -5.9; x <= 5.9; x += 2.35) {
    group.add(
      tagShellWallMesh(
        box([0.1, wallHeight, 0.16], [x, wallMidY, backZ + 0.08], materials.darkSteel, false),
        "back",
        "trim"
      )
    );
  }

  for (let z = -3.65; z <= 3.65; z += 1.85) {
    group.add(
      tagShellWallMesh(
        box([0.16, wallHeight, 0.1], [leftX + 0.06, wallMidY, z], materials.darkSteel, false),
        "left",
        "trim"
      )
    );
  }

  const substation = buildPowerSubstation(materials, backZ);
  group.add(substation);
  group.userData.powerSubstationGroup = substation;

  group.userData.overheadLights = [] as THREE.PointLight[];
  group.userData.overheadLenses = [] as THREE.MeshStandardMaterial[];

  return group;
}
