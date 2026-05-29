import * as THREE from "three";
import { clamp } from "./math";
import { layoutPoint } from "./layout";
import type { ConveyorPath, LayoutPoint } from "./types";

export function makePath(points: THREE.Vector3[]) {
  const cumulative = [0];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    total += points[i].distanceTo(points[i + 1]);
    cumulative.push(total);
  }
  return { points, cumulative, length: Math.max(total, 0.001) };
}

export function pointOnPath(path: ConveyorPath, t: number) {
  const normalized = ((t % 1) + 1) % 1;
  const target = normalized * path.length;
  const segments = path.points.length - 1;
  for (let i = 0; i < segments; i += 1) {
    const startDistance = path.cumulative[i];
    const endDistance = path.cumulative[i + 1];
    if (target <= endDistance || i === segments - 1) {
      const span = Math.max(0.0001, endDistance - startDistance);
      const local = (target - startDistance) / span;
      return new THREE.Vector3().lerpVectors(path.points[i], path.points[i + 1], local);
    }
  }
  return path.points[path.points.length - 1].clone();
}

export function pathTAtLayout(path: ConveyorPath, point: LayoutPoint) {
  const target = layoutPoint(point);
  let bestDistance = Infinity;
  let bestNormalized = 0;

  for (let i = 0; i < path.points.length - 1; i += 1) {
    const start = path.points[i];
    const end = path.points[i + 1];
    const segment = end.clone().sub(start);
    const segmentLengthSq = segment.lengthSq();
    if (segmentLengthSq < 0.000001) continue;

    const projectionT = clamp(target.clone().sub(start).dot(segment) / segmentLengthSq, 0, 1);
    const projection = start.clone().add(segment.multiplyScalar(projectionT));
    const distance = projection.distanceTo(target);

    if (distance < bestDistance) {
      bestDistance = distance;
      const segStart = path.cumulative[i];
      const segEnd = path.cumulative[i + 1];
      bestNormalized = (segStart + projectionT * (segEnd - segStart)) / path.length;
    }
  }

  return bestNormalized;
}
