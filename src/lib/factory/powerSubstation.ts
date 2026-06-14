import * as THREE from "three";
import { box, cylinder, torus } from "./mesh";
import type { Materials } from "./materials";
import { tagShellWallMesh } from "./shellWalls";

export const POWER_SUBSTATION_ID = "powerSubstation";

function tagTrim(mesh: THREE.Mesh) {
  return tagShellWallMesh(mesh, "back", "trim");
}

function addHazardStripe(
  group: THREE.Group,
  materials: Materials,
  width: number,
  y: number,
  z: number,
  segments = 10
) {
  const segW = width / segments;
  for (let i = 0; i < segments; i += 1) {
    const mat = i % 2 === 0 ? materials.warning : materials.darkSteel;
    group.add(
      tagTrim(box([segW - 0.004, 0.07, 0.028], [(i - (segments - 1) / 2) * segW, y, z], mat, false))
    );
  }
}

function addGauge(
  group: THREE.Group,
  materials: Materials,
  x: number,
  y: number,
  z: number,
  needleAngle = 0.35
) {
  const bezel = tagTrim(
    cylinder(0.11, 0.11, 0.028, [x, y, z], materials.darkSteel, 32)
  );
  bezel.rotation.x = Math.PI / 2;
  group.add(bezel);

  const face = tagTrim(
    cylinder(0.092, 0.092, 0.032, [x, y, z + 0.008], materials.machine, 32)
  );
  face.rotation.x = Math.PI / 2;
  group.add(face);

  const ring = tagTrim(torus(0.07, 0.008, Math.PI * 1.35, [x, y, z + 0.018], materials.tealGlow, 10, 24));
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = -0.55;
  const ringMat = ring.material as THREE.MeshStandardMaterial;
  ringMat.emissiveIntensity = 0.35;
  group.add(ring);

  const needle = tagTrim(box([0.006, 0.055, 0.012], [x, y + 0.02, z + 0.022], materials.warning, false));
  needle.rotation.z = needleAngle;
  group.add(needle);

  group.add(
    tagTrim(box([0.018, 0.018, 0.014], [x, y, z + 0.022], materials.machineLight, false))
  );
}

function addBreakerModule(
  group: THREE.Group,
  materials: Materials,
  x: number,
  y: number,
  z: number,
  active: boolean
) {
  group.add(tagTrim(box([0.24, 0.58, 0.038], [x, y, z], materials.darkSteel, false)));
  group.add(tagTrim(box([0.2, 0.5, 0.03], [x, y, z + 0.022], materials.machine, false)));

  const handle = tagTrim(box([0.038, 0.14, 0.042], [x, y - 0.08, z + 0.04], materials.machineLight, false));
  const handleMat = handle.material as THREE.MeshStandardMaterial;
  handleMat.color.setHex(active ? 0xef4444 : 0x64748b);
  group.add(handle);

  const indicator = tagTrim(
    box([0.028, 0.028, 0.03], [x, y + 0.18, z + 0.035], active ? materials.tealGlow : materials.machineLight, false)
  );
  const indicatorMat = indicator.material as THREE.MeshStandardMaterial;
  indicatorMat.emissiveIntensity = active ? 0.45 : 0.08;
  group.add(indicator);

  group.add(tagTrim(box([0.16, 0.018, 0.028], [x, y + 0.08, z + 0.032], materials.darkSteel, false)));
}

function addDigitalReadout(
  group: THREE.Group,
  materials: Materials,
  x: number,
  y: number,
  z: number
) {
  group.add(tagTrim(box([0.62, 0.11, 0.032], [x, y, z], materials.darkSteel, false)));
  const screen = tagTrim(box([0.54, 0.078, 0.028], [x, y, z + 0.018], materials.machineDark, false));
  const screenMat = screen.material as THREE.MeshStandardMaterial;
  screenMat.emissive.setHex(0x0f766e);
  screenMat.emissiveIntensity = 0.22;
  group.add(screen);

  for (let i = 0; i < 7; i += 1) {
    const segX = x - 0.21 + i * 0.07;
    group.add(
      tagTrim(box([0.038, 0.042, 0.012], [segX, y, z + 0.034], materials.tealGlow, false))
    );
  }
}

