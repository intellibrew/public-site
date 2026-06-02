import * as THREE from "three";
import type { Materials } from "./materials";
import { getEffectivePixelRatio, RENDERER_SETTINGS, SCENE_BACKGROUND } from "./sceneConfig";

export function makeSceneRenderer(mount: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(SCENE_BACKGROUND, 1);
  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDERER_SETTINGS.toneExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.pointerEvents = "auto";
  mount.appendChild(renderer.domElement);

  return renderer;
}

export function fitRendererToMount(
  mount: HTMLDivElement,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  const { clientWidth, clientHeight } = mount;
  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = clientWidth / Math.max(1, clientHeight);
  camera.updateProjectionMatrix();
}

export function disposeScene(
  scene: THREE.Scene,
  materials: Materials,
  renderer: THREE.WebGLRenderer
) {
  scene.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.Line ||
      object instanceof THREE.LineSegments
    ) {
      object.geometry.dispose();
    }
  });

  Object.values(materials).forEach((material) => {
    material.map?.dispose();
    material.dispose();
  });
  renderer.dispose();
}
