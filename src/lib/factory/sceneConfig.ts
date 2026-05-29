import * as THREE from "three";

export const SCENE_BACKGROUND = 0x050809;
export const SCENE_FOG = { color: 0x050a0c, density: 0.014 };

export const RENDERER_SETTINGS = {
  pixelRatioCap: 1.75,
  toneExposure: 1.24,
} as const;

export const CAMERA_SETTINGS = {
  fov: 36,
  near: 0.1,
  far: 120,
} as const;

export const CAMERA_PATH = {
  overview: new THREE.Vector3(5.4, 8.6, 5.1),
  iso: new THREE.Vector3(6.95, 6.85, 6.55),
  close: new THREE.Vector3(6.35, 5.78, 5.62),
  final: new THREE.Vector3(5.95, 5.35, 5.2),
  lookStart: new THREE.Vector3(0, 0, 0),
  lookMid: new THREE.Vector3(0, 0.32, 0),
  lookEnd: new THREE.Vector3(0.2, 0.36, -0.04),
} as const;

export const CONTROL_SETTINGS = {
  dampingFactor: 0.08,
  rotateSpeed: 0.58,
  panSpeed: 0.35,
  minPolarAngle: 0.18,
  maxPolarAngle: 1.38,
} as const;

export const CANVAS_EVENTS_TO_STOP = [
  "pointerdown",
  "pointermove",
  "pointerup",
  "dblclick",
  "touchstart",
  "touchmove",
  "touchend",
] as const;

export const CTRL_WHEEL_ZOOM = {
  minDistance: 3.2,
  maxDistance: 24,
  speed: 0.0018,
} as const;
