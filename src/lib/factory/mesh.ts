import * as THREE from "three";
import { cloneMaterial } from "./materials";

export function box(size: [number, number, number], position: [number, number, number], material: THREE.Material, castShadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), cloneMaterial(material));
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
}

export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  material: THREE.Material,
  segments = 28
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), cloneMaterial(material));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function sphere(radius: number, position: [number, number, number], material: THREE.Material, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), cloneMaterial(material));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function torus(
  radius: number,
  tube: number,
  arc: number,
  position: [number, number, number],
  material: THREE.Material,
  radialSegments = 14,
  tubularSegments = 32
) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc), cloneMaterial(material));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function lineSegments(points: THREE.Vector3[], color: number, opacity: number) {
  return new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

export function line(points: THREE.Vector3[], color: number, opacity: number) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

export function beltTurnQuarter(
  radius: number,
  beltWidth: number,
  thickness: number,
  position: [number, number, number],
  material: THREE.Material
) {
  const outer = radius;
  const inner = Math.max(0.035, radius - beltWidth);
  const shape = new THREE.Shape();
  shape.moveTo(0, outer);
  shape.absarc(0, 0, outer, Math.PI / 2, Math.PI, false);
  shape.lineTo(-inner, 0);
  shape.absarc(0, 0, inner, Math.PI, Math.PI / 2, true);
  shape.lineTo(0, outer);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, thickness / 2, 0);

  const mesh = new THREE.Mesh(geo, cloneMaterial(material));
  mesh.position.set(...position);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

export function prepareBeltMaterial(material: THREE.Material, repeatU = 2.4, repeatV = 1.8) {
  const beltMat = cloneMaterial(material) as THREE.MeshStandardMaterial;
  if (beltMat.map) {
    beltMat.map = beltMat.map.clone();
    beltMat.map.wrapS = THREE.RepeatWrapping;
    beltMat.map.wrapT = THREE.RepeatWrapping;
    beltMat.map.repeat.set(repeatU, repeatV);
    beltMat.map.needsUpdate = true;
  }
  return beltMat;
}
