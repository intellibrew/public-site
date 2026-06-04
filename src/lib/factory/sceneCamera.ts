import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { lerpVector, smoothstep } from "./math";
import {
  CAMERA_PATH,
  CAMERA_SETTINGS,
  COMPACT_FACTORY_BREAKPOINT,
  CONTROL_SETTINGS,
  MOBILE_CAMERA,
} from "./sceneConfig";

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

function getPortraitBlend(viewportWidth: number, viewportHeight: number): number {
  const aspect = viewportWidth / Math.max(1, viewportHeight);
  const t = Math.min(1, Math.max(0, (0.85 - aspect) / (0.85 - 0.45)));
  return t * t * (3 - 2 * t);
}

export function updateCameraForProgress(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  progress: number
) {
  const viewportWidth =
    typeof camera.userData.factoryViewportWidth === "number"
      ? camera.userData.factoryViewportWidth
      : typeof window !== "undefined"
        ? window.innerWidth
        : 1024;
  const viewportHeight =
    typeof camera.userData.factoryViewportHeight === "number"
      ? camera.userData.factoryViewportHeight
      : typeof window !== "undefined"
        ? window.innerHeight
        : 768;

  const isCompact = viewportWidth <= COMPACT_FACTORY_BREAKPOINT;
  if (isCompact) {
    camera.position.copy(MOBILE_CAMERA.position);
    controls.target.copy(MOBILE_CAMERA.target);
    camera.up.set(0, 1, 0);
    return;
  }

  const approach = smoothstep(0, 0.25, progress);
  const inspect = smoothstep(0.25, 0.7, progress);
  const settle = smoothstep(0.7, 1, progress);

  const camA = lerpVector(CAMERA_PATH.overview, CAMERA_PATH.iso, approach);
  const camB = lerpVector(CAMERA_PATH.iso, CAMERA_PATH.close, inspect);
  const camC = lerpVector(CAMERA_PATH.close, CAMERA_PATH.final, settle);
  const baseCamPos = lerpVector(camA, lerpVector(camB, camC, settle), inspect * 0.55);

  const target = lerpVector(
    CAMERA_PATH.lookStart,
    lerpVector(CAMERA_PATH.lookMid, CAMERA_PATH.lookEnd, settle),
    smoothstep(0.24, 1, progress)
  );

  const portraitBlend = getPortraitBlend(viewportWidth, viewportHeight);
  if (portraitBlend > 0) {
    const toCamera = new THREE.Vector3().subVectors(baseCamPos, target);
    toCamera.multiplyScalar(1 + portraitBlend * 0.55);
    camera.position.copy(new THREE.Vector3().addVectors(target, toCamera));
  } else {
    camera.position.copy(baseCamPos);
  }

  camera.up.set(0, 1, 0);
  controls.target.copy(target);
}
