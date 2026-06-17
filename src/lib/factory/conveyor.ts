import * as THREE from "three";
import { clamp, lerp, lerpVector, smoothstep } from "./math";
import { box, cylinder, prepareBeltMaterial } from "./mesh";
import { prepGroup } from "./reveal";
import { LAYOUT, layoutPoint } from "./layout";
import { makePath, pointOnPath } from "./path";
import {
  applyProductShape,
  makeProduct,
  primaryPath,
  productShapeAt,
  productY,
  PRODUCT_SHAPE_RECTANGLE,
} from "./products";
import type { Materials } from "./materials";
import type { BeltRig, ConveyorBeltSegment, ConveyorMover } from "./types";
import { getCurrentFlowState, OPTIMIZED_MOVER_COUNT } from "./flowOptimization";
import {
  crossedPackagingThreshold,
  PACKAGING_PATH_T,
  queuePackagingArrival,
} from "./packagingFlow";
import { crossedSubAssemblyThreshold, queueSubAssemblyArrival } from "./subAssemblyFlow";
import { buildQualityCheck, tickQualityCheck } from "./stations/qualityCheck";

const PAINT_THRESHOLD = 0.581;

const FINAL_ASSEMBLY_THRESHOLD = 0.748;

const QUALITY_CHECK_THRESHOLD = 0.874;
const QUALITY_CHECK_DIVERSION_SPAN = 0.055;
const QUALITY_CHECK_BRANCH_START = layoutPoint({ x: 64, y: 36 });
const QUALITY_CHECK_BRANCH_END = layoutPoint({ x: 64, y: 30.5 });

type FlowMotionState = {
  lastElapsed: number;
  smoothedLive: number;
  motionMs: number;
};

function getFlowMotion(group: THREE.Group): FlowMotionState {
  if (!group.userData.flowMotion) {
    group.userData.flowMotion = {
      lastElapsed: 0,
      smoothedLive: 1,
      motionMs: 0,
    } satisfies FlowMotionState;
  }
  return group.userData.flowMotion as FlowMotionState;
}

