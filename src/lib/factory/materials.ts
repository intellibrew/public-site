import * as THREE from "three";

export function makeMaterial(params: THREE.MeshStandardMaterialParameters) {
  return new THREE.MeshStandardMaterial(params);
}

export function cloneMaterial(material: THREE.Material) {
  return material.clone();
}

export function floorGridTexture(options?: {
  base?: string;
  minor?: string;
  major?: string;
  size?: number;
  cells?: number;
  majorEvery?: number;
}) {
  const {
    base = "#070d10",
    minor = "rgba(45, 212, 191, 0.085)",
    major = "rgba(94, 234, 212, 0.2)",
    size = 512,
    cells = 16,
    majorEvery = 4,
  } = options ?? {};

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);

    const step = size / cells;
    for (let i = 0; i <= cells; i += 1) {
      const pos = Math.round(i * step) + 0.5;
      const isMajor = i % majorEvery === 0;
      context.strokeStyle = isMajor ? major : minor;
      context.lineWidth = isMajor ? 1.25 : 1;
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(size, pos);
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

export function floorTexture(base: string, line: string, gridSize = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = base;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = line;
    context.lineWidth = 1;
    for (let position = 0; position <= canvas.width; position += gridSize) {
      const p = position + 0.5;
      context.beginPath();
      context.moveTo(p, 0);
      context.lineTo(p, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, p);
      context.lineTo(canvas.width, p);
      context.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function beltTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle = "#0a1014";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 4200; i += 1) {
      const shade = 10 + Math.floor(Math.random() * 28);
      context.fillStyle = `rgba(${shade}, ${shade + 6}, ${shade + 8}, ${0.02 + Math.random() * 0.03})`;
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.2 + Math.random() * 2, 1 + Math.random() * 1.6);
    }

    const ribPitch = 56;
    for (let x = 0; x <= canvas.width; x += ribPitch) {
      context.fillStyle = "#040708";
      context.fillRect(x, 0, 10, canvas.height);
      context.fillStyle = "#171f27";
      context.fillRect(x + 10, 0, 5, canvas.height);
      context.fillStyle = "rgba(82, 97, 108, 0.16)";
      context.fillRect(x + 15, 0, 2, canvas.height);
    }

    const edge = context.createLinearGradient(0, 0, 0, canvas.height);
    edge.addColorStop(0, "rgba(0, 0, 0, 0.22)");
    edge.addColorStop(0.12, "rgba(0, 0, 0, 0)");
    edge.addColorStop(0.88, "rgba(0, 0, 0, 0)");
    edge.addColorStop(1, "rgba(0, 0, 0, 0.22)");
    context.fillStyle = edge;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const FLOOR_GRID_CELL = 0.4;
export const FLOOR_GRID_TILE = 16 * FLOOR_GRID_CELL;

export function makeMaterials() {
  const wallMap = floorTexture("#071113", "rgba(148, 163, 184, 0.055)", 180);
  const beltMap = beltTexture();

  return {
    floor: makeMaterial({ color: 0x070d10, roughness: 0.78, metalness: 0.16 }),
    floorInset: makeMaterial({ color: 0x0a1518, roughness: 0.62, metalness: 0.22 }),
    zone: makeMaterial({
      color: 0x0f3d3f,
      emissive: 0x0f766e,
      emissiveIntensity: 0,
      roughness: 0.58,
      metalness: 0.15,
      transparent: true,
      opacity: 0.5,
    }),
    wall: makeMaterial({
      color: 0x091318,
      roughness: 0.78,
      metalness: 0.14,
      transparent: true,
      opacity: 0.94,
      map: wallMap,
    }),
    wallPanel: makeMaterial({
      color: 0x0d1c20,
      roughness: 0.68,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
    }),
    steel: makeMaterial({ color: 0x52616c, roughness: 0.42, metalness: 0.7 }),
    darkSteel: makeMaterial({ color: 0x172128, roughness: 0.46, metalness: 0.64 }),
    tealGlow: makeMaterial({
      color: 0x5eead4,
      emissive: 0x14b8a6,
      emissiveIntensity: 0,
      roughness: 0.24,
      metalness: 0.12,
    }),
    glass: makeMaterial({
      color: 0x0f3e42,
      emissive: 0x14b8a6,
      emissiveIntensity: 0,
      roughness: 0.18,
      metalness: 0.22,
      transparent: true,
      opacity: 0.78,
    }),
    machine: makeMaterial({ color: 0x303c48, roughness: 0.42, metalness: 0.58 }),
    machineDark: makeMaterial({ color: 0x1a242c, roughness: 0.5, metalness: 0.5 }),
    machineLight: makeMaterial({ color: 0x788590, roughness: 0.36, metalness: 0.62 }),
    enamel: makeMaterial({ color: 0xd6dee4, roughness: 0.34, metalness: 0.34 }),
    hydraulic: makeMaterial({ color: 0x111827, roughness: 0.38, metalness: 0.74 }),
    safetyGlass: makeMaterial({
      color: 0x82f4dd,
      emissive: 0x14b8a6,
      emissiveIntensity: 0,
      roughness: 0.08,
      metalness: 0.12,
      transparent: true,
      opacity: 0.34,
    }),
    warning: makeMaterial({ color: 0xfacc15, roughness: 0.36, metalness: 0.34 }),
    redLight: makeMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0,
      roughness: 0.32,
      metalness: 0.18,
    }),
    orange: makeMaterial({ color: 0xf59e0b, roughness: 0.36, metalness: 0.46 }),
    belt: makeMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0.22, map: beltMap }),
    package: makeMaterial({ color: 0x8a5a32, roughness: 0.76, metalness: 0.04 }),
    tire: makeMaterial({ color: 0x020617, roughness: 0.82, metalness: 0.1 }),
    paintGreen: makeMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.55,
      roughness: 0.28,
      metalness: 0.18,
      transparent: true,
      opacity: 0.65,
    }),
  };
}

export type Materials = ReturnType<typeof makeMaterials>;
