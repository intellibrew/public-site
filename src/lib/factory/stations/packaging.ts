import * as THREE from "three";
import { lerp } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, makeProduct, PRODUCT_SHAPE_CUBE } from "../products";
import type { PackagingRig } from "../types";
import { machineLiveMultiplier } from "../flowOptimization";
import { stationAnimationTime, stationBaseLive } from "../flowAnimation";
import {
  advancePackagingFlow,
  packagingPreviewSnapshot,
} from "../packagingFlow";

type Vec3 = [number, number, number];
type XzPoint = { x: number; z: number };

type PalletStackConfig = {
  name: string;
  center: XzPoint;
  deckSize: Vec3;
  slatSize: Vec3;
  slatZOffsets: number[];
  layerCount: number;
  layerSize: Vec3;
  layerPitch: number;
  layerBaseY: number;
  labelSize: Vec3;
  labelOffsetFromLayerCenter: Vec3;
  layerMaterials: [THREE.Material, THREE.Material];
};

const midpoint = (a: number, b: number) => (a + b) / 2;

const positionFromXz = (
  center: XzPoint,
  y: number,
  offsetX = 0,
  offsetZ = 0
): Vec3 => [center.x + offsetX, y, center.z + offsetZ];

const offsetPosition = (position: Vec3, offset: Vec3): Vec3 => [
  position[0] + offset[0],
  position[1] + offset[1],
  position[2] + offset[2],
];

function addNamedBox(
  group: THREE.Group,
  name: string,
  size: Vec3,
  position: Vec3,
  material: THREE.Material,
  castShadow = true
) {
  const mesh = box(size, position, material, castShadow);
  mesh.name = name;
  group.add(mesh);
  return mesh;
}

function addPalletStack(
  group: THREE.Group,
  materials: Materials,
  config: PalletStackConfig
) {
  addNamedBox(
    group,
    `${config.name}-deck`,
    config.deckSize,
    positionFromXz(config.center, config.deckSize[1] / 2),
    materials.darkSteel
  );

  config.slatZOffsets.forEach((zOffset, index) => {
    addNamedBox(
      group,
      `${config.name}-slat-${index + 1}`,
      config.slatSize,
      positionFromXz(config.center, config.slatSize[1] / 2, 0, zOffset),
      materials.darkSteel,
      false
    );
  });

  const layers: THREE.Mesh[] = [];
  for (let index = 0; index < config.layerCount; index += 1) {
    const layerCenter = positionFromXz(
      config.center,
      config.layerBaseY + index * config.layerPitch + config.layerSize[1] / 2
    );
    const layer = addNamedBox(
      group,
      `${config.name}-package-layer-${index + 1}`,
      config.layerSize,
      layerCenter,
      config.layerMaterials[index % config.layerMaterials.length]
    );
    layer.visible = false;
    layers.push(layer);

    addNamedBox(
      group,
      `${config.name}-label-${index + 1}`,
      config.labelSize,
      offsetPosition(layerCenter, config.labelOffsetFromLayerCenter),
      materials.enamel,
      false
    );
  }

  return layers;
}

function applyStackLayers(
  layers: THREE.Mesh[],
  visibleLayers: number,
  live: number
) {
  const fullLayers = Math.floor(visibleLayers);
  const partial = visibleLayers - fullLayers;

  layers.forEach((layer, index) => {
    if (index < fullLayers) {
      layer.visible = live > 0.05;
      layer.scale.y = 1;
      return;
    }
    if (index === fullLayers && partial > 0.02) {
      layer.visible = live > 0.05;
      layer.scale.y = 0.22 + partial * 0.78;
      return;
    }
    layer.visible = false;
    layer.scale.y = 0.2;
  });
}

