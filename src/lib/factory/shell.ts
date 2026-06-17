import * as THREE from "three";
import { box, cylinder, line, lineSegments } from "./mesh";
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

function markKeepDuringPlacement(group: THREE.Group) {
  group.userData.keepDuringPlacementDetails = true;
  group.traverse((object) => {
    object.userData.keepDuringPlacementDetails = true;
  });
}

function buildControlRoom(materials: Materials) {
  const room = new THREE.Group();
  room.name = "right-wall-control-room";
  room.position.set(6.18, 0, 1.18);
  room.rotation.y = -Math.PI / 2;

  const width = 2.18;
  const depth = 1.18;
  const height = 1.52;
  const floorY = 0.075;
  const glassY = floorY + height / 2;
  const glassT = 0.025;
  const halfW = width / 2;
  const halfD = depth / 2;
  const frameT = 0.055;

  const glassMat = materials.safetyGlass.clone() as THREE.MeshStandardMaterial;
  glassMat.color.setHex(0x7ddfd8);
  glassMat.emissive.setHex(0x0f766e);
  glassMat.emissiveIntensity = 0.08;
  glassMat.opacity = 0.24;
  glassMat.transparent = true;
  glassMat.depthWrite = false;

  room.add(box([width + 0.16, 0.08, depth + 0.12], [0, 0.04, 0], materials.machineDark, false));
  room.add(box([width + 0.02, 0.018, depth - 0.02], [0, 0.092, 0], materials.floorInset, false));

  room.add(box([width, height, glassT], [0, glassY, halfD], glassMat, false));
  room.add(box([glassT, height, depth], [-halfW, glassY, 0], glassMat, false));
  room.add(box([glassT, height, depth], [halfW, glassY, 0], glassMat, false));
  room.add(box([0.58, height * 0.72, glassT], [halfW - 0.3, floorY + height * 0.36, -halfD + 0.035], glassMat, false));

  for (const x of [-halfW, halfW]) {
    for (const z of [-halfD, halfD]) {
      room.add(box([frameT, height + 0.08, frameT], [x, floorY + height / 2, z], materials.darkSteel, false));
    }
  }

  room.add(box([width + frameT, frameT, frameT], [0, floorY + height + frameT / 2, halfD], materials.darkSteel, false));
  room.add(box([width + frameT, frameT, frameT], [0, floorY + height + frameT / 2, -halfD], materials.darkSteel, false));
  room.add(box([frameT, frameT, depth + frameT], [-halfW, floorY + height + frameT / 2, 0], materials.darkSteel, false));
  room.add(box([frameT, frameT, depth + frameT], [halfW, floorY + height + frameT / 2, 0], materials.darkSteel, false));

  const deskZ = -halfD + 0.26;
  room.add(box([1.46, 0.075, 0.32], [-0.28, 0.33, deskZ], materials.machineDark, false));
  room.add(box([1.34, 0.024, 0.27], [-0.28, 0.395, deskZ], materials.darkSteel, false));
  [-0.72, -0.32, 0.08].forEach((x, index) => {
    const screen = box([0.26, 0.19, 0.018], [x, 0.56, deskZ + 0.12], materials.glass, false);
    const screenMat = screen.material as THREE.MeshStandardMaterial;
    screenMat.opacity = 0.62;
    screenMat.emissiveIntensity = 0.45 + index * 0.08;
    room.add(screen);
    room.add(box([0.07, 0.075, 0.016], [x, 0.45, deskZ + 0.08], materials.darkSteel, false));
  });

  const addChair = (x: number, z: number, yaw: number) => {
    const chair = new THREE.Group();
    chair.position.set(x, 0.08, z);
    chair.rotation.y = yaw;
    chair.add(box([0.22, 0.05, 0.23], [0, 0.17, 0], materials.machine, false));
    const back = box([0.22, 0.28, 0.04], [0, 0.32, 0.12], materials.machineDark, false);
    back.rotation.x = -0.12;
    chair.add(back);
    chair.add(cylinder(0.032, 0.038, 0.16, [0, 0.085, 0], materials.darkSteel, 12));
    chair.add(box([0.28, 0.018, 0.04], [0, 0.018, 0.1], materials.darkSteel, false));
    chair.add(box([0.28, 0.018, 0.04], [0, 0.018, -0.1], materials.darkSteel, false));
    chair.add(box([0.04, 0.018, 0.26], [0.1, 0.018, 0], materials.darkSteel, false));
    chair.add(box([0.04, 0.018, 0.26], [-0.1, 0.018, 0], materials.darkSteel, false));
    room.add(chair);
  };

  addChair(-0.72, 0.05, 0);
  addChair(-0.32, 0.05, 0);
  addChair(0.08, 0.05, 0);

  const sideConsoleX = 0.66;
  room.add(box([0.52, 0.06, 0.34], [sideConsoleX, 0.32, 0.2], materials.machineDark, false));
  room.add(box([0.42, 0.16, 0.025], [sideConsoleX, 0.49, 0.02], materials.glass, false));
  room.add(box([0.15, 0.024, 0.16], [sideConsoleX, 0.405, 0.16], materials.darkSteel, false));
  addChair(sideConsoleX, 0.42, 0);

  const statusStrip = box([width - 0.28, 0.018, 0.026], [0, floorY + height - 0.18, halfD + 0.02], materials.tealGlow, false);
  const statusMat = statusStrip.material as THREE.MeshStandardMaterial;
  statusMat.emissiveIntensity = 0.38;
  room.add(statusStrip);

  markKeepDuringPlacement(room);
  return room;
}

