import * as THREE from "three";
import { lerpVector, smoothstep } from "../math";
import { box, cylinder } from "../mesh";
import { prepGroup } from "../reveal";
import { LAYOUT, layoutPoint } from "../layout";
import type { Materials } from "../materials";
import { applyProductShape, makeProduct, PRODUCT_SHAPE_RECTANGLE } from "../products";
import { intakePhase } from "../stationMotion";
import type { IntakeRig } from "../types";

export function tickIntake(group: THREE.Group, progress: number, elapsedMs: number) {
  const rig = group.userData.intakeRig as IntakeRig | undefined;
  if (!rig) return;

  const live = smoothstep(0.85, 0.98, progress);
  const cycle = intakePhase(elapsedMs * 0.00038);
  const travel = cycle.travel * live;
  const pos = lerpVector(rig.start, rig.end, travel);
  rig.carrier.position.set(pos.x, 0.128 + cycle.lift * 0.04 * live, pos.z);
  rig.carrierLoad.visible = travel > 0.04;
  applyProductShape(rig.carrierLoad, PRODUCT_SHAPE_RECTANGLE);
  rig.carrierLoad.position.y = 0.146 + PRODUCT_SHAPE_RECTANGLE.height / 2;

  const liftHomeY = rig.liftTable.userData.homeY as number;
  const liftStroke = rig.liftTable.userData.stroke as number;
  rig.liftTable.position.y = liftHomeY + cycle.lift * liftStroke * live;

  rig.intakePulse.scale.setScalar(0.88 + cycle.handoff * 0.24 * live);
  const pulseMaterial = rig.intakePulse.material as THREE.MeshStandardMaterial;
  pulseMaterial.opacity = 0.16 + cycle.handoff * 0.52 * live;
  pulseMaterial.emissiveIntensity = (0.35 + cycle.handoff * 2.4) * live;

  const scanMat = rig.scanBeam.material as THREE.MeshStandardMaterial;
  scanMat.opacity = (0.08 + cycle.handoff * 0.42) * live;
  scanMat.emissiveIntensity = (0.2 + cycle.handoff * 2.8) * live;
}

