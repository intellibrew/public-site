import * as THREE from "three";

export const SCENE_BACKGROUND = 0x050809;
export const SCENE_FOG = { color: 0x050a0c, density: 0.011 };

export const RENDERER_SETTINGS = {
  pixelRatioCap: 2,
  mobilePixelRatioCap: 2,
  toneExposure: 1.38,
} as const;

export function getEffectivePixelRatio(): number {
  if (typeof window === "undefined") return 1;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const cap = isMobile
    ? RENDERER_SETTINGS.mobilePixelRatioCap
    : RENDERER_SETTINGS.pixelRatioCap;

  return Math.min(window.devicePixelRatio, cap);
}

export const CAMERA_SETTINGS = {
  fov: 40,
  near: 0.1,
  far: 120,
} as const;

export const CAMERA_PATH = {
  overview: new THREE.Vector3(6.4, 10.4, 6.2),
  iso: new THREE.Vector3(8.4, 8.2, 8.1),
  close: new THREE.Vector3(7.8, 7.1, 7.4),
  final: new THREE.Vector3(7.35, 6.55, 6.95),
  lookStart: new THREE.Vector3(0, 0, 0),
  lookMid: new THREE.Vector3(0, 0.28, 0),
  lookEnd: new THREE.Vector3(0.15, 0.32, -0.02),
} as const;

export const CONTROL_SETTINGS = {
  dampingFactor: 0.1,
  rotateSpeed: 0.52,
  panSpeed: 0.32,
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
  minDistance: 3.6,
  maxDistance: 28,
  speed: 0.0014,
  smoothFactor: 0.16,
} as const;
