import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { smoothstep } from "./math";
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
  controls.enableDamping = false;
  controls.dampingFactor = CONTROL_SETTINGS.dampingFactor;
  controls.enableZoom = false;
  controls.enablePan = true;
  controls.rotateSpeed = CONTROL_SETTINGS.rotateSpeed;
  controls.panSpeed = CONTROL_SETTINGS.panSpeed;
  controls.minPolarAngle = CONTROL_SETTINGS.minPolarAngle;
  controls.maxPolarAngle = CONTROL_SETTINGS.maxPolarAngle;
  controls.screenSpacePanning = true;
  controls.target.copy(CAMERA_PATH.lookStart);
}

function getPortraitBlend(viewportWidth: number, viewportHeight: number): number {
  const aspect = viewportWidth / Math.max(1, viewportHeight);
  const t = Math.min(1, Math.max(0, (0.85 - aspect) / (0.85 - 0.45)));
  return t * t * (3 - 2 * t);
}

const _camA = new THREE.Vector3();
const _camB = new THREE.Vector3();
const _camC = new THREE.Vector3();
const _camBC = new THREE.Vector3();
const _baseCamPos = new THREE.Vector3();
const _targetMidEnd = new THREE.Vector3();
const _target = new THREE.Vector3();
const _toCamera = new THREE.Vector3();

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

  _camA.lerpVectors(CAMERA_PATH.overview, CAMERA_PATH.iso, approach);
  _camB.lerpVectors(CAMERA_PATH.iso, CAMERA_PATH.close, inspect);
  _camC.lerpVectors(CAMERA_PATH.close, CAMERA_PATH.final, settle);
  _camBC.lerpVectors(_camB, _camC, settle);
  _baseCamPos.lerpVectors(_camA, _camBC, inspect * 0.55);

  _targetMidEnd.lerpVectors(CAMERA_PATH.lookMid, CAMERA_PATH.lookEnd, settle);
  _target.lerpVectors(CAMERA_PATH.lookStart, _targetMidEnd, smoothstep(0.24, 1, progress));

  const portraitBlend = getPortraitBlend(viewportWidth, viewportHeight);
  if (portraitBlend > 0) {
    _toCamera.subVectors(_baseCamPos, _target);
    _toCamera.multiplyScalar(1 + portraitBlend * 0.55);
    camera.position.copy(_target).add(_toCamera);
  } else {
    camera.position.copy(_baseCamPos);
  }

  camera.up.set(0, 1, 0);
  controls.target.copy(_target);
}
