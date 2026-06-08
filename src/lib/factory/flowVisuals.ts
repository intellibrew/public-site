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
  flowModulated?: boolean;
  lastIntensity?: number;
  lastOpacity?: number;
};

type BottleneckFxRig = {
  root: THREE.Group;
  floorWash: THREE.Mesh;
  pulseRings: THREE.Mesh[];
  beacon: THREE.Mesh;
  beaconGlow: THREE.Mesh;
  pointLight: THREE.PointLight;
  coreRadius: number;
  floorY: number;
  topY: number;
  centerX: number;
  centerZ: number;
  fxVersion: number;
};

const BOTTLENECK_FLOOR_Y = 0.052;
const BOTTLENECK_FX_VERSION = 2;

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

type StationFlowCache = {
  meshes: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
  bounds: StationFxBounds;
};

function isFloorDeckMesh(size: THREE.Vector3, center: THREE.Vector3) {
  return size.y < 0.14 && center.y < 0.22;
}

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
    if (isFloorDeckMesh(_size, _center)) return;

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

function getStationFlowCache(group: THREE.Group): StationFlowCache {
  const existing = group.userData.flowVisualCache as StationFlowCache | undefined;
  if (existing) return existing;

  const meshes: THREE.Mesh[] = [];
  const accentMeshes: THREE.Mesh[] = [];

  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    if (isBottleneckFx(obj)) return;

    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat?.emissive) return;

    meshes.push(obj);
    if (isAccentMaterial(mat)) {
      accentMeshes.push(obj);
    }
  });

  const cache: StationFlowCache = {
    meshes,
    accentMeshes,
    bounds: getStationFxBounds(group),
  };
  group.userData.flowVisualCache = cache;
  return cache;
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

function beginMeshFlowFrame(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial) {
  const cache = cacheMeshFlowState(mesh, mat);
  if (!cache.flowModulated) return cache;

  if (
    cache.lastIntensity !== undefined &&
    Math.abs(mat.emissiveIntensity - cache.lastIntensity) < 0.0001
  ) {
    mat.emissiveIntensity = cache.intensity;
  }
  if (cache.lastOpacity !== undefined && Math.abs(mat.opacity - cache.lastOpacity) < 0.0001) {
    mat.opacity = cache.opacity;
  }

  cache.flowModulated = false;
  cache.lastIntensity = undefined;
  cache.lastOpacity = undefined;
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
  bounds.core.getSize(_size);
  const coreRadius = Math.max(_size.x, _size.z) * 0.5;
  const safeRadius = Math.max(coreRadius, 0.42);
  const topY = bounds.core.max.y;

  rig.coreRadius = safeRadius;
  rig.floorY = BOTTLENECK_FLOOR_Y;
  rig.topY = topY;
  rig.centerX = center.x;
  rig.centerZ = center.z;

  rig.floorWash.position.set(center.x, BOTTLENECK_FLOOR_Y, center.z);
  rig.floorWash.scale.set(safeRadius * 2.15, safeRadius * 2.15, 1);

  rig.pulseRings.forEach((ring) => {
    ring.position.set(center.x, BOTTLENECK_FLOOR_Y + 0.008, center.z);
  });

  rig.beacon.position.set(center.x, topY + 0.14, center.z);
  rig.beaconGlow.position.set(center.x, topY + 0.2, center.z);
  rig.pointLight.position.set(center.x, topY + 0.32, center.z);
}