function buildOutputStorageRacks(materials: Materials) {
  const racks = new THREE.Group();
  racks.name = "output-storage-racks";
  racks.position.set(6.18, 0, -2.05);
  racks.rotation.y = -Math.PI / 2;

  const shelfAccentMat = materials.darkSteel.clone() as THREE.MeshStandardMaterial;
  shelfAccentMat.color.setHex(0x05090c);
  shelfAccentMat.metalness = 0.72;
  shelfAccentMat.roughness = 0.42;

  const cartonDarkMat = materials.machineDark.clone() as THREE.MeshStandardMaterial;
  cartonDarkMat.color.setHex(0x111820);
  cartonDarkMat.metalness = 0.48;
  cartonDarkMat.roughness = 0.58;

  const cartonGreyMat = materials.machine.clone() as THREE.MeshStandardMaterial;
  cartonGreyMat.color.setHex(0x26313a);
  cartonGreyMat.metalness = 0.44;
  cartonGreyMat.roughness = 0.54;

  const addCarton = (
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    size: [number, number, number],
    material: THREE.Material
  ) => {
    parent.add(box(size, [x, y + size[1] / 2, z], material, false));
    parent.add(box([size[0] * 0.72, 0.008, 0.012], [x, y + size[1] * 0.58, z - size[2] / 2 - 0.008], shelfAccentMat, false));
  };

  const addRackBay = (x: number, z: number, width: number, depth: number, levels: number) => {
    const bay = new THREE.Group();
    bay.position.set(x, 0, z);

    const postH = 1.72;
    const postT = 0.045;
    const halfW = width / 2;
    const halfD = depth / 2;
    const shelfYs = [0.18, 0.72, 1.24];

    for (const px of [-halfW, halfW]) {
      for (const pz of [-halfD, halfD]) {
        bay.add(box([postT, postH, postT], [px, postH / 2, pz], materials.darkSteel, false));
      }
    }

    shelfYs.slice(0, levels).forEach((shelfY, level) => {
      bay.add(box([width + 0.1, 0.045, depth + 0.08], [0, shelfY, 0], materials.machineDark, false));
      bay.add(box([width + 0.04, 0.018, depth], [0, shelfY + 0.034, 0], materials.steel, false));
      bay.add(box([width + 0.12, 0.035, 0.05], [0, shelfY + 0.06, -halfD], shelfAccentMat, false));

      const itemY = shelfY + 0.065;
      const leftMaterial = level % 2 === 0 ? cartonDarkMat : cartonGreyMat;
      const rightMaterial = level % 2 === 0 ? cartonGreyMat : cartonDarkMat;
      addCarton(bay, -width * 0.24, itemY, -depth * 0.16, [0.42, 0.22, 0.34], leftMaterial);
      addCarton(bay, width * 0.24, itemY, depth * 0.12, [0.36, 0.2, 0.3], rightMaterial);
    });

    bay.add(box([width + 0.18, 0.035, 0.07], [0, postH + 0.035, -halfD], materials.darkSteel, false));
    racks.add(bay);
  };

  addRackBay(-0.54, 0, 1.05, 0.58, 3);
  addRackBay(0.72, 0, 1.05, 0.58, 3);

  racks.add(box([2.62, 0.028, 0.76], [0.1, 0.034, 0], materials.machineDark, false));
  racks.add(box([2.52, 0.008, 0.64], [0.1, 0.054, 0], materials.floorInset, false));

  markKeepDuringPlacement(racks);
  return racks;
}

export function buildFloor(materials: Materials) {
  const group = prepGroup(new THREE.Group(), { revealStyle: "settle" });

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

  markKeepDuringPlacement(group);
  return group;
}

export function buildShell(materials: Materials) {
  const group = prepGroup(new THREE.Group(), { revealStyle: "settle", lift: 0.18 });

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
  group.add(buildControlRoom(materials));
  group.add(buildOutputStorageRacks(materials));

  group.userData.overheadLights = [] as THREE.PointLight[];
  group.userData.overheadLenses = [] as THREE.MeshStandardMaterial[];

  return group;
}
