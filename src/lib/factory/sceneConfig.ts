import * as THREE from "three";
import { LAYOUT } from "../layoutBreakpoints";

export const SCENE_BACKGROUND = 0x050809;
export const SCENE_FOG = { color: 0x050a0c, density: 0.011 };

export const RENDERER_SETTINGS = {
  pixelRatioCap: 1.5,
  phonePixelRatioCap: 2.5,
  compactPixelRatioCap: 2,
  toneExposure: 1.38,
} as const;

export const COMPACT_FACTORY_BREAKPOINT = 1024;

export function getEffectivePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  if (width <= LAYOUT.phoneMax) {
    return Math.min(dpr, RENDERER_SETTINGS.phonePixelRatioCap);
  }
  if (width <= COMPACT_FACTORY_BREAKPOINT) {
    return Math.min(dpr, RENDERER_SETTINGS.compactPixelRatioCap);
  }
  return Math.min(dpr, RENDERER_SETTINGS.pixelRatioCap);
}

export const CAMERA_SETTINGS = {
  fov: 40,
  portraitFov: 58,
  near: 0.1,
  far: 120,
} as const;

export const MOBILE_CAMERA = {
  position: new THREE.Vector3(7.2, 13.6, 10.8),
  target: new THREE.Vector3(0.1, 0.26, -0.55),
} as const;

export const CAMERA_PATH = {
  overview: new THREE.Vector3(7.5, 12.5, 9.2),
  iso: new THREE.Vector3(6.85, 11.0, 8.2),
  close: new THREE.Vector3(6.15, 9.6, 7.3),
  final: new THREE.Vector3(5.55, 8.7, 6.55),
  lookStart: new THREE.Vector3(0.1, 0.26, -0.7),
  lookMid: new THREE.Vector3(0.4, 0.28, -0.15),
  lookEnd: new THREE.Vector3(0.75, 0.28, 0.22),
} as const;

export const POINTER_DRAG_THRESHOLD_SQ = 6 * 6;

export const CONTROL_SETTINGS = {
  dampingFactor: 0.12,
  rotateSpeed: 0.58,
  panSpeed: 0.46,
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
  maxDistance: 18.5,
  speed: 0.0014,
  smoothFactor: 0.16,
} as const;
