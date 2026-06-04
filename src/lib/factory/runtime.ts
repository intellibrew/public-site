import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { makeBuildSequence } from "./buildSequence";
import { configureControls, makeSceneCamera, updateCameraForProgress } from "./sceneCamera";
import { SCENE_FOG } from "./sceneConfig";
import { bindSceneInput } from "./sceneInput";
import { disposeScene, fitRendererToMount, makeSceneRenderer } from "./sceneRenderer";
import { makeMaterials } from "./materials";
import { clamp } from "./math";
import { makeLightRig, updateLighting } from "./lighting";
import { revealPart } from "./reveal";
import { bindStationPicking } from "./scenePick";
import {
  focusIntensity,
  makeFocusRing,
  snapFocusExit,
  startFocus,
  tickFocus,
  type FocusState,
  updateFocusRing,
} from "./sceneFocus";
import { computeFlowState, dormantFlowState, type StorySnapshot } from "./flowOptimization";
import { updateShellWallFade } from "./shellWalls";

export type FactorySceneHandle = {
  dispose: () => void;
  focusStation: (stationId: string | null, options?: { immediate?: boolean }) => void;
  getFocusPhase: () => "idle" | "entering" | "active" | "exiting";
  resetView: () => void;
};

export type FactorySceneOptions = {
  getProgress: () => number;
  getStoryActive?: () => boolean;
  getStorySnapshot: () => StorySnapshot;
  onFocusChange?: (stationId: string | null, phase: "idle" | "entering" | "active" | "exiting") => void;
  onStationHover?: (stationId: string | null) => void;
  simplified?: boolean;
};

