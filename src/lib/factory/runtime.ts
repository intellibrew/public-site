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
import {
  applyConveyorFocusVisibility,
  beginConveyorFocusExit,
  conveyorFocusBlend,
  overrideFlowForConveyorFocus,
  snapConveyorFocusExit,
  startConveyorFocus,
  tickConveyorFocus,
  type ConveyorFocusPhase,
  type ConveyorFocusState,
} from "./conveyorFocus";
import { computeFlowState, dormantFlowState, type StorySnapshot } from "./flowOptimization";
import { updateShellWallFade } from "./shellWalls";

export type FactorySceneHandle = {
  dispose: () => void;
  focusStation: (stationId: string | null, options?: { immediate?: boolean }) => void;
  focusConveyor: () => void;
  exitConveyorFocus: () => void;
  getFocusPhase: () => "idle" | "entering" | "active" | "exiting";
  getConveyorFocusPhase: () => ConveyorFocusPhase;
  resetView: () => void;
};

export type FactorySceneOptions = {
  getProgress: () => number;
  getStoryActive?: () => boolean;
  getStorySnapshot: () => StorySnapshot;
  onFocusChange?: (stationId: string | null, phase: "idle" | "entering" | "active" | "exiting") => void;
  onConveyorFocusChange?: (phase: ConveyorFocusPhase) => void;
  onStationHover?: (stationId: string | null) => void;
  onConveyorHover?: (hovered: boolean) => void;
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
    onConveyorFocusChange,
    onStationHover,
    onConveyorHover,
  } = options;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(SCENE_FOG.color, SCENE_FOG.density);
  scene.background = new THREE.Color(SCENE_BACKGROUND);

  const renderer = makeSceneRenderer(mount);
  const camera = makeSceneCamera();
  const controls = new OrbitControls(camera, renderer.domElement);
  configureControls(controls);

  const materials = makeMaterials();
  const build = makeBuildSequence(materials);
  const initialProgress = clamp(getProgress());
  build.steps.forEach((step) => {
    scene.add(step.group);
    revealPart(step, initialProgress);
  });
  build.flowVisuals.root.visible = false;
  scene.add(build.flowVisuals.root);
  const lights = makeLightRig(scene, build.shell.group);

  const qcStation = build.conveyor.group.userData.qcStationGroup as THREE.Group | undefined;
  const hiddenDuringConveyorFocus = qcStation
    ? [...build.machineGroups, qcStation]
    : build.machineGroups;

  const focusRing = makeFocusRing();
  scene.add(focusRing);

  let focusState: FocusState | null = null;
  let conveyorFocusState: ConveyorFocusState | null = null;
  let lastFrameMs = performance.now();

  const notifyFocus = () => {
    onFocusChange?.(
      focusState?.stationId ?? null,
      focusState?.phase ?? "idle"
    );
  };

  const notifyConveyorFocus = () => {
    onConveyorFocusChange?.(conveyorFocusState?.phase ?? "idle");
  };

  let input!: ReturnType<typeof bindSceneInput>;

  const resetFactoryView = () => {
    if (focusState) {
      snapFocusExit(focusState, camera, controls);
      focusState = null;
      focusRing.parent?.remove(focusRing);
      scene.add(focusRing);
      focusRing.visible = false;
      notifyFocus();
    }
    if (conveyorFocusState) {
      snapConveyorFocusExit(conveyorFocusState, camera, controls);
      conveyorFocusState = null;
      applyConveyorFocusVisibility(hiddenDuringConveyorFocus, build.shell.group, 0);
      notifyConveyorFocus();
    }
    input.resetCameraOverride();
    updateCameraForProgress(camera, controls, clamp(getProgress()));
    controls.update();
  };

  input = bindSceneInput({
    camera,
    controls,
    element: renderer.domElement,
    onResetView: resetFactoryView,
  });

  const picker = bindStationPicking({
    camera,
    element: renderer.domElement,
    stationGroups: build.stationGroups,
    conveyorGroup: build.conveyor.group,
    onHover: (id) => onStationHover?.(id),
    onConveyorHover: (hovered) => onConveyorHover?.(hovered),
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
    onConveyorSelect: () => {
      if (getStorySnapshot().phase === "optimizing") return;
      if (conveyorFocusState) return;
      if (focusState) {
        focusState = null;
        focusRing.parent?.remove(focusRing);
        scene.add(focusRing);
        focusRing.visible = false;
        notifyFocus();
      }
      conveyorFocusState = startConveyorFocus(camera, controls);
      notifyConveyorFocus();
    },
    isFocusActive: () => focusState !== null,
    isConveyorFocusActive: () => conveyorFocusState !== null,
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

  const render = () => {
    frameId = window.requestAnimationFrame(render);
    if (!isPageVisible) return;

    const now = performance.now();
    const deltaSec = Math.min(0.05, (now - lastFrameMs) / 1000);
    lastFrameMs = now;

    const p = clamp(getProgress());
    build.steps.forEach((step) => revealPart(step, p));

    updateLighting(lights, p, now, renderer);
    const storyActive = getStoryActive?.() ?? false;
    build.flowVisuals.root.visible = storyActive;
    const baseFlow = storyActive
      ? computeFlowState(getStorySnapshot(), now)
      : dormantFlowState(getStorySnapshot());
    const conveyorBlend = conveyorFocusBlend(conveyorFocusState);
    const flowState = overrideFlowForConveyorFocus(baseFlow, conveyorBlend);
    build.updateMachines(p, now, flowState);
    applyConveyorFocusVisibility(hiddenDuringConveyorFocus, build.shell.group, conveyorBlend);

    updateShellWallFade(build.shell.group, camera);

    const hasOverride = input.hasCameraOverride();
    input.tickZoom();

    if (conveyorFocusState) {
      const prevPhase = conveyorFocusState.phase;
      const result = tickConveyorFocus(conveyorFocusState, deltaSec, camera, controls);
      conveyorFocusState = result.state;
      if (prevPhase !== conveyorFocusState?.phase) {
        notifyConveyorFocus();
      }
      if (result.done) {
        applyConveyorFocusVisibility(hiddenDuringConveyorFocus, build.shell.group, 0);
        notifyConveyorFocus();
      }
      focusRing.visible = false;
    } else if (focusState) {
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
      if (conveyorFocusState) return;
      const group = build.stationGroups.get(stationId);
      if (!group) return;
      focusState = startFocus(focusState, stationId, camera, controls, group);
      focusRing.parent?.remove(focusRing);
      group.add(focusRing);
      focusRing.position.set(0, 0, 0);
      notifyFocus();
    },
    focusConveyor: () => {
      if (conveyorFocusState || getStorySnapshot().phase === "optimizing") return;
      if (focusState) {
        focusState = null;
        focusRing.parent?.remove(focusRing);
        scene.add(focusRing);
        focusRing.visible = false;
        notifyFocus();
      }
      conveyorFocusState = startConveyorFocus(camera, controls);
      notifyConveyorFocus();
    },
    exitConveyorFocus: () => {
      if (!conveyorFocusState) return;
      if (conveyorFocusState.phase === "exiting") return;
      conveyorFocusState = beginConveyorFocusExit(conveyorFocusState);
      notifyConveyorFocus();
    },
    getFocusPhase: () => focusState?.phase ?? "idle",
    getConveyorFocusPhase: () => conveyorFocusState?.phase ?? "idle",
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
