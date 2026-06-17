import * as THREE from "three";

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpVector(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

export function easeOutCubic(t: number) {
  const c = clamp(t);
  return 1 - Math.pow(1 - c, 3);
}

export function easeInOutCubic(t: number) {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function easeOutQuint(t: number) {
  const c = clamp(t);
  return 1 - Math.pow(1 - c, 5);
}

export function easeOutBack(t: number, overshoot = 1.1) {
  const c = clamp(t);
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + overshoot * Math.pow(c - 1, 2);
}
