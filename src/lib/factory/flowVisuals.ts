import * as THREE from "three";
import {
  accentMultiplier,
  type FlowState,
} from "./flowOptimization";
import { clamp, lerp } from "./math";

export type FlowVisualRig = {
  root: THREE.Group;
};

type MeshFlowCache = {
  emissive: number;
  intensity: number;
  color: number;
  opacity: number;
};

type BottleneckFxRig = {
  root: THREE.Group;
  floorRing: THREE.Mesh;
  outerRing: THREE.Mesh;
  spinner: THREE.Group;
  stackLight: THREE.Mesh;
  stackHalo: THREE.Mesh;
  warnColumns: THREE.Mesh[];
  scanBand: THREE.Mesh;
  pointLight: THREE.PointLight;
  footprint: number;
  columnHeight: number;
};

const _worldBox = new THREE.Box3();
const _localBox = new THREE.Box3();
const _corner = new THREE.Vector3();
const _groupInv = new THREE.Matrix4();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

type StationFxBounds = {
  core: THREE.Box3;
  footprint: THREE.Box3;
};

function getStationFxBounds(group: THREE.Group): StationFxBounds {
  group.updateWorldMatrix(true, true);
  _groupInv.copy(group.matrixWorld).invert();

  const box = new THREE.Box3();
  const coreBox = new THREE.Box3();
  let hasCore = false;

  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (isBottleneckFx(obj)) return;

    _worldBox.setFromObject(obj);
    _localBox.makeEmpty();
    for (const x of [_worldBox.min.x, _worldBox.max.x]) {
      for (const y of [_worldBox.min.y, _worldBox.max.y]) {
        for (const z of [_worldBox.min.z, _worldBox.max.z]) {
          _corner.set(x, y, z).applyMatrix4(_groupInv);
          _localBox.expandByPoint(_corner);
        }
      }
    }

    box.union(_localBox);

    _localBox.getSize(_size);
    _localBox.getCenter(_center);
    if (_size.y < 0.1 && _center.y < 0.16) return;

    coreBox.union(_localBox);
    hasCore = true;
  });

  if (box.isEmpty()) {
    box.set(new THREE.Vector3(-0.8, 0, -0.6), new THREE.Vector3(0.8, 1.2, 0.6));
  }

  const core = hasCore && !coreBox.isEmpty() ? coreBox : box.clone();
  if (core.isEmpty()) {
    core.set(new THREE.Vector3(-0.8, 0, -0.6), new THREE.Vector3(0.8, 1.2, 0.6));
  }

  return { core, footprint: box };
}

const GREEN_EMISSIVE = new Set([0x16a34a, 0x14b8a6, 0x0f766e, 0x22c55e]);
const TEAL_COLORS = new Set([0x5eead4, 0x82f4dd, 0x22c55e]);
const BODY_COLORS = new Set([
  0x303c48, 0x1a242c, 0x788590, 0x52616c, 0x172128, 0xd6dee4, 0x0f3d3f,
]);

const BOTTLENECK_FX = "bottleneckFx";

function isBottleneckFx(obj: THREE.Object3D) {
  return obj.userData[BOTTLENECK_FX] === true || obj.name.startsWith("bottleneck-fx-");
}

function isAccentMaterial(mat: THREE.MeshStandardMaterial) {
  const emissive = mat.emissive?.getHex() ?? 0;
  const color = mat.color?.getHex() ?? 0;
  return GREEN_EMISSIVE.has(emissive) || TEAL_COLORS.has(color);
}

function isBodyMaterial(mat: THREE.MeshStandardMaterial) {
  const color = mat.color?.getHex() ?? 0;
  return BODY_COLORS.has(color) || mat.metalness > 0.35;
}

function cacheMeshFlowState(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial): MeshFlowCache {
  const existing = mesh.userData.flowCache as MeshFlowCache | undefined;
  if (existing) return existing;
  const cache = {
    emissive: mat.emissive.getHex(),
    intensity: mat.emissiveIntensity,
    color: mat.color.getHex(),
    opacity: mat.opacity,
  };
  mesh.userData.flowCache = cache;
  return cache;
}

function restoreMeshFlowState(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial) {
  const cache = mesh.userData.flowCache as MeshFlowCache | undefined;
  if (!cache) return;
  mat.emissive.setHex(cache.emissive);
  mat.emissiveIntensity = cache.intensity;
  mat.color.setHex(cache.color);
  mat.opacity = cache.opacity;
}

