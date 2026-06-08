import { lerp, smoothstep } from "./math";
import type { RobotJointPose } from "./types";

export function packagingPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  if (t < 0.08) {
    return { seal: 0, crane: 0, stack: 0, label: 0, inbound: t / 0.08 };
  }
  if (t < 0.3) {
    const p = (t - 0.08) / 0.22;
    const eased = p * p * (3 - 2 * p);
    return { seal: eased, crane: 0, stack: 0, label: 0, inbound: 1 };
  }
  if (t < 0.4) {
    const p = (t - 0.3) / 0.1;
    return { seal: 1, crane: 0, stack: 0, label: 0, inbound: 1 - p };
  }
  if (t < 0.66) {
    const p = (t - 0.4) / 0.26;
    const eased = p * p * (3 - 2 * p);
    return { seal: 1 - eased * 0.4, crane: eased, stack: smoothstep(0.5, 1, eased), label: 0, inbound: 0 };
  }
  if (t < 0.8) {
    const p = (t - 0.66) / 0.14;
    return { seal: 0.6 - p * 0.6, crane: 1 - p, stack: 1, label: p, inbound: 0 };
  }
  const p = (t - 0.8) / 0.2;
  return { seal: 0, crane: 0, stack: 1 - p * 0.35, label: 1 - p, inbound: 0 };
}

export function weldingPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  if (t < 0.08) {
    const p = t / 0.08;
    return { travel: 0, arc: 0, dwell: 0, approach: p };
  }
  if (t < 0.74) {
    const p = (t - 0.08) / 0.66;
    const eased = smoothstep(0, 1, p);
    return { travel: eased, arc: 1, dwell: 0, approach: 1 };
  }
  if (t < 0.84) {
    const p = (t - 0.74) / 0.1;
    return { travel: 1, arc: 1 - p, dwell: p, approach: 1 };
  }
  if (t < 0.94) {
    const p = (t - 0.84) / 0.1;
    const eased = smoothstep(0, 1, p);
    return { travel: 1 - eased, arc: 0, dwell: 1 - p, approach: 1 - p };
  }
  return { travel: 0, arc: 0, dwell: 0, approach: 0 };
}

export function paintBoothPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  if (t < 0.12) {
    const p = t / 0.12;
    return { spray: 0, uv: 0, exhaust: 0.15, inbound: p };
  }
  if (t < 0.48) {
    const p = (t - 0.12) / 0.36;
    const burst = Math.sin(p * Math.PI);
    return { spray: burst, uv: 0, exhaust: 0.25 + p * 0.35, inbound: 1 };
  }
  if (t < 0.64) {
    const p = (t - 0.48) / 0.16;
    const eased = smoothstep(0, 1, p);
    return { spray: (1 - eased) * 0.22, uv: eased, exhaust: 0.6, inbound: 1 - eased * 0.4 };
  }
  if (t < 0.86) {
    const p = (t - 0.64) / 0.22;
    return { spray: 0, uv: 1 - p, exhaust: 0.55 + p * 0.35, inbound: 0.6 - p * 0.6 };
  }
  const p = (t - 0.86) / 0.14;
  return { spray: 0, uv: 0, exhaust: 0.9 - p * 0.55, inbound: 0 };
}

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

export function blankingPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  const press = pressPhase(phase01);
  let feed = 0;
  if (t < 0.1) {
    feed = smoothstep(0.02, 0.1, t);
  } else if (t >= 0.58) {
    feed = smoothstep(0.58, 0.96, t);
  }
  const eject = press.phase === "up" ? smoothstep(0.42, 0.58, (t - 0.42) / 0.2) : 0;
  return { ...press, feed, eject };
}

export function stampingPhase(phase01: number) {
  const t = phase01 - Math.floor(phase01);
  const press = pressPhase(phase01);
  let pitch = 0;
  if (t < 0.08) {
    pitch = t / 0.08;
  } else if (t >= 0.56) {
    pitch = smoothstep(0.56, 0.94, t);
  }
  const stationIndex = Math.floor(phase01 * 6) % 6;
  const stationGlow = press.phase === "dwell" || press.impact > 0.4 ? 1 : press.stroke * 0.55;
  return { ...press, pitch, stationIndex, stationGlow, knockout: press.phase === "up" ? smoothstep(0.44, 0.58, (t - 0.42) / 0.2) : 0 };
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

  return samplePickPlaceTimeline(t, poses);
}

export function subAssemblyPickPlacePhase(phase01: number): RobotJointPose {
  const t = phase01 - Math.floor(phase01);
  const poses = {
    home: { yaw: 1.08, shoulder: -0.82, elbow: 1.14, wrist: -0.24, grip: 0.064, carry: 0 },
    sourceHover: { yaw: 0.04, shoulder: -0.58, elbow: 0.86, wrist: -0.36, grip: 0.064, carry: 0 },
    sourcePick: { yaw: 0.08, shoulder: -0.5, elbow: 0.76, wrist: -0.42, grip: 0.034, carry: 1 },
    carryLift: { yaw: 0.82, shoulder: -0.9, elbow: 1.02, wrist: -0.16, grip: 0.034, carry: 1 },
    targetHover: { yaw: -1.52, shoulder: -0.62, elbow: 0.9, wrist: -0.34, grip: 0.034, carry: 1 },
    targetPlace: { yaw: -1.58, shoulder: -0.54, elbow: 0.8, wrist: -0.4, grip: 0.034, carry: 1 },
    targetRelease: { yaw: -1.58, shoulder: -0.54, elbow: 0.8, wrist: -0.4, grip: 0.066, carry: 0 },
  } as const;

  return samplePickPlaceTimeline(t, poses);
}

function samplePickPlaceTimeline(
  t: number,
  poses: {
    home: RobotJointPose;
    sourceHover: RobotJointPose;
    sourcePick: RobotJointPose;
    carryLift: RobotJointPose;
    targetHover: RobotJointPose;
    targetPlace: RobotJointPose;
    targetRelease: RobotJointPose;
  }
): RobotJointPose {
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