export function tickConveyor(group: THREE.Group, progress: number, elapsedMs: number) {
  const flow = getCurrentFlowState();
  const revealLive = smoothstep(0.68, 0.86, progress);
  const targetLive = revealLive * flow.conveyorLive;

  const motion = getFlowMotion(group);
  const deltaMs =
    motion.lastElapsed > 0 ? Math.min(48, Math.max(0, elapsedMs - motion.lastElapsed)) : 16;
  motion.lastElapsed = elapsedMs;

  const smoothFactor = 1 - Math.pow(0.001, deltaMs / 520);
  motion.smoothedLive = lerp(motion.smoothedLive, targetLive, smoothFactor);
  motion.motionMs += deltaMs * motion.smoothedLive;

  const beltRig = group.userData.beltRig as BeltRig | undefined;
  if (beltRig) {
    const travel = motion.motionMs * beltRig.travelRate;
    beltRig.segments.forEach((segment) => {
      const map = segment.beltMaterial.map;
      if (map) {
        map.offset.x = ((travel * segment.scrollSign * 0.92) % 1 + 1) % 1;
      }
      const rollerSpin = travel * segment.scrollSign * beltRig.rollerRate;
      segment.rollers.forEach((roller) => {
        roller.rotation.z = rollerSpin;
      });
    });
  }

  const movers = group.userData.movers as ConveyorMover[] | undefined;
  if (!movers?.length) return;

  const activeCount = Math.min(movers.length, Math.max(0, flow.activeMoverCount));
  let qcScanActivity = 0;
  let qcRejectActivity = 0;
  movers.forEach((mover, index) => {
    const isActive = index < activeCount;
    if (!isActive) {
      mover.mesh.visible = false;
      return;
    }

    const t = motion.motionMs * 0.000105 * mover.speed + mover.offset;
    const normalizedT = ((t % 1) + 1) % 1;
    const productSerial = Math.floor(t) * movers.length + index;
    const isRejected = productSerial % 10 === 0;

    if (mover.lastPathT !== undefined) {
      if (revealLive > 0.45 && !isRejected) {
        if (crossedSubAssemblyThreshold(mover.lastPathT, t)) {
          queueSubAssemblyArrival();
        }
        if (crossedPackagingThreshold(mover.lastPathT, t)) {
          queuePackagingArrival();
        }
      }
    }
    mover.lastPathT = t;
    let point = pointOnPath(mover.path, t);

    if (isRejected && normalizedT >= QUALITY_CHECK_THRESHOLD) {
      const divertProgress = smoothstep(
        0,
        1,
        clamp((normalizedT - QUALITY_CHECK_THRESHOLD) / QUALITY_CHECK_DIVERSION_SPAN)
      );
      point = lerpVector(QUALITY_CHECK_BRANCH_START, QUALITY_CHECK_BRANCH_END, divertProgress);
    }

    const scanWindow = 1 - clamp(Math.abs(normalizedT - QUALITY_CHECK_THRESHOLD) / 0.02);
    qcScanActivity = Math.max(qcScanActivity, smoothstep(0, 1, scanWindow));
    if (isRejected) {
      const rejectWindow = 1 - clamp(Math.abs(normalizedT - (QUALITY_CHECK_THRESHOLD + 0.014)) / 0.026);
      qcRejectActivity = Math.max(qcRejectActivity, smoothstep(0, 1, rejectWindow));
    }

    const productShape = productShapeAt(normalizedT);
    const bob = Math.sin(t * Math.PI * 2 + index) * 0.003 * motion.smoothedLive;
    const nextPoint = pointOnPath(mover.path, t + 0.003);
    const heading = Math.atan2(nextPoint.x - point.x, nextPoint.z - point.z);
    mover.mesh.position.set(point.x, productY(productShape, bob), point.z);
    mover.mesh.visible = revealLive > 0.02;
    mover.mesh.rotation.y = lerp(mover.mesh.rotation.y, heading, 0.14);
    applyProductShape(mover.mesh, productShape);

    const isPainted = normalizedT >= PAINT_THRESHOLD;
    const isPackaged = !isRejected && normalizedT >= PACKAGING_PATH_T;
    const moverMat = mover.mesh.material as THREE.MeshStandardMaterial;
    if (isPainted && isRejected) {
      moverMat.color.setHex(0xef4444);
      moverMat.emissive.setHex(0xdc2626);
      moverMat.emissiveIntensity = 0.45;
    } else if (isPackaged) {
      const fadeIn = smoothstep(PACKAGING_PATH_T, PACKAGING_PATH_T + 0.014, normalizedT);
      moverMat.color.setHex(0xf59e0b);
      moverMat.emissive.setHex(0xd97706);
      moverMat.emissiveIntensity = (0.38 + fadeIn * 0.28) * revealLive;
    } else if (isPainted) {
      moverMat.color.setHex(0x22c55e);
      moverMat.emissive.setHex(0x16a34a);
      moverMat.emissiveIntensity = 0.45;
    } else {
      moverMat.color.setHex(0x6b7883);
      moverMat.emissive.setHex(0x000000);
      moverMat.emissiveIntensity = 0;
    }

    const edgesMat = mover.edges.material as THREE.LineBasicMaterial;
    const isAssembled = normalizedT >= FINAL_ASSEMBLY_THRESHOLD;
    if (isAssembled) {
      const fadeIn = smoothstep(FINAL_ASSEMBLY_THRESHOLD, FINAL_ASSEMBLY_THRESHOLD + 0.018, normalizedT);
      edgesMat.opacity = fadeIn * 0.9 * revealLive;
    } else {
      edgesMat.opacity = 0;
    }
  });

  const qcStation = group.userData.qcStationGroup as THREE.Group | undefined;
  if (qcStation) {
    tickQualityCheck(qcStation, progress, qcScanActivity, qcRejectActivity, elapsedMs);
  }

  const branchPulse = group.userData.qualityCheckBranchPulse as THREE.Mesh | undefined;
  if (branchPulse) {
    const branchMat = branchPulse.material as THREE.MeshStandardMaterial;
    branchMat.opacity = qcRejectActivity * 0.42 * revealLive;
    branchMat.emissiveIntensity = qcRejectActivity * 1.5 * revealLive;
  }
}