function blendEmissiveHex(from: number, to: number, t: number) {
  const a = new THREE.Color(from);
  const b = new THREE.Color(to);
  return a.lerp(b, t).getHex();
}

function markFx(obj: THREE.Object3D, name: string) {
  obj.name = name;
  obj.userData[BOTTLENECK_FX] = true;
  obj.raycast = () => null;
  return obj;
}

function layoutBottleneckFxRig(rig: BottleneckFxRig, bounds: StationFxBounds) {
  const center = bounds.core.getCenter(new THREE.Vector3());
  const size = bounds.core.getSize(new THREE.Vector3());
  const footprintCenter = bounds.footprint.getCenter(new THREE.Vector3());
  const footprintSize = bounds.footprint.getSize(new THREE.Vector3());
  const footprint = Math.max(footprintSize.x, footprintSize.z, 1.08) * 0.58;
  const floorY = Math.max(bounds.footprint.min.y, bounds.core.min.y) + 0.065;
  const topY = bounds.core.max.y;
  const columnHeight = Math.max(0.5, size.y * 0.55);

  rig.footprint = footprint;
  rig.columnHeight = columnHeight;

  rig.floorRing.position.set(footprintCenter.x, floorY, footprintCenter.z);
  rig.outerRing.position.set(footprintCenter.x, floorY + 0.008, footprintCenter.z);
  rig.spinner.position.set(footprintCenter.x, floorY + 0.012, footprintCenter.z);

  rig.spinner.children.forEach((child, index) => {
    if (!(child instanceof THREE.Mesh)) return;
    const angle = (index / rig.spinner.children.length) * Math.PI * 2;
    child.rotation.z = angle;
    child.position.set(Math.cos(angle) * footprint * 1.06, 0, Math.sin(angle) * footprint * 1.06);
    child.scale.set(footprint, footprint, 1);
  });

  const corners = [
    [bounds.core.min.x + size.x * 0.1, bounds.core.min.z + size.z * 0.1],
    [bounds.core.max.x - size.x * 0.1, bounds.core.min.z + size.z * 0.1],
    [bounds.core.min.x + size.x * 0.1, bounds.core.max.z - size.z * 0.1],
    [bounds.core.max.x - size.x * 0.1, bounds.core.max.z - size.z * 0.1],
  ] as const;

  rig.warnColumns.forEach((column, index) => {
    const [x, z] = corners[index] ?? corners[0];
    column.position.set(x, floorY + columnHeight * 0.5, z);
    column.scale.set(1, columnHeight, 1);
  });

  rig.scanBand.position.set(center.x, floorY + Math.max(size.y * 0.44, 0.35), center.z);
  rig.scanBand.scale.set(
    Math.max(size.x * 0.9, 0.75),
    Math.max(size.y * 0.85, 0.55),
    Math.max(size.z * 0.9, 0.45)
  );

  rig.stackLight.position.set(center.x, topY + 0.18, center.z);
  rig.stackHalo.position.set(center.x, topY + 0.24, center.z);
  rig.pointLight.position.set(center.x, topY + 0.42, center.z);
}

