import * as THREE from "three";
import { clamp, lerp, lerpVector, smoothstep } from "./math";
import { box, cylinder } from "./mesh";
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
import type { BeltRig, ConveyorBeltSegment, ConveyorMover, QcRig } from "./types";

const PAINT_THRESHOLD = 0.581;

const FINAL_ASSEMBLY_THRESHOLD = 0.748;

const QUALITY_CHECK_THRESHOLD = 0.874;
const QUALITY_CHECK_DIVERSION_SPAN = 0.055;
const QUALITY_CHECK_BRANCH_START = layoutPoint({ x: 64, y: 36 });
const QUALITY_CHECK_BRANCH_END = layoutPoint({ x: 64, y: 30.5 });

const PACKAGING_THRESHOLD = 0.964;

export function tickConveyor(group: THREE.Group, progress: number, elapsedMs: number) {
  const live = smoothstep(0.85, 0.95, progress);

  const beltRig = group.userData.beltRig as BeltRig | undefined;
  if (beltRig && live > 0.02) {
    const travel = elapsedMs * beltRig.travelRate * live;
    beltRig.segments.forEach((segment) => {
      const map = segment.beltMaterial.map;
      if (map) {
        map.offset.x = ((travel * segment.scrollSign * 0.92) % 1 + 1) % 1;
      }
      segment.rollers.forEach((roller) => {
        roller.rotation.z = travel * segment.scrollSign * beltRig.rollerRate;
      });
    });
  }

  const movers = group.userData.movers as ConveyorMover[] | undefined;
  if (!movers?.length) return;

  let qcScanActivity = 0;
  let qcRejectActivity = 0;
  movers.forEach((mover, index) => {
    const t = elapsedMs * 0.000105 * mover.speed + mover.offset;
    const normalizedT = ((t % 1) + 1) % 1;
    const productSerial = Math.floor(t) * movers.length + index;
    const isRejected = productSerial % 10 === 0;
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
    const bob = Math.sin(t * Math.PI * 2 + index) * 0.003 * live;
    const nextPoint = pointOnPath(mover.path, t + 0.003);
    const heading = Math.atan2(nextPoint.x - point.x, nextPoint.z - point.z);
    mover.mesh.position.set(point.x, productY(productShape, bob), point.z);
    mover.mesh.visible = live > 0.02;
    mover.mesh.rotation.y = lerp(mover.mesh.rotation.y, heading, 0.18 * live);
    applyProductShape(mover.mesh, productShape);

    const isPainted = normalizedT >= PAINT_THRESHOLD;
    const isPackaged = !isRejected && normalizedT >= PACKAGING_THRESHOLD;
    const moverMat = mover.mesh.material as THREE.MeshStandardMaterial;
    if (isPainted && isRejected) {
      moverMat.color.setHex(0xef4444);
      moverMat.emissive.setHex(0xdc2626);
      moverMat.emissiveIntensity = 0.45;
    } else if (isPackaged) {
      const fadeIn = smoothstep(PACKAGING_THRESHOLD, PACKAGING_THRESHOLD + 0.014, normalizedT);
      moverMat.color.setHex(0xf59e0b);
      moverMat.emissive.setHex(0xd97706);
      moverMat.emissiveIntensity = (0.38 + fadeIn * 0.28) * live;
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
      edgesMat.opacity = fadeIn * 0.9 * live;
    } else {
      edgesMat.opacity = 0;
    }
  });

  const qcRig = group.userData.qualityCheckRig as QcRig | undefined;
  if (qcRig) {
    qcRig.rejectPusher.position.z = lerp(0.23, -0.19, qcRejectActivity);

    const beamMat = qcRig.scanBeam.material as THREE.MeshStandardMaterial;
    beamMat.opacity = (0.12 + qcScanActivity * 0.42 + qcRejectActivity * 0.18) * live;
    beamMat.emissiveIntensity = (0.5 + qcScanActivity * 1.2) * live;

    const greenMat = qcRig.greenLamp.material as THREE.MeshStandardMaterial;
    greenMat.emissiveIntensity = (0.25 + qcScanActivity * 1.4) * live * (1 - qcRejectActivity * 0.65);
    greenMat.opacity = (0.28 + qcScanActivity * 0.48) * live * (1 - qcRejectActivity * 0.5);

    const redMat = qcRig.redLamp.material as THREE.MeshStandardMaterial;
    redMat.emissiveIntensity = (0.35 + qcRejectActivity * 2.4) * live;
    redMat.opacity = (0.2 + qcRejectActivity * 0.68) * live;

    const branchMat = qcRig.branchPulse.material as THREE.MeshStandardMaterial;
    branchMat.opacity = qcRejectActivity * 0.42 * live;
    branchMat.emissiveIntensity = qcRejectActivity * 1.5 * live;

    qcRig.rejectLight.intensity = qcRejectActivity * 1.6 * live;
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

  const addConveyorSegment = (start: THREE.Vector3, end: THREE.Vector3, width = 0.26) => {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dz);
    const angle = -Math.atan2(dz, dx);
    const segment = new THREE.Group();
    segment.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
    segment.rotation.y = angle;

    const belt = box([length, 0.022, width], [0, 0.178, 0], materials.belt, false);
    const beltMat = belt.material as THREE.MeshStandardMaterial;
    if (beltMat.map) {
      beltMat.map = beltMat.map.clone();
      beltMat.map.wrapS = THREE.RepeatWrapping;
      beltMat.map.wrapT = THREE.RepeatWrapping;
      beltMat.map.repeat.set(Math.max(2.4, length * 4.8), Math.max(1.8, width * 5.2));
      beltMat.map.needsUpdate = true;
    }

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
    beltSegments.push({ beltMaterial: beltMat, rollers, scrollSign: 1 });
    group.add(segment);
  };

  const addConveyorRun = (points: THREE.Vector3[], width = 0.26, movingPackages = 0, speed = 1) => {
    points.slice(0, -1).forEach((point, index) => addConveyorSegment(point, points[index + 1], width));

    points.slice(1, -1).forEach((point) => {
      const disc = cylinder(width * 0.72, width * 0.72, 0.014, [point.x, 0.178, point.z], materials.darkSteel, 18);
      group.add(disc);
      const ring = cylinder(width * 0.62, width * 0.62, 0.005, [point.x, 0.192, point.z], materials.tealGlow, 18);
      group.add(ring);
    });

    const path = makePath(points);
    for (let i = 0; i < movingPackages; i += 1) {
      const cube = makeProduct(materials.machineLight, [points[0].x, productY(PRODUCT_SHAPE_RECTANGLE), points[0].z]);
      const edgesGeo = new THREE.EdgesGeometry(cube.geometry);
      const edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      cube.add(edges);
      movers.push({ mesh: cube, edges, path, speed, offset: i / Math.max(1, movingPackages) });
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
  const qcBranchNode = cylinder(0.112, 0.112, 0.014, [QUALITY_CHECK_BRANCH_START.x, 0.207, QUALITY_CHECK_BRANCH_START.z], materials.darkSteel, 20);
  const qcBranchRing = cylinder(0.094, 0.094, 0.006, [QUALITY_CHECK_BRANCH_START.x, 0.218, QUALITY_CHECK_BRANCH_START.z], materials.tealGlow, 20);
  const branchPulse = box([0.048, 0.01, branchLength * 0.52], [branchMid.x, 0.218, branchMid.z], materials.tealGlow, false);
  const branchPulseMat = branchPulse.material as THREE.MeshStandardMaterial;
  branchPulseMat.transparent = true;
  branchPulseMat.opacity = 0;
  branchPulseMat.emissiveIntensity = 0;
  group.add(qcBranchNode, qcBranchRing, branchPulse);

  const rejectTray = new THREE.Group();
  rejectTray.position.set(QUALITY_CHECK_BRANCH_END.x, 0, QUALITY_CHECK_BRANCH_END.z);
  rejectTray.add(box([0.52, 0.04, 0.42], [0, 0.19, 0], materials.machineDark, false));
  rejectTray.add(box([0.44, 0.014, 0.34], [0, 0.219, 0], materials.redLight, false));
  rejectTray.add(box([0.55, 0.18, 0.046], [0, 0.29, -0.21], materials.darkSteel));
  rejectTray.add(box([0.046, 0.14, 0.36], [-0.28, 0.27, 0], materials.darkSteel));
  rejectTray.add(box([0.046, 0.14, 0.36], [0.28, 0.27, 0], materials.darkSteel));
  rejectTray.add(box([0.38, 0.012, 0.026], [0, 0.37, -0.236], materials.redLight));
  group.add(rejectTray);

  const qcStation = new THREE.Group();
  qcStation.position.set(QUALITY_CHECK_BRANCH_START.x, 0, QUALITY_CHECK_BRANCH_START.z);

  qcStation.add(box([0.82, 0.036, 0.52], [0, 0.224, 0], materials.machineDark, false));
  qcStation.add(box([0.7, 0.01, 0.4], [0, 0.248, 0], materials.zone, false));
  qcStation.add(box([0.055, 0.72, 0.055], [-0.38, 0.58, -0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [-0.38, 0.58, 0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [0.38, 0.58, -0.24], materials.machineDark));
  qcStation.add(box([0.055, 0.72, 0.055], [0.38, 0.58, 0.24], materials.machineDark));
  qcStation.add(box([0.86, 0.07, 0.08], [0, 0.94, -0.24], materials.darkSteel));
  qcStation.add(box([0.86, 0.07, 0.08], [0, 0.94, 0.24], materials.darkSteel));
  qcStation.add(box([0.09, 0.07, 0.56], [-0.38, 0.94, 0], materials.darkSteel));
  qcStation.add(box([0.09, 0.07, 0.56], [0.38, 0.94, 0], materials.darkSteel));
  qcStation.add(box([0.68, 0.014, 0.026], [0, 0.99, -0.24], materials.tealGlow));
  qcStation.add(box([0.68, 0.014, 0.026], [0, 0.99, 0.24], materials.tealGlow));

  qcStation.add(box([0.32, 0.18, 0.28], [0, 0.79, 0], materials.machine));
  qcStation.add(box([0.22, 0.06, 0.22], [0, 0.67, 0], materials.darkSteel));
  const qcLens = cylinder(0.04, 0.045, 0.07, [0, 0.62, 0], materials.glass, 14);
  qcLens.rotation.x = Math.PI / 2;
  qcStation.add(qcLens);
  const scanBeam = box([0.62, 0.012, 0.44], [0, 0.48, 0], materials.tealGlow, false);
  const scanBeamMat = scanBeam.material as THREE.MeshStandardMaterial;
  scanBeamMat.transparent = true;
  scanBeamMat.opacity = 0.14;
  scanBeamMat.emissiveIntensity = 0.5;
  qcStation.add(scanBeam);

  qcStation.add(box([0.04, 0.42, 0.04], [0.48, 0.82, 0.24], materials.darkSteel));
  const greenLamp = cylinder(0.046, 0.046, 0.04, [0.48, 1.04, 0.24], materials.paintGreen, 16);
  const redLamp = cylinder(0.046, 0.046, 0.04, [0.48, 1.1, 0.24], materials.redLight, 16);
  const greenLampMat = greenLamp.material as THREE.MeshStandardMaterial;
  const redLampMat = redLamp.material as THREE.MeshStandardMaterial;
  greenLampMat.transparent = true;
  redLampMat.transparent = true;
  greenLampMat.opacity = 0.42;
  redLampMat.opacity = 0.22;
  qcStation.add(greenLamp, redLamp);

  qcStation.add(box([0.32, 0.38, 0.16], [-0.42, 0.39, 0.34], materials.machineDark));
  qcStation.add(box([0.24, 0.1, 0.12], [-0.42, 0.52, 0.24], materials.machineLight));
  const rejectPusher = new THREE.Group();
  rejectPusher.position.set(-0.2, 0.29, 0.23);
  rejectPusher.add(box([0.36, 0.07, 0.06], [0, 0, 0], materials.steel));
  rejectPusher.add(box([0.46, 0.18, 0.045], [0, 0.02, -0.08], materials.warning));
  rejectPusher.add(box([0.38, 0.016, 0.02], [0, 0.12, -0.106], materials.darkSteel));
  qcStation.add(rejectPusher);
  qcStation.add(box([0.12, 0.08, 0.38], [-0.42, 0.3, 0.07], materials.darkSteel));

  qcStation.add(box([0.036, 0.42, 0.42], [0.53, 0.45, -0.02], materials.machineLight));
  const guardPanel = box([0.012, 0.34, 0.36], [0.552, 0.45, -0.02], materials.safetyGlass, false);
  const guardMat = guardPanel.material as THREE.MeshStandardMaterial;
  guardMat.opacity = 0.22;
  qcStation.add(guardPanel);
  qcStation.add(box([0.26, 0.48, 0.18], [0.64, 0.34, -0.3], materials.machineDark));
  qcStation.add(box([0.17, 0.12, 0.026], [0.64, 0.43, -0.392], materials.glass));
  qcStation.add(box([0.13, 0.012, 0.024], [0.64, 0.34, -0.394], materials.tealGlow));
  qcStation.add(cylinder(0.026, 0.026, 0.034, [0.58, 0.25, -0.394], materials.redLight, 12));
  qcStation.add(cylinder(0.022, 0.022, 0.034, [0.66, 0.25, -0.394], materials.paintGreen, 12));

  const rejectLight = new THREE.PointLight(0xef4444, 0, 1.4);
  rejectLight.position.set(0, 0.48, -0.24);
  qcStation.add(rejectLight);
  group.add(qcStation);

  group.userData.qualityCheckRig = {
    rejectPusher,
    scanBeam,
    greenLamp,
    redLamp,
    branchPulse,
    rejectLight,
  } satisfies QcRig;

  const conveyorCorners = LAYOUT.conveyorRuns.flatMap((run) => run.points.map((point) => layoutPoint(point)));
  conveyorCorners.forEach((point) => {
    const node = cylinder(0.094, 0.094, 0.014, [point.x, 0.205, point.z], materials.tealGlow, 20);
    const cap = cylinder(0.048, 0.048, 0.018, [point.x, 0.214, point.z], materials.safetyGlass, 16);
    group.add(node, cap);
  });

  group.userData.movers = movers;
  group.userData.beltRig = {
    segments: beltSegments,
    travelRate: beltTravelRate,
    rollerRate: beltRollerRate,
  } satisfies BeltRig;
  return group;
}