export function buildConveyor(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  group.position.y = 0.02;
  const movers: ConveyorMover[] = [];
  const beltSegments: ConveyorBeltSegment[] = [];
  const primaryRun = LAYOUT.conveyorRuns[0];
  const beltTravelRate = 0.000105 * primaryRun.speed;
  const beltRollerRate = beltTravelRate * primaryPath.length / 0.026;

  const addConveyorCorner = (point: THREE.Vector3, width: number) => {
    const beltY = 0.178;
    const outer = width * 0.86;

    group.add(
      cylinder(outer * 0.96, outer, 0.01, [point.x, beltY - 0.005, point.z], materials.machineDark, 36)
    );

    const beltDisc = cylinder(
      outer * 0.74,
      outer * 0.74,
      0.022,
      [point.x, beltY, point.z],
      prepareBeltMaterial(materials.belt, 1.8, 1.8),
      36
    );
    beltDisc.userData.conveyorPickable = true;
    group.add(beltDisc);

    group.add(
      cylinder(outer * 0.92, outer * 0.94, 0.008, [point.x, beltY + 0.015, point.z], materials.darkSteel, 36)
    );

    const accent = cylinder(
      outer * 0.56,
      outer * 0.56,
      0.003,
      [point.x, beltY + 0.017, point.z],
      materials.tealGlow,
      36
    );
    const accentMat = accent.material as THREE.MeshStandardMaterial;
    accentMat.transparent = true;
    accentMat.opacity = 0.28;
    group.add(accent);
  };

  const addConveyorSegment = (start: THREE.Vector3, end: THREE.Vector3, width = 0.26) => {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz);
    const angle = -Math.atan2(dz, dx);
    const segment = new THREE.Group();
    segment.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
    segment.rotation.y = angle;

    const belt = box([length, 0.022, width], [0, 0.178, 0], prepareBeltMaterial(materials.belt, Math.max(2.4, length * 4.8), Math.max(1.8, width * 5.2)), false);
    const beltMat = belt.material as THREE.MeshStandardMaterial;

    const rOff = width / 2 + 0.014;
    [-rOff, rOff].forEach((z) => {
      segment.add(box([length, 0.052, 0.018], [0, 0.152, z], materials.darkSteel));
      segment.add(box([length, 0.008, 0.034], [0, 0.200, z], materials.darkSteel));
    });

    [-width / 2 + 0.003, width / 2 - 0.003].forEach((z) => {
      segment.add(box([length * 0.97, 0.005, 0.006], [0, 0.202, z], materials.tealGlow));
    });

    const postSpan = Math.max(2, Math.round(length / 1.0));
    const rollers: THREE.Mesh[] = [];
    for (let i = 0; i <= postSpan; i += 1) {
      const x = -length / 2 + (i / postSpan) * length;
      [-width / 2 + 0.018, width / 2 - 0.018].forEach((z) => {
        const post = cylinder(0.014, 0.016, 0.13, [x, 0.065, z], materials.steel, 8);
        segment.add(post);
        segment.add(box([0.042, 0.008, 0.042], [x, 0.004, z], materials.darkSteel, false));
      });

      if (i > 0 && i < postSpan) {
        const idler = cylinder(0.018, 0.018, width + 0.012, [x, 0.168, 0], materials.steel, 12);
        idler.rotation.x = Math.PI / 2;
        rollers.push(idler);
        segment.add(idler);
      }
    }

    [-length / 2 + 0.032, length / 2 - 0.032].forEach((x) => {
      const roller = cylinder(0.026, 0.026, width + 0.018, [x, 0.166, 0], materials.steel, 14);
      roller.rotation.x = Math.PI / 2;
      rollers.push(roller);
      segment.add(roller);
    });

    segment.add(belt);
    belt.userData.conveyorPickable = true;
    beltSegments.push({ beltMaterial: beltMat, rollers, scrollSign: 1 });
    group.add(segment);
  };

  const addConveyorRun = (points: THREE.Vector3[], width = 0.26, movingPackages = 0, speed = 1) => {
    points.slice(0, -1).forEach((point, index) => addConveyorSegment(point, points[index + 1], width));

    points.slice(1, -1).forEach((point) => addConveyorCorner(point, width));

    const path = makePath(points);
    const packageCount = Math.max(movingPackages, OPTIMIZED_MOVER_COUNT);
    for (let i = 0; i < packageCount; i += 1) {
      const cube = makeProduct(materials.machineLight, [points[0].x, productY(PRODUCT_SHAPE_RECTANGLE), points[0].z]);
      const edgesGeo = new THREE.EdgesGeometry(cube.geometry);
      const edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      cube.add(edges);
      movers.push({ mesh: cube, edges, path, speed, offset: i / packageCount });
      cube.userData.conveyorPickable = true;
      cube.visible = false;
      group.add(cube);
    }
  };

  LAYOUT.conveyorRuns.forEach((run) => {
    const points = run.points.map((point) => layoutPoint(point));
    addConveyorRun(points, run.width, run.movingPackages, run.speed);
  });

  addConveyorSegment(QUALITY_CHECK_BRANCH_START, QUALITY_CHECK_BRANCH_END, 0.18);

  const branchMid = lerpVector(QUALITY_CHECK_BRANCH_START, QUALITY_CHECK_BRANCH_END, 0.58);
  const branchLength = QUALITY_CHECK_BRANCH_START.distanceTo(QUALITY_CHECK_BRANCH_END);
  const qcBranchNode = cylinder(0.1, 0.1, 0.012, [QUALITY_CHECK_BRANCH_START.x, 0.208, QUALITY_CHECK_BRANCH_START.z], materials.machineDark, 20);
  const qcBranchRing = cylinder(0.082, 0.082, 0.005, [QUALITY_CHECK_BRANCH_START.x, 0.217, QUALITY_CHECK_BRANCH_START.z], materials.tealGlow, 20);
  const branchPulse = box([0.048, 0.01, branchLength * 0.52], [branchMid.x, 0.218, branchMid.z], materials.tealGlow, false);
  const branchPulseMat = branchPulse.material as THREE.MeshStandardMaterial;
  branchPulseMat.transparent = true;
  branchPulseMat.opacity = 0;
  branchPulseMat.emissiveIntensity = 0;
  group.add(qcBranchNode, qcBranchRing, branchPulse);

  const rejectTray = new THREE.Group();
  rejectTray.position.set(QUALITY_CHECK_BRANCH_END.x, 0, QUALITY_CHECK_BRANCH_END.z);
  rejectTray.add(box([0.48, 0.036, 0.38], [0, 0.19, 0], materials.machineDark, false));
  rejectTray.add(box([0.42, 0.01, 0.3], [0, 0.214, 0], materials.zone, false));
  rejectTray.add(box([0.36, 0.006, 0.24], [0, 0.222, 0], materials.redLight, false));
  rejectTray.add(box([0.5, 0.16, 0.038], [0, 0.28, -0.19], materials.darkSteel));
  rejectTray.add(box([0.038, 0.12, 0.32], [-0.25, 0.26, 0], materials.darkSteel));
  rejectTray.add(box([0.038, 0.12, 0.32], [0.25, 0.26, 0], materials.darkSteel));
  rejectTray.add(box([0.34, 0.01, 0.018], [0, 0.36, -0.208], materials.redLight, false));
  rejectTray.add(box([0.22, 0.008, 0.012], [0, 0.368, -0.208], materials.tealGlow, false));
  group.add(rejectTray);

  const qcStation = buildQualityCheck(materials);
  qcStation.position.set(QUALITY_CHECK_BRANCH_START.x, 0, QUALITY_CHECK_BRANCH_START.z);
  group.add(qcStation);
  group.userData.qcStationGroup = qcStation;
  group.userData.qualityCheckBranchPulse = branchPulse;

  group.userData.movers = movers;
  group.userData.isConveyorRoot = true;
  group.userData.beltRig = {
    segments: beltSegments,
    travelRate: beltTravelRate,
    rollerRate: beltRollerRate,
  } satisfies BeltRig;
  return group;
}