export function tickPackaging(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.packagingRig as PackagingRig | undefined;
  if (!rig) return;

  const baseLive = stationBaseLive(progress, "packaging");
  const live = machineLiveMultiplier(baseLive, "packaging");
  const animMs = stationAnimationTime(group, elapsedMs, "packaging", baseLive);

  const cycle = group.userData.isPreview
    ? packagingPreviewSnapshot()
    : advancePackagingFlow(elapsedMs, live);

  rig.sealHead.position.y = lerp(rig.sealHomeY, rig.sealDownY, cycle.seal);

  const beamMat = rig.sealBeam.material as THREE.MeshStandardMaterial;
  beamMat.opacity = (0.08 + cycle.seal * 0.54) * live;
  beamMat.emissiveIntensity = (0.3 + cycle.seal * 2.1) * live;

  rig.gantryCrane.position.lerpVectors(rig.craneHome, rig.cranePick, cycle.crane);

  applyStackLayers(rig.palletALayers, cycle.stackALayers, live);
  applyStackLayers(rig.palletBLayers, cycle.stackBLayers, live);

  rig.inboundProduct.visible = cycle.inbound > 0.04 && live > 0.05;
  rig.inboundProduct.scale.setScalar(0.82 + cycle.inbound * 0.18);
  applyProductShape(rig.inboundProduct, PRODUCT_SHAPE_CUBE);

  const outboundSpin = animMs * 0.005 * live;
  rig.outboundRollers.forEach((roller, index) => {
    roller.rotation.x = outboundSpin * (index % 2 === 0 ? 1 : -1);
  });

  rig.labelLights.forEach((light, index) => {
    const labelMat = light.material as THREE.MeshStandardMaterial;
    const flash = cycle.label * (0.55 + Math.sin(animMs * 0.012 + index) * 0.45);
    labelMat.emissiveIntensity = (0.2 + flash * 1.6) * live;
    labelMat.opacity = (0.35 + flash * 0.55) * live;
  });

  const amberPulse = Math.sin(animMs * 0.0038) * 0.5 + 0.5;
  const alMat = rig.amberLamp.material as THREE.MeshStandardMaterial;
  alMat.opacity = (0.28 + amberPulse * 0.52 + cycle.seal * 0.22) * live;
  alMat.emissiveIntensity = (0.28 + amberPulse * 1.2 + cycle.seal * 0.4) * live;

  const beaconSpin = Math.sin(animMs * 0.0056) * 0.5 + 0.5;
  const sbMat = rig.statusBeacon.material as THREE.MeshStandardMaterial;
  sbMat.opacity = (0.38 + beaconSpin * 0.52) * live;
  sbMat.emissiveIntensity = (0.4 + beaconSpin * 1.8) * live;
  rig.statusBeacon.scale.setScalar(0.92 + beaconSpin * 0.12 * live);

  rig.packingLight.intensity =
    (0.12 + beaconSpin * 0.4 + cycle.seal * 2.2 + cycle.label * 0.8) * live;
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

  const sealHomeY = 1.86;
  const sealDownY = 1.22;
  const sealHead = new THREE.Group();
  sealHead.position.set(0.4, sealHomeY, 0);
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
  const labelLights = [
    cylinder(0.032, 0.032, 0.038, [1.66, 0.30, -0.476], materials.tealGlow, 12),
    cylinder(0.028, 0.028, 0.038, [1.74, 0.30, -0.476], materials.paintGreen, 12),
    cylinder(0.024, 0.024, 0.038, [1.82, 0.30, -0.476], materials.machineLight, 12),
  ];
  labelLights.forEach((light) => {
    const mat = light.material as THREE.MeshStandardMaterial;
    mat.transparent = true;
    group.add(light);
  });

  const palletA = {
    center: { x: 2.88, z: -0.68 },
    deckSize: [1.18, 0.09, 0.98] as Vec3,
    layerSize: [1.04, 0.23, 0.82] as Vec3,
  };
  const palletALayers = addPalletStack(group, materials, {
    name: "packaging-pallet-a",
    center: palletA.center,
    deckSize: palletA.deckSize,
    slatSize: [0.96, 0.04, 0.16],
    slatZOffsets: [-0.42, 0, 0.42],
    layerCount: 4,
    layerSize: palletA.layerSize,
    layerPitch: 0.27,
    layerBaseY: palletA.deckSize[1],
    labelSize: [0.26, 0.14, 0.038],
    labelOffsetFromLayerCenter: [-0.22, -0.015, -palletA.layerSize[2] / 2],
    layerMaterials: [materials.machineLight, materials.package],
  });

  const palletB = {
    center: { x: 4.12, z: -0.72 },
    deckSize: [0.98, 0.09, 0.82] as Vec3,
    layerSize: [0.84, 0.21, 0.68] as Vec3,
  };
  const palletBLayers = addPalletStack(group, materials, {
    name: "packaging-pallet-b",
    center: palletB.center,
    deckSize: palletB.deckSize,
    slatSize: [0.78, 0.04, 0.14],
    slatZOffsets: [-0.32, 0.32],
    layerCount: 3,
    layerSize: palletB.layerSize,
    layerPitch: 0.25,
    layerBaseY: palletB.deckSize[1],
    labelSize: [0.22, 0.12, 0.036],
    labelOffsetFromLayerCenter: [-0.18, -0.035, -palletB.layerSize[2] / 2],
    layerMaterials: [materials.package, materials.machineLight],
  });

  const inboundCartonSize: Vec3 = [0.92, 0.23, 0.74];
  const inboundBuffer = {
    center: { x: 1.98, z: -0.72 },
    deckSize: [1.06, 0.09, 0.88] as Vec3,
    cartonSize: inboundCartonSize,
    labelSize: [0.24, 0.14, 0.036] as Vec3,
    labelOffsetFromCartonCenter: [-0.2, -0.045, -inboundCartonSize[2] / 2] as Vec3,
  };
  addNamedBox(
    group,
    "packaging-inbound-deck",
    inboundBuffer.deckSize,
    positionFromXz(inboundBuffer.center, inboundBuffer.deckSize[1] / 2),
    materials.darkSteel
  );
  const inboundCartonCenter = positionFromXz(
    inboundBuffer.center,
    inboundBuffer.deckSize[1] + inboundBuffer.cartonSize[1] / 2
  );
  addNamedBox(
    group,
    "packaging-inbound-carton",
    inboundBuffer.cartonSize,
    inboundCartonCenter,
    materials.machineLight
  );
  addNamedBox(
    group,
    "packaging-inbound-label",
    inboundBuffer.labelSize,
    offsetPosition(inboundCartonCenter, inboundBuffer.labelOffsetFromCartonCenter),
    materials.enamel,
    false
  );
  const inboundProduct = makeProduct(materials.enamel, positionFromXz(inboundBuffer.center, 0.28));
  applyProductShape(inboundProduct, PRODUCT_SHAPE_CUBE);
  inboundProduct.visible = false;
  group.add(inboundProduct);

  const outboundRollers: THREE.Mesh[] = [];
  for (let i = -2; i <= 2; i += 1) {
    const roller = cylinder(0.02, 0.02, 0.34, [5.1 + i * 0.22, 0.098, -0.68], materials.steel, 10);
    roller.rotation.z = Math.PI / 2;
    outboundRollers.push(roller);
    group.add(roller);
  }
  group.add(box([1.4, 0.014, 0.42], [5.1, 0.092, -0.68], materials.belt, false));

  const craneFrame = {
    height: 3.28,
    leftX: inboundBuffer.center.x - 0.04,
    rightX: palletB.center.x + 0.36,
    frontZ: palletA.center.z + 0.98,
    backZ: palletB.center.z - 1,
  };
  const craneCenter = {
    x: midpoint(craneFrame.leftX, craneFrame.rightX),
    z: midpoint(craneFrame.frontZ, craneFrame.backZ),
  };
  const craneSpanX = craneFrame.rightX - craneFrame.leftX;
  const craneSpanZ = craneFrame.frontZ - craneFrame.backZ;
  const craneColumns = [
    { name: "front-left", x: craneFrame.leftX, z: craneFrame.frontZ },
    { name: "front-right", x: craneFrame.rightX, z: craneFrame.frontZ },
    { name: "back-left", x: craneFrame.leftX, z: craneFrame.backZ },
    { name: "back-right", x: craneFrame.rightX, z: craneFrame.backZ },
  ];
  craneColumns.forEach((column) => {
    addNamedBox(
      group,
      `packaging-crane-column-${column.name}`,
      [0.13, craneFrame.height, 0.13],
      [column.x, craneFrame.height / 2, column.z],
      materials.machineDark
    );
    addNamedBox(
      group,
      `packaging-crane-foot-${column.name}`,
      [0.17, 0.024, 0.17],
      [column.x, 0.13, column.z],
      materials.darkSteel
    );
    addNamedBox(
      group,
      `packaging-crane-cap-${column.name}`,
      [0.17, 0.024, 0.17],
      [column.x, craneFrame.height - 0.07, column.z],
      materials.darkSteel
    );
  });
  addNamedBox(
    group,
    "packaging-crane-front-rail",
    [craneSpanX + 0.16, 0.1, 0.1],
    [craneCenter.x, craneFrame.height, craneFrame.frontZ],
    materials.darkSteel
  );
  addNamedBox(
    group,
    "packaging-crane-back-rail",
    [craneSpanX + 0.16, 0.1, 0.1],
    [craneCenter.x, craneFrame.height, craneFrame.backZ],
    materials.darkSteel
  );
  addNamedBox(
    group,
    "packaging-crane-left-cross-rail",
    [0.1, 0.1, craneSpanZ + 0.16],
    [craneFrame.leftX, craneFrame.height, craneCenter.z],
    materials.darkSteel
  );
  addNamedBox(
    group,
    "packaging-crane-right-cross-rail",
    [0.1, 0.1, craneSpanZ + 0.16],
    [craneFrame.rightX, craneFrame.height, craneCenter.z],
    materials.darkSteel
  );
  addNamedBox(
    group,
    "packaging-crane-overhead-deck",
    [craneSpanX + 0.12, 0.065, craneSpanZ + 0.12],
    [craneCenter.x, craneFrame.height + 0.04, craneCenter.z],
    materials.machineDark
  );
  addNamedBox(
    group,
    "packaging-crane-overhead-panel",
    [craneSpanX - 0.04, 0.014, craneSpanZ - 0.04],
    [craneCenter.x, craneFrame.height + 0.06, craneCenter.z],
    materials.machine
  );
  const gantryCrane = new THREE.Group();
  gantryCrane.name = "packaging-gantry-crane";
  gantryCrane.position.set(inboundBuffer.center.x + 0.22, craneFrame.height, craneCenter.z);
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

  const craneHome = new THREE.Vector3(inboundBuffer.center.x + 0.02, craneFrame.height, craneCenter.z);
  const cranePick = new THREE.Vector3(palletB.center.x + 0.23, craneFrame.height, palletB.center.z - 0.3);

  group.userData.packagingRig = {
    sealHead,
    gantryCrane,
    statusBeacon,
    amberLamp,
    sealBeam,
    packingLight,
    palletALayers,
    palletBLayers,
    inboundProduct,
    outboundRollers,
    labelLights,
    craneHome,
    cranePick,
    sealHomeY,
    sealDownY,
  } satisfies PackagingRig;

  return group;
}
