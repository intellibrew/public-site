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

type ShellWallEntry = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  side: ShellWallSide;
  surface: ShellSurfaceKind;
  visible?: boolean;
  opacity?: number;
  depthWrite?: boolean;
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

function getShellWallEntries(shell: THREE.Group): ShellWallEntry[] {
  const existing = shell.userData.shellWallEntries as ShellWallEntry[] | undefined;
  if (existing) return existing;

  const entries: ShellWallEntry[] = [];
  shell.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const side = obj.userData.shellWall as ShellWallSide | undefined;
    if (!side) return;

    const material = obj.material as THREE.MeshStandardMaterial;
    if (!material?.isMaterial) return;

    entries.push({
      mesh: obj,
      material,
      side,
      surface: (obj.userData.shellSurface as ShellSurfaceKind | undefined) ?? "trim",
    });
  });

  shell.userData.shellWallEntries = entries;
  return entries;
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

  getShellWallEntries(shell).forEach((entry) => {
    if (options.hideWalls) {
      if (entry.visible !== false) {
        entry.mesh.visible = false;
        entry.visible = false;
      }
      return;
    }
    if (entry.visible !== true) {
      entry.mesh.visible = true;
      entry.visible = true;
    }

    const fade = fadeForSide(entry.side, backFade, leftFade);
    const targetOpacity = THREE.MathUtils.lerp(
      BASE_OPACITY[entry.surface],
      FADED_OPACITY[entry.surface],
      clamp(fade, 0, 1)
    );
    const targetDepthWrite = targetOpacity > 0.45;

    if (entry.material.transparent !== true) {
      entry.material.transparent = true;
    }
    if (entry.opacity === undefined || Math.abs(entry.opacity - targetOpacity) > 0.001) {
      entry.material.opacity = targetOpacity;
      entry.opacity = targetOpacity;
    }
    if (entry.depthWrite !== targetDepthWrite) {
      entry.material.depthWrite = targetDepthWrite;
      entry.depthWrite = targetDepthWrite;
    }
  });
}