function makeFxFloorMaterial(color: number, opacity = 0) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function ensureBottleneckFxRig(group: THREE.Group): BottleneckFxRig {
  const existing = group.userData.bottleneckFx as BottleneckFxRig | undefined;
  if (existing?.pulseRings && existing.fxVersion === BOTTLENECK_FX_VERSION) return existing;
  if (existing?.root) {
    existing.root.removeFromParent();
    delete group.userData.bottleneckFx;
  }

  const root = markFx(new THREE.Group(), "bottleneck-fx-root") as THREE.Group;
  group.add(root);

  const floorWash = markFx(
    new THREE.Mesh(new THREE.CircleGeometry(1, 48), makeFxFloorMaterial(0xdc2626)),
    "bottleneck-fx-floor-wash"
  ) as THREE.Mesh;
  floorWash.rotation.x = -Math.PI / 2;
  floorWash.renderOrder = 18;
  root.add(floorWash);

  const pulseRings: THREE.Mesh[] = [];
  for (let index = 0; index < 3; index += 1) {
    const ring = markFx(
      new THREE.Mesh(
        new THREE.RingGeometry(0.94, 1, 56),
        makeFxFloorMaterial(0xf87171)
      ),
      `bottleneck-fx-pulse-ring-${index}`
    ) as THREE.Mesh;
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 19 + index;
    pulseRings.push(ring);
    root.add(ring);
  }

  const beacon = markFx(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.048, 0.09, 12),
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0,
        depthTest: true,
        depthWrite: true,
      })
    ),
    "bottleneck-fx-beacon"
  ) as THREE.Mesh;
  root.add(beacon);

  const beaconGlow = markFx(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 14, 14),
      makeFxFloorMaterial(0xfca5a5)
    ),
    "bottleneck-fx-beacon-glow"
  ) as THREE.Mesh;
  beaconGlow.renderOrder = 14;
  root.add(beaconGlow);

  const pointLight = markFx(new THREE.PointLight(0xef4444, 0, 5, 1.6), "bottleneck-fx-light") as THREE.PointLight;
  root.add(pointLight);

  const rig: BottleneckFxRig = {
    root,
    floorWash,
    pulseRings,
    beacon,
    beaconGlow,
    pointLight,
    coreRadius: 0.8,
    floorY: BOTTLENECK_FLOOR_Y,
    topY: 1,
    centerX: 0,
    centerZ: 0,
    fxVersion: BOTTLENECK_FX_VERSION,
  };

  layoutBottleneckFxRig(rig, getStationFxBounds(group));
  group.userData.bottleneckFx = rig;
  return rig;
}

export function prepareBottleneckFxForStation(group: THREE.Group) {
  const rig = ensureBottleneckFxRig(group);
  layoutBottleneckFxRig(rig, getStationFxBounds(group));
  hideBottleneckFxRig(rig);
}

function updateBottleneckFxRig(
  rig: BottleneckFxRig,
  intensity: number,
  elapsedMs: number
) {
  const strength = clamp(intensity, 0, 1);
  rig.root.visible = strength > 0.01;

  const slowPulse = 0.5 + Math.sin(elapsedMs * 0.0024) * 0.5;
  const alertBlink = 0.4 + (0.5 + Math.sin(elapsedMs * 0.0036) * 0.5) * 0.6;
  const coreRadius = rig.coreRadius;
  const pulseCycleMs = 2200;

  const washMat = rig.floorWash.material as THREE.MeshBasicMaterial;
  const washRadius = coreRadius * (1.92 + slowPulse * 0.12);
  rig.floorWash.scale.set(washRadius, washRadius, 1);
  washMat.opacity = strength * (0.06 + slowPulse * 0.05);

  rig.pulseRings.forEach((ring, index) => {
    const phase = ((elapsedMs + index * (pulseCycleMs / 3)) % pulseCycleMs) / pulseCycleMs;
    const eased = 1 - (1 - phase) * (1 - phase);
    const ringRadius = coreRadius * lerp(1.04, 1.62, eased);
    ring.scale.set(ringRadius, ringRadius, 1);
    const mat = ring.material as THREE.MeshBasicMaterial;
    mat.opacity = strength * (1 - phase) * 0.42;
  });

  const beaconMat = rig.beacon.material as THREE.MeshBasicMaterial;
  beaconMat.opacity = strength * (0.72 + alertBlink * 0.28);
  rig.beacon.scale.setScalar(0.9 + alertBlink * 0.08 * strength);

  const glowMat = rig.beaconGlow.material as THREE.MeshBasicMaterial;
  glowMat.opacity = strength * alertBlink * 0.22;
  rig.beaconGlow.scale.setScalar(0.75 + alertBlink * 0.28);

  rig.pointLight.intensity = strength * alertBlink * 1.15;
}

