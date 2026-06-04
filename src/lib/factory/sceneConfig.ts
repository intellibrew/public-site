import * as THREE from "three";

export const SCENE_BACKGROUND = 0x050809;
export const SCENE_FOG = { color: 0x050a0c, density: 0.011 };

export const RENDERER_SETTINGS = {
  pixelRatioCap: 2,
  toneExposure: 1.38,
} as const;

export const COMPACT_FACTORY_BREAKPOINT = 1024;

export function getEffectivePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  const isCompact = window.innerWidth <= COMPACT_FACTORY_BREAKPOINT;
  const cap = isCompact ? 1 : RENDERER_SETTINGS.pixelRatioCap;
  return Math.min(window.devicePixelRatio, cap);
}

export const CAMERA_SETTINGS = {
  fov: 40,
  portraitFov: 58,
  near: 0.1,
  far: 120,
} as const;

export const MOBILE_CAMERA = {
  position: new THREE.Vector3(5.8, 14.5, 11.0),
  target: new THREE.Vector3(0.5, 0.3, -0.3),
} as const;

export const FACTORY_CENTER = new THREE.Vector3(0.625, 0.3, -0.125);

export const CAMERA_PATH = {
  overview: new THREE.Vector3(6.2, 12.0, 8.2),
  iso: new THREE.Vector3(5.7, 10.55, 7.2),
  close: new THREE.Vector3(5.1, 9.35, 6.4),
  final: new THREE.Vector3(4.75, 8.75, 5.9),
  lookStart: new THREE.Vector3(0.35, 0.25, -0.05),
  lookMid: new THREE.Vector3(0.5, 0.3, -0.1),
  lookEnd: new THREE.Vector3(0.65, 0.32, -0.125),
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
] as const;

export const CTRL_WHEEL_ZOOM = {
  minDistance: 3.6,
  maxDistance: 16.2,
  speed: 0.0014,
  smoothFactor: 0.16,
} as const;
