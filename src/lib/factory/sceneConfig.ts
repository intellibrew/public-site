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
  position: new THREE.Vector3(6.15, 13.1, 11.45),
  target: new THREE.Vector3(0.9, 0.28, 0.2),
} as const;

export const CAMERA_PATH = {
  overview: new THREE.Vector3(6.55, 10.8, 8.65),
  iso: new THREE.Vector3(6.08, 9.45, 7.7),
  close: new THREE.Vector3(5.5, 8.3, 6.92),
  final: new THREE.Vector3(5.15, 7.75, 6.45),
  lookStart: new THREE.Vector3(0.55, 0.25, -0.02),
  lookMid: new THREE.Vector3(0.85, 0.28, 0.15),
  lookEnd: new THREE.Vector3(1.05, 0.28, 0.42),
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
  maxDistance: 16.2,
  speed: 0.0014,
  smoothFactor: 0.16,
} as const;
