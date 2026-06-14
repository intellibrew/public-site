import * as THREE from "three";
import { lerp, smoothstep } from "./math";
import { box } from "./mesh";
import { LAYOUT, layoutPoint } from "./layout";
import { makePath, pathTAtLayout } from "./path";
import type { ProductShape } from "./types";

export const PRODUCT_UNIT = 0.078;
export const PRODUCT_BELT_TOP = 0.173;
const PRODUCT_SHAPE_MORPH_SPAN = 0.018;
export const PRODUCT_SHAPE_RECTANGLE: ProductShape = { width: 0.118, height: 0.014, depth: 0.074 };
export const PRODUCT_SHAPE_CUBOID: ProductShape = { width: 0.092, height: 0.058, depth: 0.07 };
export const PRODUCT_SHAPE_CUBE: ProductShape = { width: 0.078, height: 0.078, depth: 0.078 };

export const primaryPath = makePath(
  LAYOUT.conveyorRuns[0].points.map((point) => layoutPoint(point))
);
const BLANKING_T = pathTAtLayout(primaryPath, LAYOUT.blankingPressStation.anchor);
const STAMPING_T = pathTAtLayout(primaryPath, LAYOUT.stampingCellStation.anchor);

export function blendProductShape(from: ProductShape, to: ProductShape, t: number): ProductShape {
  return {
    width: lerp(from.width, to.width, t),
    height: lerp(from.height, to.height, t),
    depth: lerp(from.depth, to.depth, t),
  };
}

export function productShapeAt(normalizedT: number): ProductShape {
  const span = PRODUCT_SHAPE_MORPH_SPAN;

  if (normalizedT < BLANKING_T - span) {
    return PRODUCT_SHAPE_RECTANGLE;
  }
  if (normalizedT < BLANKING_T + span) {
    const blend = smoothstep(BLANKING_T - span, BLANKING_T + span, normalizedT);
    return blendProductShape(PRODUCT_SHAPE_RECTANGLE, PRODUCT_SHAPE_CUBOID, blend);
  }
  if (normalizedT < STAMPING_T - span) {
    return PRODUCT_SHAPE_CUBOID;
  }
  if (normalizedT < STAMPING_T + span) {
    const blend = smoothstep(STAMPING_T - span, STAMPING_T + span, normalizedT);
    return blendProductShape(PRODUCT_SHAPE_CUBOID, PRODUCT_SHAPE_CUBE, blend);
  }
  return PRODUCT_SHAPE_CUBE;
}

export function applyProductShape(mesh: THREE.Mesh, shape: ProductShape) {
  const unit = (mesh.userData.unitSize as number) ?? PRODUCT_UNIT;
  mesh.scale.set(shape.width / unit, shape.height / unit, shape.depth / unit);
}

export function productY(shape: ProductShape, bob = 0) {
  return PRODUCT_BELT_TOP + shape.height / 2 + bob;
}

export function makeProduct(material: THREE.Material, position?: [number, number, number]) {
  const mesh = box([PRODUCT_UNIT, PRODUCT_UNIT, PRODUCT_UNIT], position ?? [0, 0, 0], material);
  mesh.userData.unitSize = PRODUCT_UNIT;
  applyProductShape(mesh, PRODUCT_SHAPE_RECTANGLE);
  return mesh;
}
