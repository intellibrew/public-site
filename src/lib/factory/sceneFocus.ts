import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MACHINE_MAP } from "./machineRegistry";

export type FocusPhase = "idle" | "entering" | "active" | "exiting";

export type FocusState = {
  stationId: string;
  phase: FocusPhase;
  t: number;
  fromCamera: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toCamera: THREE.Vector3;
  toTarget: THREE.Vector3;
};

export function computeFocusPose(stationGroup: THREE.Group, stationId: string) {
  const def = MACHINE_MAP.get(stationId);
  stationGroup.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(stationGroup);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const targetOffset = def?.focus.targetOffset ?? new THREE.Vector3(0, size.y * 0.35, 0);
  const cameraOffset = def?.focus.cameraOffset ?? new THREE.Vector3(2, 2.2, 1.8);

  const target = center.clone().add(targetOffset);
  const camera = center.clone().add(cameraOffset);

  return { camera, target };
}

export function makeFocusRing() {
  const geometry = new THREE.RingGeometry(0.55, 0.72, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  ring.renderOrder = 999;
  ring.visible = false;

  const innerGeometry = new THREE.RingGeometry(0.38, 0.42, 48);
  const innerMaterial = new THREE.MeshBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const innerRing = new THREE.Mesh(innerGeometry, innerMaterial);
  innerRing.rotation.x = -Math.PI / 2;
  innerRing.position.y = 0.045;
  innerRing.renderOrder = 1000;

  const group = new THREE.Group();
  group.add(ring, innerRing);
  group.userData.outerRing = ring;
  group.userData.innerRing = innerRing;
  return group;
}

export function updateFocusRing(ringGroup: THREE.Group, intensity: number, elapsedMs: number) {
  const outer = ringGroup.userData.outerRing as THREE.Mesh;
  const inner = ringGroup.userData.innerRing as THREE.Mesh;
  const pulse = 0.5 + Math.sin(elapsedMs * 0.004) * 0.5;
  const scale = 1 + pulse * 0.06 * intensity;

  ringGroup.scale.setScalar(scale);
  ringGroup.visible = intensity > 0.02;

  const outerMat = outer.material as THREE.MeshBasicMaterial;
  const innerMat = inner.material as THREE.MeshBasicMaterial;
  outerMat.opacity = intensity * (0.35 + pulse * 0.25);
  innerMat.opacity = intensity * (0.55 + pulse * 0.35);
}

export function startFocus(
  _state: FocusState | null,
  stationId: string,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  _stationGroup: THREE.Group
): FocusState {
  const pose = camera.position.clone();
  const target = controls.target.clone();
  return {
    stationId,
    phase: "active",
    t: 1,
    fromCamera: pose,
    fromTarget: target,
    toCamera: pose,
    toTarget: target,
  };
}

export function tickFocus(
  state: FocusState,
  _deltaSec: number,
  _camera: THREE.PerspectiveCamera,
  _controls: OrbitControls
): { state: FocusState | null; done: boolean } {
  if (state.phase === "exiting") {
    return { state: null, done: true };
  }
  return { state, done: false };
}

export function focusIntensity(state: FocusState | null): number {
  if (!state || state.phase === "exiting") return 0;
  return 1;
}

export function snapFocusExit(
  state: FocusState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
) {
  camera.position.copy(state.fromCamera);
  controls.target.copy(state.fromTarget);
}
