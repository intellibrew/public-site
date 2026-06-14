import * as THREE from "three";
import { smoothstep } from "./math";
import type { RevealStep } from "./types";

export function revealPart(item: RevealStep, progress: number) {
  const alpha = smoothstep(item.start, item.end, progress);
  item.group.visible = alpha > 0.001;

  const eased = 1 - Math.pow(1 - alpha, 3);

  const baseScale = item.group.userData.baseScale ?? item.group.scale.x;
  item.group.userData.baseScale = baseScale;
  item.group.scale.setScalar(baseScale);

  const liftHeight = item.group.userData.buildFromLift ?? 0.48;
  item.group.position.y = (item.group.userData.baseY ?? 0) + (1 - eased) * liftHeight;
}

export function prepGroup(group: THREE.Group) {
  group.userData.baseY = group.position.y;
  group.userData.buildFromLift = 0.48;
  return group;
}
