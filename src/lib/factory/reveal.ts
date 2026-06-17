import type { Group } from "three";
import { easeOutBack, easeOutQuint, lerp, smoothstep } from "./math";
import type { RevealStep } from "./types";

type RevealStyle = "settle" | "place";

export function revealPart(item: RevealStep, progress: number) {
  const alpha = smoothstep(item.start, item.end, progress);
  item.group.visible = alpha > 0.001;

  const baseScale = item.group.userData.baseScale ?? item.group.scale.x;
  item.group.userData.baseScale = baseScale;
  const baseY = item.group.userData.baseY ?? 0;
  const style = (item.group.userData.revealStyle as RevealStyle | undefined) ?? "place";
  const scaleMotion = easeOutBack(alpha, style === "settle" ? 0.55 : 0.72);

  item.group.scale.setScalar(baseScale * lerp(style === "settle" ? 0.98 : 0.94, 1, scaleMotion));

  if (style === "settle") {
    item.group.position.y = baseY;
    return;
  }

  const liftHeight = item.group.userData.buildFromLift ?? 0.26;
  item.group.position.y = baseY + (1 - easeOutQuint(alpha)) * liftHeight;
}

export function prepGroup(group: Group, options?: { revealStyle?: RevealStyle; lift?: number }) {
  group.userData.baseY = group.position.y;
  group.userData.revealStyle = options?.revealStyle ?? "place";
  group.userData.buildFromLift = options?.lift ?? 0.26;
  return group;
}
