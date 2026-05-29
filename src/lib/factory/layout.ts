import * as THREE from "three";
import { clamp, lerp } from "./math";
import type { LayoutPoint } from "./types";

export const LAYOUT = {
  conveyorRuns: [
    {
      id: "two-c-loop-snake",
      width: 0.24,
      movingPackages: 6,
      speed: 0.82,
      points: [
        { x: 60, y: 68 },
        { x: 88, y: 68 },
        { x: 88, y: 52 },
        { x: 50, y: 52 },
        { x: 50, y: 36 },
        { x: 78, y: 36 },
      ],
    },
  ],
  inputStation: {
    pad: { x: 55.2, y: 68.3, width: 2.2, depth: 1.35 },
    stacks: [
      { x: 52.8, y: 67.0, layers: 2, columns: 2, width: 0.82, depth: 0.52 },
      { x: 54.4, y: 70.2, layers: 2, columns: 1, width: 0.58, depth: 0.42 },
    ],
    dockBlocks: [
      { x: 57.15, y: 68.25, width: 0.48, depth: 0.32 },
    ],
  },
  blankingPressStation: {
    anchor: { x: 71.5, y: 68.2 },
    scale: 1.08,
    angle: 0,
  },
  stampingCellStation: {
    anchor: { x: 81.6, y: 68.2 },
    scale: 1.02,
    angle: 0,
  },
  subAssemblyStation: {
    anchor: { x: 88, y: 52 },
    scale: 0.96,
    angle: 0,
  },
  weldingStation: {
    anchor: { x: 71.5, y: 46.0 },
    scale: 0.86,
    angle: 0,
  },
  paintBoothStation: {
    anchor: { x: 60, y: 48 },
    scale: 0.5,
    angle: 0,
  },
  finalAssemblyStation: {
    anchor: { x: 50, y: 36 },
    scale: 0.46,
    angle: 0,
  },
  packagingStation: {
    anchor: { x: 78, y: 36 },
    scale: 0.50,
    angle: 0,
  },
} as const;

export function layoutToWorld(x: number, y: number) {
  const minX = -4.7;
  const maxX = 5.95;
  const minZ = -2.8;
  const maxZ = 2.55;
  const nx = clamp((x - 50) / 45);
  const nz = clamp((y - 28) / 42);
  return new THREE.Vector3(lerp(minX, maxX, nx), 0, lerp(minZ, maxZ, nz));
}

export function layoutPoint(point: LayoutPoint) {
  return layoutToWorld(point.x, point.y);
}
