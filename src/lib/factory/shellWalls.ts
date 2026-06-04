import * as THREE from "three";
import { clamp, smoothstep } from "./math";

export const SHELL_WALL_LAYOUT = {
  backZ: -4.28,
  leftX: -6.9,
  fadeStart: 0.25,
  fadeEnd: 0.55,
} as const;

export type ShellWallSide = "back" | "left" | "corner";
export type ShellSurfaceKind = "wall" | "glass" | "trim";

const BASE_OPACITY: Record<ShellSurfaceKind, number> = {
  wall: 0.94,
  glass: 0.22,
  trim: 1,
};

const FADED_OPACITY: Record<ShellSurfaceKind, number> = {
  wall: 0.06,
  glass: 0.04,
  trim: 0.14,
};

export function tagShellWallMesh(
  mesh: THREE.Mesh,
  side: ShellWallSide,
  surface: ShellSurfaceKind = "trim"
) {
  mesh.userData.shellWall = side;
  mesh.userData.shellSurface = surface;
  return mesh;
}

function fadeForSide(
  side: ShellWallSide,
  backFade: number,
  leftFade: number
): number {
  if (side === "back") return backFade;
  if (side === "left") return leftFade;
  return Math.max(backFade, leftFade);
}

export function updateShellWallFade(
  shell: THREE.Group,
  camera: THREE.Camera,
  options: { hideWalls?: boolean } = {}
) {
  const { backZ, leftX, fadeStart, fadeEnd } = SHELL_WALL_LAYOUT;
  const cam = camera.position;

  const backFade = 1 - smoothstep(backZ - fadeEnd, backZ + fadeStart, cam.z);
  const leftFade = 1 - smoothstep(leftX - fadeEnd, leftX + fadeStart, cam.x);

  shell.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const side = obj.userData.shellWall as ShellWallSide | undefined;
    if (!side) return;

    if (options.hideWalls) {
      obj.visible = false;
      return;
    }
    obj.visible = true;

    const surface = (obj.userData.shellSurface as ShellSurfaceKind | undefined) ?? "trim";
    const fade = fadeForSide(side, backFade, leftFade);
    const material = obj.material as THREE.MeshStandardMaterial;
    if (!material?.isMaterial) return;

    const targetOpacity = THREE.MathUtils.lerp(
      BASE_OPACITY[surface],
      FADED_OPACITY[surface],
      clamp(fade, 0, 1)
    );

    material.transparent = true;
    material.opacity = targetOpacity;
    material.depthWrite = targetOpacity > 0.45;
  });
}