function ensureBottleneckFxRig(group: THREE.Group): BottleneckFxRig {
  const existing = group.userData.bottleneckFx as BottleneckFxRig | undefined;
  if (existing) return existing;

  const root = markFx(new THREE.Group(), "bottleneck-fx-root") as THREE.Group;
  group.add(root);

  const floorRing = markFx(
    new THREE.Mesh(
      new THREE.RingGeometry(0.72, 0.98, 64),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      })
    ),
    "bottleneck-fx-floor-ring"
  ) as THREE.Mesh;
  floorRing.rotation.x = -Math.PI / 2;
  floorRing.renderOrder = 12;
  root.add(floorRing);

  const outerRing = markFx(
    new THREE.Mesh(
      new THREE.RingGeometry(0.98, 1.14, 64),
      new THREE.MeshStandardMaterial({
        color: 0xf87171,
        emissive: 0xef4444,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      })
    ),
    "bottleneck-fx-outer-ring"
  ) as THREE.Mesh;
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.renderOrder = 11;
  root.add(outerRing);

  const spinner = markFx(new THREE.Group(), "bottleneck-fx-spinner") as THREE.Group;
  const dashCount = 8;
  for (let i = 0; i < dashCount; i += 1) {
    const dash = markFx(
      new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.05),
        new THREE.MeshStandardMaterial({
          color: 0xfca5a5,
          emissive: 0xef4444,
          emissiveIntensity: 0,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          depthTest: false,
          depthWrite: false,
        })
      ),
      `bottleneck-fx-dash-${i}`
    ) as THREE.Mesh;
    dash.rotation.x = -Math.PI / 2;
    dash.renderOrder = 13;
    spinner.add(dash);
  }
  root.add(spinner);

  const warnColumns: THREE.Mesh[] = [];
  for (let index = 0; index < 4; index += 1) {
    const column = markFx(
      new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0x991b1b,
          emissive: 0xef4444,
          emissiveIntensity: 0,
          transparent: true,
          opacity: 0,
        })
      ),
      `bottleneck-fx-column-${index}`
    ) as THREE.Mesh;
    warnColumns.push(column);
    root.add(column);
  }

  const scanBand = markFx(
    new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    ),
    "bottleneck-fx-scan-band"
  ) as THREE.Mesh;
  root.add(scanBand);

  const stackLight = markFx(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.062, 0.11, 14),
      new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: 0xef4444,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
      })
    ),
    "bottleneck-fx-stack-light"
  ) as THREE.Mesh;
  root.add(stackLight);

  const stackHalo = markFx(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfca5a5,
        emissive: 0xef4444,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    ),
    "bottleneck-fx-stack-halo"
  ) as THREE.Mesh;
  root.add(stackHalo);

  const pointLight = markFx(new THREE.PointLight(0xef4444, 0, 7, 1.8), "bottleneck-fx-light") as THREE.PointLight;
  root.add(pointLight);

  const rig: BottleneckFxRig = {
    root,
    floorRing,
    outerRing,
    spinner,
    stackLight,
    stackHalo,
    warnColumns,
    scanBand,
    pointLight,
    footprint: 1,
    columnHeight: 1,
  };

  layoutBottleneckFxRig(rig, getStationFxBounds(group));
  group.userData.bottleneckFx = rig;
  return rig;
}

function updateBottleneckFxRig(
  rig: BottleneckFxRig,
  group: THREE.Group,
  intensity: number,
  elapsedMs: number
) {
  layoutBottleneckFxRig(rig, getStationFxBounds(group));

  const strength = clamp(intensity, 0, 1);
  rig.root.visible = strength > 0.01;

  const fastPulse = 0.5 + Math.sin(elapsedMs * 0.0055) * 0.5;
  const slowPulse = 0.5 + Math.sin(elapsedMs * 0.0032) * 0.5;
  const alertBlink = Math.sin(elapsedMs * 0.0048) > 0.1 ? 1 : 0.18;
  const ringPulse = 1 + slowPulse * 0.06 * strength;
  const outerPulse = 1 + fastPulse * 0.04 * strength;
  const footprint = rig.footprint;

  rig.floorRing.scale.set(footprint * ringPulse, footprint * ringPulse, 1);
  const floorMat = rig.floorRing.material as THREE.MeshStandardMaterial;
  floorMat.opacity = strength * (0.24 + fastPulse * 0.18);
  floorMat.emissiveIntensity = strength * (0.8 + fastPulse * 0.85);

  rig.outerRing.scale.set(footprint * outerPulse, footprint * outerPulse, 1);
  const outerMat = rig.outerRing.material as THREE.MeshStandardMaterial;
  outerMat.opacity = strength * (0.14 + slowPulse * 0.16);
  outerMat.emissiveIntensity = strength * (0.55 + slowPulse * 0.75);

  rig.spinner.rotation.y = elapsedMs * 0.00085;
  rig.spinner.visible = strength > 0.08;
  rig.spinner.children.forEach((child, index) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mat = child.material as THREE.MeshStandardMaterial;
    const phase = 0.5 + Math.sin(elapsedMs * 0.004 + index * 0.9) * 0.5;
    mat.opacity = strength * phase * 0.42;
    mat.emissiveIntensity = strength * phase * 1.2;
  });

  rig.warnColumns.forEach((column, index) => {
    const mat = column.material as THREE.MeshStandardMaterial;
    const phase = 0.5 + Math.sin(elapsedMs * 0.0042 + index * 1.4) * 0.5;
    mat.opacity = strength * (0.35 + phase * 0.55);
    mat.emissiveIntensity = strength * alertBlink * (1.6 + phase * 2.4);
  });

  const scanTravel = (Math.sin(elapsedMs * 0.0028) * 0.5 + 0.5) * strength;
  const scanMat = rig.scanBand.material as THREE.MeshStandardMaterial;
  scanMat.opacity = strength * (0.04 + scanTravel * 0.12);
  scanMat.emissiveIntensity = strength * scanTravel * 1.4;
  const scanBaseY = rig.scanBand.scale.y;
  rig.scanBand.scale.y = scanBaseY * (0.85 + scanTravel * 0.3);

  const stackMat = rig.stackLight.material as THREE.MeshStandardMaterial;
  stackMat.opacity = strength * (0.65 + alertBlink * 0.35);
  stackMat.emissiveIntensity = strength * alertBlink * 4.2;
  rig.stackLight.scale.setScalar(0.92 + alertBlink * 0.14 * strength);

  const haloMat = rig.stackHalo.material as THREE.MeshStandardMaterial;
  haloMat.opacity = strength * alertBlink * 0.42;
  haloMat.emissiveIntensity = strength * alertBlink * 3.6;
  rig.stackHalo.scale.setScalar(0.85 + alertBlink * 0.35);

  rig.pointLight.intensity = strength * alertBlink * 3.4;
}