export function buildPowerSubstation(materials: Materials, backZ: number): THREE.Group {
  const group = new THREE.Group();
  group.userData.stationId = POWER_SUBSTATION_ID;
  group.position.set(0, 0.14, backZ + 0.14);

  const faceZ = 0.1;
  const cabinetW = 1.56;
  const cabinetH = 1.52;

  group.add(
    tagTrim(box([cabinetW, cabinetH, 0.1], [0, cabinetH / 2, faceZ - 0.02], materials.machineDark, false))
  );
  const chassisMat = (group.children[group.children.length - 1] as THREE.Mesh)
    .material as THREE.MeshStandardMaterial;
  chassisMat.roughness = 0.48;
  chassisMat.metalness = 0.72;

  group.add(
    tagTrim(box([cabinetW - 0.1, cabinetH - 0.12, 0.026], [0, cabinetH / 2, faceZ + 0.04], materials.machine, false))
  );

  addHazardStripe(group, materials, cabinetW - 0.08, cabinetH - 0.05, faceZ + 0.058);

  group.add(
    tagTrim(box([0.78, 0.12, 0.03], [-0.22, cabinetH - 0.2, faceZ + 0.062], materials.darkSteel, false))
  );
  group.add(
    tagTrim(box([0.42, 0.028, 0.028], [-0.38, cabinetH - 0.2, faceZ + 0.078], materials.tealGlow, false))
  );

  const busBar = tagTrim(box([0.06, 1.18, 0.034], [-0.66, cabinetH / 2, faceZ + 0.055], materials.tealGlow, false));
  const busMat = busBar.material as THREE.MeshStandardMaterial;
  busMat.emissiveIntensity = 0.32;
  group.add(busBar);

  group.add(
    tagTrim(box([0.04, 1.12, 0.02], [-0.62, cabinetH / 2, faceZ + 0.078], materials.machineLight, false))
  );

  const breakerXs = [-0.28, -0.02, 0.24, 0.5];
  breakerXs.forEach((bx, index) => {
    addBreakerModule(group, materials, bx, 0.78, faceZ + 0.06, index !== 2);
  });

  addDigitalReadout(group, materials, -0.08, 1.18, faceZ + 0.06);
  addGauge(group, materials, 0.58, 0.92, faceZ + 0.06, 0.25);
  addGauge(group, materials, 0.58, 0.48, faceZ + 0.06, -0.4);

  const statusColors = [0xef4444, 0xfacc15, 0x22c55e] as const;
  statusColors.forEach((color, index) => {
    const light = tagTrim(
      cylinder(0.028, 0.028, 0.032, [0.64, 1.22 - index * 0.14, faceZ + 0.055], materials.machineDark, 20)
    );
    light.rotation.x = Math.PI / 2;
    const lightMat = light.material as THREE.MeshStandardMaterial;
    lightMat.color.setHex(color);
    lightMat.emissive.setHex(color);
    lightMat.emissiveIntensity = index === 2 ? 0.55 : index === 1 ? 0.28 : 0.12;
    group.add(light);
  });

  group.add(
    tagTrim(box([0.9, 0.14, 0.04], [0, 0.18, faceZ + 0.04], materials.darkSteel, false))
  );
  group.add(
    tagTrim(box([0.72, 0.08, 0.032], [0, 0.18, faceZ + 0.068], materials.machineLight, false))
  );

  const trunkX = [0, -0.32, 0.32];
  trunkX.forEach((tx, index) => {
    group.add(
      tagTrim(box([0.05, 0.22, 0.05], [tx, 0.06, faceZ + 0.02], materials.darkSteel, false))
    );
    const cable = tagTrim(
      box([0.018, 0.2, 0.028], [tx, 0.07, faceZ + 0.05], index === 1 ? materials.tealGlow : materials.machineLight, false)
    );
    group.add(cable);

    const floorZ = 0.28 + index * 0.08;
    group.add(box([0.16, 0.022, 0.16], [tx, 0.04, floorZ], materials.darkSteel, false));
    const plate = box([0.09, 0.01, 0.09], [tx, 0.055, floorZ], materials.tealGlow, false);
    const plateMat = plate.material as THREE.MeshStandardMaterial;
    plateMat.emissiveIntensity = 0.18;
    group.add(plate);
  });

  return group;
}

export type SubstationSpec = { label: string; value: string };
export type SubstationMetric = { label: string; value: number; unit: string; max: number };

export const POWER_SUBSTATION_INFO = {
  id: POWER_SUBSTATION_ID,
  name: "Main Distribution",
  codename: "MCC-01 / SUBSTATION",
  tagline: "11 kV incomer · bus sectionalising · line feeders",
  description:
    "Primary electrical distribution for the production hall. Incoming utility power is stepped down, metered, and routed through motor control centres to line feeders and floor bus drops.",
  specs: [
    { label: "Incoming voltage", value: "11 kV / 50 Hz" },
    { label: "Rated capacity", value: "2.5 MVA" },
    { label: "Feeder circuits", value: "8 active" },
    { label: "Protection", value: "IEC 61439 Type 2" },
  ] satisfies SubstationSpec[],
  metrics: [
    { label: "Bus load", value: 71, unit: "%", max: 100 },
    { label: "Power factor", value: 0.92, unit: "PF", max: 1 },
    { label: "Line demand", value: 1840, unit: "kVA", max: 2500 },
  ] satisfies SubstationMetric[],
};