export function buildIntake(materials: Materials) {
  const group = prepGroup(new THREE.Group());
  const { inputStation } = LAYOUT;
  const firstConveyorPoint = layoutPoint(LAYOUT.conveyorRuns[0].points[0]);
  const padCenter = layoutPoint(inputStation.pad);
  const padW = inputStation.pad.width;
  const padD = inputStation.pad.depth;

  group.add(box([padW, 0.038, padD], [padCenter.x, 0.026, padCenter.z], materials.machineDark, false));
  group.add(box([padW * 0.92, 0.014, padD * 0.88], [padCenter.x, 0.058, padCenter.z], materials.zone, false));
  group.add(box([padW * 0.72, 0.005, 0.05], [padCenter.x, 0.076, padCenter.z], materials.darkSteel, false));

  const rackCenter = layoutPoint({ x: 53.1, y: 68.55 });
  [-0.34, 0.34].forEach((x) => {
    group.add(box([0.05, 0.72, 0.05], [rackCenter.x + x, 0.38, rackCenter.z], materials.steel));
  });
  [0.18, 0.42, 0.66].forEach((y) => {
    group.add(box([0.72, 0.022, 0.52], [rackCenter.x, y, rackCenter.z], materials.machineDark));
    group.add(box([0.64, 0.012, 0.02], [rackCenter.x, y + 0.016, rackCenter.z + 0.24], materials.darkSteel));
  });
  [0.22, 0.46].forEach((y, index) => {
    group.add(box([0.58, 0.034, 0.38], [rackCenter.x + 0.04, y, rackCenter.z - 0.04], index % 2 === 0 ? materials.machineLight : materials.enamel));
    group.add(box([0.58, 0.006, 0.04], [rackCenter.x + 0.04, y + 0.02, rackCenter.z + 0.14], materials.steel));
  });

  const addInputStack = (stack: (typeof inputStation.stacks)[number], variant: "coil" | "crate") => {
    const center = layoutPoint(stack);
    group.add(box([stack.width + 0.06, 0.028, stack.depth + 0.06], [center.x, 0.042, center.z], materials.package));
    group.add(box([stack.width + 0.02, 0.012, stack.depth + 0.02], [center.x, 0.058, center.z], materials.darkSteel));

    if (variant === "coil") {
      const coil = cylinder(stack.depth * 0.28, stack.depth * 0.28, stack.width * 0.72, [center.x, 0.14, center.z], materials.machineLight, 20);
      coil.rotation.z = Math.PI / 2;
      group.add(coil);
      group.add(cylinder(stack.depth * 0.1, stack.depth * 0.1, stack.width * 0.76, [center.x, 0.14, center.z], materials.darkSteel, 12));
      group.add(box([stack.width * 0.78, 0.014, 0.028], [center.x, 0.14, center.z + stack.depth * 0.22], materials.steel));
      group.add(box([stack.width * 0.78, 0.014, 0.028], [center.x, 0.14, center.z - stack.depth * 0.22], materials.steel));
      return;
    }

    const columns = Math.max(1, stack.columns);
    const boxWidth = stack.width / columns - 0.06;
    for (let layer = 0; layer < stack.layers; layer += 1) {
      for (let column = 0; column < columns; column += 1) {
        const offsetX = columns === 1 ? 0 : -stack.width / 4 + (column * stack.width) / 2;
        group.add(box(
          [boxWidth, 0.1, stack.depth * 0.72],
          [center.x + offsetX, 0.098 + layer * 0.104, center.z],
          layer % 2 === 0 ? materials.enamel : materials.machineLight
        ));
        group.add(box([boxWidth * 0.92, 0.008, 0.018], [center.x + offsetX, 0.104 + layer * 0.104, center.z + stack.depth * 0.3], materials.steel));
      }
    }
  };

  inputStation.stacks.forEach((stack, index) => addInputStack(stack, index === 0 ? "coil" : "crate"));

  const dockCenter = new THREE.Vector3(firstConveyorPoint.x - 0.42, 0, firstConveyorPoint.z + 0.02);
  group.add(box([1.12, 0.08, 0.72], [dockCenter.x, 0.052, dockCenter.z], materials.machineDark));
  group.add(box([0.96, 0.016, 0.58], [dockCenter.x, 0.1, dockCenter.z], materials.zone));

  const liftTable = new THREE.Group();
  liftTable.position.set(dockCenter.x, 0.108, dockCenter.z);
  liftTable.userData.homeY = 0.108;
  liftTable.userData.stroke = 0.06;
  liftTable.add(box([0.82, 0.034, 0.52], [0, 0.018, 0], materials.hydraulic));
  liftTable.add(box([0.74, 0.012, 0.44], [0, 0.038, 0], materials.machineLight));
  [-0.28, 0.28].forEach((x) => {
    liftTable.add(box([0.034, 0.028, 0.44], [x, 0.012, 0], materials.darkSteel));
  });
  for (let i = -3; i <= 3; i += 1) {
    const roller = cylinder(0.022, 0.022, 0.48, [i * 0.11, 0.042, 0], materials.steel, 10);
    roller.rotation.z = Math.PI / 2;
    liftTable.add(roller);
  }
  group.add(liftTable);

  [-0.22, 0.22].forEach((x) => {
    group.add(box([0.04, 0.14, 0.04], [dockCenter.x + x, 0.12, dockCenter.z - 0.18], materials.steel));
    group.add(box([0.04, 0.14, 0.04], [dockCenter.x + x, 0.12, dockCenter.z + 0.18], materials.steel));
  });
  group.add(box([0.72, 0.06, 0.48], [dockCenter.x, 0.08, dockCenter.z], materials.darkSteel));

  group.add(box([0.04, 0.38, 0.56], [dockCenter.x - 0.48, 0.24, dockCenter.z], materials.machine));
  group.add(box([0.04, 0.38, 0.56], [dockCenter.x + 0.48, 0.24, dockCenter.z], materials.machine));
  group.add(box([0.28, 0.52, 0.34], [dockCenter.x + 0.62, 0.3, dockCenter.z - 0.22], materials.machineDark));
  group.add(box([0.2, 0.16, 0.02], [dockCenter.x + 0.62, 0.42, dockCenter.z - 0.04], materials.glass));
  group.add(cylinder(0.016, 0.016, 0.018, [dockCenter.x + 0.62, 0.52, dockCenter.z - 0.02], materials.paintGreen, 10));
  group.add(cylinder(0.016, 0.016, 0.018, [dockCenter.x + 0.62, 0.52, dockCenter.z - 0.08], materials.redLight, 10));

  const feederMidX = (padCenter.x + dockCenter.x) / 2 + 0.12;
  const feederLen = Math.abs(dockCenter.x - padCenter.x) + 0.52;
  group.add(box([feederLen, 0.014, 0.22], [feederMidX, 0.092, firstConveyorPoint.z], materials.belt, false));
  for (let i = -4; i <= 4; i += 1) {
    const roller = cylinder(0.018, 0.018, 0.2, [feederMidX + i * (feederLen / 9), 0.098, firstConveyorPoint.z], materials.steel, 8);
    roller.rotation.z = Math.PI / 2;
    group.add(roller);
  }

  const mergeX = firstConveyorPoint.x + 0.18;
  [-0.18, 0.18].forEach((z) => {
    group.add(box([0.05, 0.62, 0.05], [mergeX, 0.34, firstConveyorPoint.z + z], materials.machineDark));
  });
  group.add(box([0.08, 0.05, 0.42], [mergeX, 0.66, firstConveyorPoint.z], materials.darkSteel));
  const scanBeam = box([0.04, 0.04, 0.36], [mergeX, 0.34, firstConveyorPoint.z], materials.safetyGlass);
  const scanMat = scanBeam.material as THREE.MeshStandardMaterial;
  scanMat.transparent = true;
  scanMat.opacity = 0.1;
  scanMat.emissiveIntensity = 0.25;
  group.add(scanBeam);

  const intakePulse = cylinder(0.11, 0.11, 0.012, [mergeX, 0.112, firstConveyorPoint.z], materials.safetyGlass, 20);
  const pulseMat = intakePulse.material as THREE.MeshStandardMaterial;
  pulseMat.opacity = 0.18;
  pulseMat.emissiveIntensity = 0.4;
  group.add(intakePulse);

  const carrier = new THREE.Group();
  carrier.add(box([0.38, 0.06, 0.28], [0, 0.034, 0], materials.machineDark));
  carrier.add(box([0.24, 0.08, 0.18], [0, 0.1, 0], materials.enamel));
  const carrierLoad = makeProduct(materials.enamel);
  carrierLoad.position.set(0, 0.146 + PRODUCT_SHAPE_RECTANGLE.height / 2, 0);
  carrierLoad.visible = false;
  carrier.add(carrierLoad);
  [-0.14, 0.14].forEach((x) => {
    [-0.1, 0.1].forEach((z) => {
      const wheel = cylinder(0.032, 0.032, 0.04, [x, 0.018, z], materials.tire, 10);
      wheel.rotation.z = Math.PI / 2;
      carrier.add(wheel);
    });
  });
  carrier.add(box([0.06, 0.14, 0.04], [0.2, 0.12, 0], materials.machineLight));
  group.add(carrier);

  inputStation.dockBlocks.forEach((block) => {
    const center = layoutPoint(block);
    group.add(box([block.width, 0.06, block.depth], [center.x, 0.07, center.z], materials.hydraulic));
    group.add(box([block.width * 0.82, 0.01, block.depth * 0.76], [center.x, 0.104, center.z], materials.machineLight));
    group.add(cylinder(0.014, 0.014, 0.014, [center.x - block.width * 0.32, 0.112, center.z], materials.steel, 8));
    group.add(cylinder(0.014, 0.014, 0.014, [center.x + block.width * 0.32, 0.112, center.z], materials.steel, 8));
  });

  group.userData.intakeRig = {
    carrier,
    carrierLoad,
    liftTable,
    scanBeam,
    intakePulse,
    start: new THREE.Vector3(padCenter.x + 0.42, 0, firstConveyorPoint.z),
    end: new THREE.Vector3(dockCenter.x - 0.08, 0, firstConveyorPoint.z),
  } satisfies IntakeRig;

  return group;
}
