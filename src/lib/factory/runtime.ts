import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { makeBuildSequence } from "./buildSequence";
import { configureControls, makeSceneCamera, updateCameraForProgress } from "./sceneCamera";
import { SCENE_BACKGROUND, SCENE_FOG } from "./sceneConfig";
import { bindSceneInput } from "./sceneInput";
import { disposeScene, fitRendererToMount, makeSceneRenderer } from "./sceneRenderer";
import { makeMaterials } from "./materials";
import { clamp } from "./math";
import { makeLightRig, updateLighting } from "./lighting";
import { revealPart } from "./reveal";

export type FactorySceneHandle = {
  dispose: () => void;
};

export function mountFactoryScene(
  mount: HTMLDivElement,
  getProgress: () => number
): FactorySceneHandle {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SCENE_FOG.color, SCENE_FOG.density);
  scene.background = new THREE.Color(SCENE_BACKGROUND);

  const renderer = makeSceneRenderer(mount);
  const camera = makeSceneCamera();
  const controls = new OrbitControls(camera, renderer.domElement);
  configureControls(controls);
  const input = bindSceneInput({ camera, controls, element: renderer.domElement });

  const materials = makeMaterials();
  const build = makeBuildSequence(materials);
  build.steps.forEach((step) => {
    step.group.visible = false;
    scene.add(step.group);
  });
  const lights = makeLightRig(scene, build.shell.group);

  const setSize = () => {
    fitRendererToMount(mount, camera, renderer);
  };
  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(mount);
  setSize();

  let frameId = 0;
  const render = () => {
    const p = clamp(getProgress());
    const now = performance.now();

    build.steps.forEach((step) => revealPart(step, p));
    updateLighting(lights, p, now, renderer);
    build.updateMachines(p, now);

    if (!input.hasCameraOverride()) {
      updateCameraForProgress(camera, controls, p);
    }

    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  };
  render();

  return {
    dispose: () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      input.dispose();
      controls.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      disposeScene(scene, materials, renderer);
    },
  };
}