function hideBottleneckFxRig(rig: BottleneckFxRig) {
  rig.root.visible = false;
  rig.pointLight.intensity = 0;
  const washMat = rig.floorWash.material as THREE.MeshBasicMaterial;
  washMat.opacity = 0;
  rig.pulseRings.forEach((ring) => {
    const mat = ring.material as THREE.MeshBasicMaterial;
    mat.opacity = 0;
  });
  const beaconMat = rig.beacon.material as THREE.MeshBasicMaterial;
  beaconMat.opacity = 0;
  const glowMat = rig.beaconGlow.material as THREE.MeshBasicMaterial;
  glowMat.opacity = 0;
}

function applyBottleneckStationStopped(
  group: THREE.Group,
  intensity: number,
  elapsedMs: number
) {
  const strength = clamp(intensity, 0, 1);
  const stationCache = getStationFlowCache(group);
  const rig = ensureBottleneckFxRig(group);
  updateBottleneckFxRig(rig, strength, elapsedMs);

  stationCache.meshes.forEach((obj) => {
    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat?.emissive) return;

    const cache = beginMeshFlowFrame(obj, mat);

    if (strength <= 0.01) {
      restoreMeshFlowState(obj, mat);
      return;
    }

    if (isAccentMaterial(mat)) {
      mat.emissive.setHex(blendEmissiveHex(cache.emissive, 0xdc2626, strength * 0.48));
      mat.emissiveIntensity = lerp(
        cache.intensity,
        cache.intensity * 0.35 + alertStrength(elapsedMs) * 0.18,
        strength
      );
      if (mat.transparent && cache.opacity > 0.05) {
        mat.opacity = lerp(cache.opacity, cache.opacity * 0.55, strength);
      }
      return;
    }

    if (isBodyMaterial(mat)) {
      mat.emissive.setHex(blendEmissiveHex(0x000000, 0x7f1d1d, strength * 0.18));
      mat.emissiveIntensity = strength * (0.04 + alertStrength(elapsedMs) * 0.06);
      mat.color.setHex(blendEmissiveHex(cache.color, 0x3a4248, strength * 0.1));
    }
  });
}

function alertStrength(elapsedMs: number) {
  return 0.35 + (0.5 + Math.sin(elapsedMs * 0.0048) * 0.5) * 0.65;
}

function clearBottleneckStationStopped(group: THREE.Group) {
  const rig = group.userData.bottleneckFx as BottleneckFxRig | undefined;
  if (rig) hideBottleneckFxRig(rig);

  getStationFlowCache(group).meshes.forEach((obj) => {
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
    const stationCache = getStationFlowCache(group);
    const constraintId = flow.bottleneckStationId;
    if (hasBottleneck && stationId === constraintId) {
      applyBottleneckStationStopped(group, flow.bottleneckIntensity, elapsedMs);
      return;
    }

    if (group.userData.bottleneckFx) {
      clearBottleneckStationStopped(group);
    }

    const accentMul = accentMultiplier(stationId);
    const shouldModulate = Math.abs(accentMul - 1) >= 0.001;

    stationCache.accentMeshes.forEach((obj) => {
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (!mat?.emissive) return;

      const cache = beginMeshFlowFrame(obj, mat);
      if (!shouldModulate) return;

      let nextIntensity = mat.emissiveIntensity;
      let nextOpacity = mat.opacity;
      if (mat.emissiveIntensity > 0.001) {
        nextIntensity = mat.emissiveIntensity * accentMul;
        mat.emissiveIntensity = nextIntensity;
      }
      if (mat.transparent && mat.opacity > 0.05) {
        nextOpacity = mat.opacity * lerp(0.55, 1.12, clamp(accentMul));
        mat.opacity = nextOpacity;
      }

      cache.flowModulated = true;
      cache.lastIntensity = nextIntensity;
      cache.lastOpacity = nextOpacity;
    });
  });
}
