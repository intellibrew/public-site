import * as THREE from "three";
import { lerp, smoothstep } from "./math";
import type { LightRig } from "./types";

const LIGHT_LEVELS = {
  key: 2.38,
  fill: 0.94,
  rim: 0.86,
  skylight: 1.22,
  hallFill: 1.32,
  backWall: 0.58,
  overhead: 0.72,
  hemisphere: 0.92,
  ambient: 0.64,
  exposure: 1.38,
};

export function makeLightRig(scene: THREE.Scene, shell: THREE.Group): LightRig {
  const hemisphere = new THREE.HemisphereLight(0xa8e8df, 0x142028, LIGHT_LEVELS.hemisphere);
  const ambient = new THREE.AmbientLight(0x9fb0b8, LIGHT_LEVELS.ambient);
  const key = new THREE.DirectionalLight(0xfff7ed, LIGHT_LEVELS.key);
  key.position.set(5.2, 7.4, 4.8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.00012;
  key.shadow.normalBias = 0.02;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;

  const fill = new THREE.DirectionalLight(0x8de4d8, LIGHT_LEVELS.fill);
  fill.position.set(-5.4, 4.2, 2.8);
  const rim = new THREE.DirectionalLight(0x6eead4, LIGHT_LEVELS.rim);
  rim.position.set(-4.8, 3.2, -5.4);
  const skylight = new THREE.DirectionalLight(0xc8efe8, LIGHT_LEVELS.skylight);
  skylight.position.set(1.2, 11, 2.4);
  const hallFill = new THREE.PointLight(0xd4f0ea, LIGHT_LEVELS.hallFill, 20, 1.5);
  hallFill.position.set(0.4, 4.6, 0.2);
  const backWallGlow = new THREE.PointLight(0x5eead4, LIGHT_LEVELS.backWall, 16, 1.6);
  backWallGlow.position.set(0, 2.1, -3.4);

  scene.add(hemisphere, ambient, key, fill, rim, skylight, hallFill, backWallGlow);

  return {
    overheadLights: (shell.userData.overheadLights as THREE.PointLight[]) ?? [],
    overheadLenses: (shell.userData.overheadLenses as THREE.MeshStandardMaterial[]) ?? [],
    key,
    fill,
    rim,
    skylight,
    hallFill,
    backWallGlow,
    hemisphere,
    ambient,
  };
}

export function updateLighting(
  rig: LightRig,
  progress: number,
  elapsedMs: number,
  renderer: THREE.WebGLRenderer
) {
  const floorReveal = smoothstep(0, 0.09, progress);
  const wallsReveal = smoothstep(0.07, 0.17, progress);
  const machineReveal = smoothstep(0.15, 0.65, progress);
  const conveyorReveal = smoothstep(0.68, 0.86, progress);
  const flicker = 0.965 + 0.035 * Math.sin(elapsedMs * 0.0038 + 0.6);

  rig.key.intensity =
    LIGHT_LEVELS.key * lerp(0.88, 1, floorReveal) * lerp(1, 1.04, machineReveal);
  rig.fill.intensity = LIGHT_LEVELS.fill * lerp(0.72, 1.08, wallsReveal);
  rig.rim.intensity = LIGHT_LEVELS.rim * lerp(0.58, 1.05, wallsReveal);
  rig.skylight.intensity = LIGHT_LEVELS.skylight * lerp(0.75, 1, floorReveal);
  rig.hallFill.intensity = LIGHT_LEVELS.hallFill * lerp(0.7, 1, machineReveal) * lerp(0.85, 1, conveyorReveal);
  rig.backWallGlow.intensity =
    LIGHT_LEVELS.backWall * lerp(0.35, 1, wallsReveal) * (0.82 + 0.18 * Math.sin(elapsedMs * 0.0012));
  rig.hemisphere.intensity = LIGHT_LEVELS.hemisphere * lerp(0.82, 1.06, floorReveal);
  rig.ambient.intensity = LIGHT_LEVELS.ambient * lerp(0.82, 1, floorReveal);

  const overheadFactor = wallsReveal * flicker;
  rig.overheadLights.forEach((light, index) => {
    light.intensity = LIGHT_LEVELS.overhead * overheadFactor * (0.9 + (index % 3) * 0.05);
  });
  rig.overheadLenses.forEach((material, index) => {
    const base = 0.08 + (index % 3) * 0.02;
    material.emissiveIntensity = base * overheadFactor * (0.88 + 0.12 * Math.sin(elapsedMs * 0.0026 + index * 0.7));
  });

  renderer.toneMappingExposure = LIGHT_LEVELS.exposure * lerp(1, 1.04, machineReveal);
}
