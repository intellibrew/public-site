import * as THREE from "three";
import { lerp, smoothstep } from "./math";
import type { RevealStep } from "./types";

export function revealPart(item: RevealStep, progress: number) {
  const alpha = smoothstep(item.start, item.end, progress);
  item.group.visible = alpha > 0.01;
  const fromScale = item.group.userData.buildFromScale ?? 0.92;
  const fromLift = item.group.userData.buildFromLift ?? 0.08;
  const targetScale = item.group.userData.baseScale ?? item.group.scale.x;
  item.group.userData.baseScale = targetScale;
  const eased = smoothstep(0, 1, alpha);
  const scale = targetScale * lerp(fromScale, 1, eased);
  item.group.scale.setScalar(scale);
  item.group.position.y = item.group.userData.baseY + (1 - eased) * fromLift;
}

export function prepGroup(group: THREE.Group) {
  group.userData.baseY = group.position.y;
  group.userData.buildFromScale = 0.92;
  group.userData.buildFromLift = 0.08;
  return group;
}
