import * as THREE from "three";
import type { Materials } from "./materials";
import {
  CAMERA_SETTINGS,
  getEffectivePixelRatio,
  RENDERER_SETTINGS,
  SCENE_BACKGROUND,
} from "./sceneConfig";

export function makeSceneRenderer(mount: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(SCENE_BACKGROUND, 0);
  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDERER_SETTINGS.toneExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
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
  const aspect = clientWidth / Math.max(1, clientHeight);

  const portraitBlend = Math.min(
    1,
    Math.max(0, (0.85 - aspect) / (0.85 - 0.45))
  );
  const smoothBlend = portraitBlend * portraitBlend * (3 - 2 * portraitBlend);

  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.setSize(clientWidth, clientHeight, false);
  camera.aspect = aspect;
  camera.fov = THREE.MathUtils.lerp(
    CAMERA_SETTINGS.fov,
    CAMERA_SETTINGS.portraitFov,
    smoothBlend
  );
  camera.userData.factoryViewportWidth = clientWidth;
  camera.userData.factoryViewportHeight = clientHeight;
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
