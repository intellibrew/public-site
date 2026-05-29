import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lerpVector, smoothstep } from "./math";
import { CAMERA_PATH, CAMERA_SETTINGS, CONTROL_SETTINGS } from "./sceneConfig";

export function makeSceneCamera() {
  return new THREE.PerspectiveCamera(
    CAMERA_SETTINGS.fov,
    1,
    CAMERA_SETTINGS.near,
    CAMERA_SETTINGS.far
  );
}

export function configureControls(controls: OrbitControls) {
  controls.enableDamping = true;
  controls.dampingFactor = CONTROL_SETTINGS.dampingFactor;
  controls.enableZoom = false;
  controls.enablePan = true;
  controls.rotateSpeed = CONTROL_SETTINGS.rotateSpeed;
  controls.panSpeed = CONTROL_SETTINGS.panSpeed;
  controls.minPolarAngle = CONTROL_SETTINGS.minPolarAngle;
  controls.maxPolarAngle = CONTROL_SETTINGS.maxPolarAngle;
  controls.target.copy(CAMERA_PATH.lookStart);
}

export function updateCameraForProgress(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  progress: number
) {
  const approach = smoothstep(0, 0.25, progress);
  const inspect = smoothstep(0.25, 0.7, progress);
  const settle = smoothstep(0.7, 1, progress);
  const camA = lerpVector(CAMERA_PATH.overview, CAMERA_PATH.iso, approach);
  const camB = lerpVector(CAMERA_PATH.iso, CAMERA_PATH.close, inspect);
  const camC = lerpVector(CAMERA_PATH.close, CAMERA_PATH.final, settle);
  const target = lerpVector(
    CAMERA_PATH.lookStart,
    lerpVector(CAMERA_PATH.lookMid, CAMERA_PATH.lookEnd, settle),
    smoothstep(0.24, 1, progress)
  );

  camera.position.copy(lerpVector(camA, lerpVector(camB, camC, settle), inspect * 0.55));
  controls.target.copy(target);
}
