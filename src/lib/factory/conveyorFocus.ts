import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { easeOutCubic, lerpVector } from "./math";
import type { FlowState } from "./flowOptimization";
import {
  BASELINE_LINE_SPEED,
  OPTIMIZED_MOVER_COUNT,
} from "./flowOptimization";

export type ConveyorFocusPhase = "idle" | "entering" | "active" | "exiting";

export type ConveyorFocusState = {
  phase: ConveyorFocusPhase;
  t: number;
  fromCamera: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toCamera: THREE.Vector3;
  toTarget: THREE.Vector3;
};

export const CONVEYOR_FOCUS_CAMERA = new THREE.Vector3(0.35, 8.4, 6.2);
export const CONVEYOR_FOCUS_TARGET = new THREE.Vector3(0.15, 0.12, -0.08);

const ENTER_DURATION = 0.85;
const EXIT_DURATION = 0.65;

export function startConveyorFocus(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): ConveyorFocusState {
  return {
    phase: "entering",
    t: 0,
    fromCamera: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toCamera: CONVEYOR_FOCUS_CAMERA.clone(),
    toTarget: CONVEYOR_FOCUS_TARGET.clone(),
  };
}

export function tickConveyorFocus(
  state: ConveyorFocusState,
  deltaSec: number,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
): { state: ConveyorFocusState | null; done: boolean } {
  const duration =
    state.phase === "entering"
      ? ENTER_DURATION
      : state.phase === "exiting"
        ? EXIT_DURATION
        : 0;

  if (state.phase === "active") {
    return { state, done: false };
  }

  const nextT = Math.min(1, state.t + deltaSec / Math.max(0.001, duration));
  const eased = easeOutCubic(nextT);

  camera.position.copy(lerpVector(state.fromCamera, state.toCamera, eased));
  controls.target.copy(lerpVector(state.fromTarget, state.toTarget, eased));

  if (nextT >= 1) {
    if (state.phase === "entering") {
      return {
        state: { ...state, phase: "active", t: 1 },
        done: false,
      };
    }
    return { state: null, done: true };
  }

  return { state: { ...state, t: nextT }, done: false };
}

export function beginConveyorFocusExit(state: ConveyorFocusState): ConveyorFocusState {
  return {
    ...state,
    phase: "exiting",
    t: 0,
    fromCamera: state.toCamera.clone(),
    fromTarget: state.toTarget.clone(),
    toCamera: state.fromCamera.clone(),
    toTarget: state.fromTarget.clone(),
  };
}

export function snapConveyorFocusExit(
  state: ConveyorFocusState,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls
) {
  camera.position.copy(state.fromCamera);
  controls.target.copy(state.fromTarget);
}

export function conveyorFocusBlend(state: ConveyorFocusState | null): number {
  if (!state) return 0;
  if (state.phase === "active") return 1;
  if (state.phase === "entering") return easeOutCubic(state.t);
  return 1 - easeOutCubic(state.t);
}

export function applyConveyorFocusVisibility(
  machineGroups: THREE.Group[],
  shellGroup: THREE.Group,
  blend: number
) {
  const machineOpacity = 1 - blend;

  machineGroups.forEach((group) => {
    group.visible = machineOpacity > 0.02;
    group.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (!mat?.isMaterial) return;
      if (group.visible) {
        if (typeof obj.userData.baseOpacity === "number") {
          mat.opacity = obj.userData.baseOpacity;
        }
        return;
      }
      if (typeof obj.userData.baseOpacity !== "number" && mat.transparent) {
        obj.userData.baseOpacity = mat.opacity;
      }
    });
  });

  shellGroup.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat?.isMaterial || !mat.transparent) return;
    if (typeof obj.userData.baseOpacity !== "number") {
      obj.userData.baseOpacity = mat.opacity;
    }
    mat.opacity = THREE.MathUtils.lerp(obj.userData.baseOpacity as number, 0.28, blend);
  });
}

export function overrideFlowForConveyorFocus(
  flow: FlowState,
  blend: number
): FlowState {
  if (blend <= 0.001) return flow;

  return {
    ...flow,
    machineLive: THREE.MathUtils.lerp(flow.machineLive, 0, blend),
    conveyorLive: THREE.MathUtils.lerp(flow.conveyorLive, BASELINE_LINE_SPEED * 1.15, blend),
    activeMoverCount: THREE.MathUtils.lerp(
      flow.activeMoverCount,
      OPTIMIZED_MOVER_COUNT,
      blend
    ),
    accentLevel: THREE.MathUtils.lerp(flow.accentLevel, 0.55, blend),
  };
}