function hideBottleneckFxRig(rig: BottleneckFxRig) {
  rig.root.visible = false;
  rig.pointLight.intensity = 0;
  rig.spinner.children.forEach((child) => {
    if (child instanceof THREE.Mesh) {
      const mat = child.material as THREE.MeshStandardMaterial;
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
    }
  });
  [rig.floorRing, rig.outerRing, rig.stackLight, rig.stackHalo, rig.scanBand, ...rig.warnColumns].forEach(
    (mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = 0;
      mat.emissiveIntensity = 0;
    }
  );
}

function applyBottleneckStationStopped(
  group: THREE.Group,
  intensity: number,
  elapsedMs: number
) {
  const strength = clamp(intensity, 0, 1);
  const rig = ensureBottleneckFxRig(group);
  updateBottleneckFxRig(rig, group, strength, elapsedMs);

  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (isBottleneckFx(obj)) return;

    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat?.emissive) return;

    const cache = cacheMeshFlowState(obj, mat);

    if (strength <= 0.01) {
      restoreMeshFlowState(obj, mat);
      return;
    }

    if (isAccentMaterial(mat)) {
      mat.emissive.setHex(blendEmissiveHex(cache.emissive, 0xdc2626, strength * 0.72));
      mat.emissiveIntensity = lerp(cache.intensity, cache.intensity * 0.08 + alertStrength(elapsedMs) * 0.35, strength);
      if (mat.transparent && cache.opacity > 0.05) {
        mat.opacity = lerp(cache.opacity, cache.opacity * 0.32, strength);
      }
      return;
    }

    if (isBodyMaterial(mat)) {
      mat.emissive.setHex(blendEmissiveHex(0x000000, 0x7f1d1d, strength * 0.35));
      mat.emissiveIntensity = strength * (0.08 + alertStrength(elapsedMs) * 0.12);
      mat.color.setHex(blendEmissiveHex(cache.color, 0x3a4248, strength * 0.22));
    }
  });
}

function alertStrength(elapsedMs: number) {
  return Math.sin(elapsedMs * 0.0048) > 0.1 ? 1 : 0.2;
}

function clearBottleneckStationStopped(group: THREE.Group) {
  const rig = group.userData.bottleneckFx as BottleneckFxRig | undefined;
  if (rig) hideBottleneckFxRig(rig);

  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (isBottleneckFx(obj)) return;
    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat?.emissive) return;
    restoreMeshFlowState(obj, mat);
  });
}

export function buildFlowVisuals(): FlowVisualRig {
  const root = new THREE.Group();
  root.name = "flow-visuals";
  return { root };
}

export function applyFlowVisuals(
  _rig: FlowVisualRig,
  flow: FlowState,
  stationGroups: Map<string, THREE.Group>,
  elapsedMs: number
) {
  const hasBottleneck = flow.bottleneckIntensity > 0.01;

  stationGroups.forEach((group, stationId) => {
    const constraintId = flow.bottleneckStationId;
    if (hasBottleneck && stationId === constraintId) {
      applyBottleneckStationStopped(group, flow.bottleneckIntensity, elapsedMs);
      return;
    }

    if (group.userData.bottleneckFx) {
      clearBottleneckStationStopped(group);
    }

    const accentMul = accentMultiplier(stationId);
    if (Math.abs(accentMul - 1) < 0.001) return;

    group.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (isBottleneckFx(obj)) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (!mat?.emissive || !isAccentMaterial(mat)) return;

      if (mat.emissiveIntensity > 0.001) {
        mat.emissiveIntensity *= accentMul;
      }
      if (mat.transparent && mat.opacity > 0.05) {
        mat.opacity *= lerp(0.55, 1.12, clamp(accentMul));
      }
    });
  });
}
