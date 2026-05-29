import { lerp, smoothstep } from "./math";
import type { RobotJointPose } from "./types";

export function intakePhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  if (t < 0.12) return { travel: 0, handoff: 0, lift: 0 };
  if (t < 0.4) {
    const p = (t - 0.12) / 0.28;
    const eased = p * p * (3 - 2 * p);
    return { travel: eased, handoff: 0, lift: eased * 0.55 };
  }
  if (t < 0.52) {
    const p = (t - 0.4) / 0.12;
    return { travel: 1, handoff: 1 - p * 0.65, lift: 0.55 + p * 0.45 };
  }
  if (t < 0.82) {
    const p = (t - 0.52) / 0.3;
    const eased = 1 - (1 - p) * (1 - p) * (3 - 2 * (1 - p));
    return { travel: 1 - eased, handoff: 0, lift: 1 - eased * 0.55 };
  }
  return { travel: 0, handoff: 0, lift: 0 };
}

export function pressPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  if (t < 0.1) return { stroke: 0, impact: 0, phase: "idle" as const };
  if (t < 0.34) {
    const p = (t - 0.1) / 0.24;
    const eased = p * p * (3 - 2 * p);
    return { stroke: eased, impact: p > 0.92 ? (p - 0.92) / 0.08 : 0, phase: "down" as const };
  }
  if (t < 0.42) return { stroke: 1, impact: 1 - (t - 0.34) / 0.08, phase: "dwell" as const };
  if (t < 0.62) {
    const p = (t - 0.42) / 0.2;
    const eased = 1 - (1 - p) * (1 - p) * (3 - 2 * (1 - p));
    return { stroke: 1 - eased, impact: 0, phase: "up" as const };
  }
  return { stroke: 0, impact: 0, phase: "idle" as const };
}

export function blendArmPose(from: RobotJointPose, to: RobotJointPose, t: number): RobotJointPose {
  return {
    yaw: lerp(from.yaw, to.yaw, t),
    shoulder: lerp(from.shoulder, to.shoulder, t),
    elbow: lerp(from.elbow, to.elbow, t),
    wrist: lerp(from.wrist, to.wrist, t),
    grip: lerp(from.grip, to.grip, t),
    carry: lerp(from.carry, to.carry, t),
  };
}

export function pickPlacePhase(phase01: number): RobotJointPose {
  const t = phase01 - Math.floor(phase01);
  const poses = {
    home: { yaw: -0.52, shoulder: -0.82, elbow: 1.14, wrist: -0.24, grip: 0.064, carry: 0 },
    sourceHover: { yaw: 0.04, shoulder: -0.58, elbow: 0.86, wrist: -0.36, grip: 0.064, carry: 0 },
    sourcePick: { yaw: 0.08, shoulder: -0.5, elbow: 0.76, wrist: -0.42, grip: 0.034, carry: 1 },
    carryLift: { yaw: -0.3, shoulder: -0.92, elbow: 1.02, wrist: -0.16, grip: 0.034, carry: 1 },
    targetHover: { yaw: -1.52, shoulder: -0.62, elbow: 0.9, wrist: -0.34, grip: 0.034, carry: 1 },
    targetPlace: { yaw: -1.58, shoulder: -0.54, elbow: 0.8, wrist: -0.4, grip: 0.034, carry: 1 },
    targetRelease: { yaw: -1.58, shoulder: -0.54, elbow: 0.8, wrist: -0.4, grip: 0.066, carry: 0 },
  } as const;

  if (t < 0.1) return blendArmPose(poses.home, poses.home, t / 0.1);
  if (t < 0.22) return blendArmPose(poses.home, poses.sourceHover, smoothstep(0.1, 0.22, t));
  if (t < 0.28) return blendArmPose(poses.sourceHover, poses.sourcePick, smoothstep(0.22, 0.28, t));
  if (t < 0.36) return blendArmPose(poses.sourcePick, poses.carryLift, smoothstep(0.28, 0.36, t));
  if (t < 0.58) return blendArmPose(poses.carryLift, poses.targetHover, smoothstep(0.36, 0.58, t));
  if (t < 0.68) return blendArmPose(poses.targetHover, poses.targetPlace, smoothstep(0.58, 0.68, t));
  if (t < 0.74) return blendArmPose(poses.targetPlace, poses.targetRelease, smoothstep(0.68, 0.74, t));
  if (t < 0.9) return blendArmPose(poses.targetRelease, poses.home, smoothstep(0.74, 0.9, t));
  return poses.home;
}