export function mountFactoryScene(
  mount: HTMLDivElement,
  options: FactorySceneOptions
): FactorySceneHandle {
  const {
    getProgress,
    getStoryActive,
    getStorySnapshot,
    onFocusChange,
    onStationHover,
    simplified = false,
  } = options;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SCENE_FOG.color, SCENE_FOG.density);
  scene.background = null;

  const renderer = makeSceneRenderer(mount);
  const camera = makeSceneCamera();
  const controls = new OrbitControls(camera, renderer.domElement);
  configureControls(controls);

  if (simplified) {
    controls.enablePan = false;
    controls.enableZoom = false;
  }

  const materials = makeMaterials();
  const build = makeBuildSequence(materials);
  const factoryRoot = new THREE.Group();
  scene.add(factoryRoot);
  const initialProgress = clamp(getProgress());
  build.steps.forEach((step) => {
    factoryRoot.add(step.group);
    revealPart(step, initialProgress);
  });
  build.flowVisuals.root.visible = false;
  factoryRoot.add(build.flowVisuals.root);
  const lights = makeLightRig(scene, build.shell.group);

  const focusRing = makeFocusRing();
  scene.add(focusRing);

  let focusState: FocusState | null = null;
  let lastFrameMs = performance.now();

  const notifyFocus = () => {
    onFocusChange?.(
      focusState?.stationId ?? null,
      focusState?.phase ?? "idle"
    );
  };

  const resetFactoryView = () => {
    if (focusState) {
      snapFocusExit(focusState, camera, controls);
      focusState = null;
      focusRing.parent?.remove(focusRing);
      scene.add(focusRing);
      focusRing.visible = false;
      notifyFocus();
    }
    input.resetCameraOverride();
    updateCameraForProgress(camera, controls, clamp(getProgress()));
    controls.update();
  };

  const getIsInteractive = () => getProgress() >= 0.999;

  const input = bindSceneInput({
    camera,
    controls,
    element: renderer.domElement,
    onResetView: simplified ? undefined : resetFactoryView,
    getIsInteractive,
  });

  if (simplified) {
    renderer.domElement.style.cursor = "default";
  }

  const picker = bindStationPicking({
    camera,
    element: renderer.domElement,
    stationGroups: build.stationGroups,
    onHover: (id) => onStationHover?.(id),
    onSelect: (id) => {
      if (getStorySnapshot().phase === "optimizing") return;
      const group = build.stationGroups.get(id);
      if (!group) return;
      focusState = startFocus(focusState, id, camera, controls, group);
      focusRing.parent?.remove(focusRing);
      group.add(focusRing);
      focusRing.position.set(0, 0, 0);
      notifyFocus();
    },
    isFocusActive: () => focusState !== null,
  });

  const setSize = () => {
    fitRendererToMount(mount, camera, renderer);
  };
  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(mount);
  setSize();

  updateCameraForProgress(camera, controls, 0);
  updateLighting(lights, 0, performance.now(), renderer);

  let frameId = 0;
  let isPageVisible = document.visibilityState === "visible";
  const onVisibilityChange = () => {
    isPageVisible = document.visibilityState === "visible";
    if (isPageVisible) lastFrameMs = performance.now();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  let smoothedP = clamp(getProgress());

  const render = () => {
    frameId = window.requestAnimationFrame(render);
    if (!isPageVisible) return;

    const now = performance.now();
    const deltaSec = Math.min(0.05, (now - lastFrameMs) / 1000);
    lastFrameMs = now;

    const rawP = clamp(getProgress());
    const lerpFactor = Math.min(1, deltaSec * 40);
    smoothedP += (rawP - smoothedP) * lerpFactor;
    if (rawP >= 0.999) smoothedP = 1;
    const p = smoothedP;

    build.steps.forEach((step) => revealPart(step, p));

    updateLighting(lights, p, now, renderer);
    const storyActive = getStoryActive?.() ?? false;
    build.flowVisuals.root.visible = storyActive;
    const flowState = storyActive
      ? computeFlowState(getStorySnapshot(), now)
      : dormantFlowState(getStorySnapshot());
    build.updateMachines(p, now, flowState);

    factoryRoot.rotation.y = 0;
    factoryRoot.scale.setScalar(1);
    // "Rising from abyss" effect: factory lifts from -1.2 units below its
    // authored position at p = 0 up to y = 0 at p = 1. Because p is smoothed,
    // the rise is a fluid upward glide rather than a series of visible jumps.
    factoryRoot.position.set(0, (1 - p) * -1.2, 0);

    updateShellWallFade(build.shell.group, camera, {
      hideWalls: false,
    });

    const hasOverride = input.hasCameraOverride();
    input.tickZoom();

    if (focusState) {
      const prevPhase = focusState.phase;
      const result = tickFocus(focusState, deltaSec, camera, controls);
      focusState = result.state;
      if (result.done) {
        focusRing.parent?.remove(focusRing);
        scene.add(focusRing);
        notifyFocus();
      } else if (prevPhase !== focusState?.phase && focusState?.phase === "active") {
        notifyFocus();
      }
      updateFocusRing(focusRing, focusIntensity(focusState), now);
    } else {
      focusRing.visible = false;
      if (!hasOverride) {
        updateCameraForProgress(camera, controls, p);
      }
    }

    controls.update();
    renderer.render(scene, camera);
  };
  render();

  return {
    focusStation: (stationId) => {
      if (stationId === null) {
        if (!focusState) return;
        focusState = null;
        focusRing.parent?.remove(focusRing);
        scene.add(focusRing);
        focusRing.visible = false;
        notifyFocus();
        return;
      }
      const group = build.stationGroups.get(stationId);
      if (!group) return;
      focusState = startFocus(focusState, stationId, camera, controls, group);
      focusRing.parent?.remove(focusRing);
      group.add(focusRing);
      focusRing.position.set(0, 0, 0);
      notifyFocus();
    },
    getFocusPhase: () => focusState?.phase ?? "idle",
    resetView: resetFactoryView,
    dispose: () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      picker.dispose();
      input.dispose();
      controls.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      disposeScene(scene, materials, renderer);
    },
  };
}
