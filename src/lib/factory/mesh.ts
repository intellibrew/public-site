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
