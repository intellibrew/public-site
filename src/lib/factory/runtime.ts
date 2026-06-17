import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { makeBuildSequence } from "./buildSequence";
import { configureControls, makeSceneCamera, updateCameraForProgress } from "./sceneCamera";
import { getEffectivePixelRatio, SCENE_FOG } from "./sceneConfig";
import { bindSceneInput } from "./sceneInput";
import { disposeScene, fitRendererToMount, makeSceneRenderer } from "./sceneRenderer";
import { makeMaterials } from "./materials";
import { clamp, smoothstep } from "./math";
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
import { prewarmFlowVisuals } from "./flowVisuals";
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
  getScenePaused?: () => boolean;
  getStorySnapshot: () => StorySnapshot;
  onFocusChange?: (stationId: string | null, phase: "idle" | "entering" | "active" | "exiting") => void;
  onStationHover?: (stationId: string | null) => void;
  simplified?: boolean;
};

const BUILD_LIVE_DETAIL_PROGRESS = 0.985;
const BUILD_PIXEL_RATIO_CAP = 1;
const BUILD_SHADOW_REFRESH_STEP = 0.1;
const PLACEMENT_DETAIL_CACHE = "factoryPlacementDetailCache";
const KEEP_DURING_PLACEMENT = "keepDuringPlacementDetails";

type PlacementDetailCache = {
  visible: boolean;
};

function prewarmFactoryScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  const visibilitySnapshot: Array<[THREE.Object3D, boolean]> = [];

  scene.traverse((object) => {
    visibilitySnapshot.push([object, object.visible]);
    object.visible = true;
  });

  try {
    renderer.compile(scene, camera);
  } finally {
    visibilitySnapshot.forEach(([object, visible]) => {
      object.visible = visible;
    });
  }
}

function materialIsPlacementDetail(material: THREE.Material) {
  const standardMaterial = material as THREE.MeshStandardMaterial;
  const isTransparent = material.transparent || material.opacity < 0.98;
  const isStrongEmissive =
    standardMaterial.emissive !== undefined &&
    standardMaterial.emissive.getHex() !== 0 &&
    standardMaterial.emissiveIntensity > 0.55;

  return isTransparent || isStrongEmissive;
}

function objectKeepsPlacementDetail(object: THREE.Object3D) {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.userData[KEEP_DURING_PLACEMENT] === true) return true;
    current = current.parent;
  }
  return false;
}

function objectIsPlacementDetail(object: THREE.Object3D) {
  if (objectKeepsPlacementDetail(object)) return false;
  if (object instanceof THREE.PointLight) return true;
  if (object instanceof THREE.Line || object instanceof THREE.LineSegments) return true;
  if (!(object instanceof THREE.Mesh)) return false;

  const materials = Array.isArray(object.material) ? object.material : [object.material];
  return materials.some((material) => materialIsPlacementDetail(material));
}

function setPlacementDetailsVisible(steps: ReturnType<typeof makeBuildSequence>["steps"], visible: boolean) {
  steps.forEach((step) => {
    step.group.traverse((object) => {
      if (!objectIsPlacementDetail(object)) return;

      let cache = object.userData[PLACEMENT_DETAIL_CACHE] as PlacementDetailCache | undefined;
      if (!cache) {
        cache = { visible: object.visible };
        object.userData[PLACEMENT_DETAIL_CACHE] = cache;
      }

      object.visible = visible ? cache.visible : false;
    });
  });
}

function setRendererPixelRatioForBuild(
  mount: HTMLDivElement,
  renderer: THREE.WebGLRenderer,
  liveDetails: boolean
) {
  const targetPixelRatio = liveDetails
    ? getEffectivePixelRatio()
    : Math.min(getEffectivePixelRatio(), BUILD_PIXEL_RATIO_CAP);

  if (Math.abs(renderer.getPixelRatio() - targetPixelRatio) < 0.01) return;

  renderer.setPixelRatio(targetPixelRatio);
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
}

export function mountFactoryScene(
  mount: HTMLDivElement,
  options: FactorySceneOptions
): FactorySceneHandle {
  const {
    getProgress,
    getStoryActive,
    getScenePaused,
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
    controls.enableRotate = true;
  }

  const materials = makeMaterials();
  const build = makeBuildSequence(materials);
  prewarmFlowVisuals(build.stationGroups, getStorySnapshot().bottleneckStationId);
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
  let lastRevealProgress = Number.NaN;
  let lastCameraProgress = Number.NaN;

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
    const progress = clamp(getProgress());
    updateCameraForProgress(camera, controls, progress);
    lastCameraProgress = progress;
    controls.update();
  };

  const getIsInteractive = () =>
    getProgress() >= 0.999 && !(getScenePaused?.() ?? false);

  const input = bindSceneInput({
    camera,
    controls,
    element: renderer.domElement,
    onResetView: resetFactoryView,
    getIsInteractive,
    enablePinchZoom: simplified,
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
    isDragging: () => input.isDragging(),
  });

  const setSize = () => {
    fitRendererToMount(mount, camera, renderer);
    lastCameraProgress = Number.NaN;
  };
  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(mount);
  setSize();

  updateCameraForProgress(camera, controls, 0);
  lastCameraProgress = 0;
  updateLighting(lights, 0, performance.now(), renderer);

  let frameId = 0;
  let prewarmTimer = window.setTimeout(() => {
    prewarmTimer = 0;
    prewarmFactoryScene(renderer, scene, camera);
  }, 0);
  let isPageVisible = document.visibilityState === "visible";
  const onVisibilityChange = () => {
    isPageVisible = document.visibilityState === "visible";
    if (isPageVisible) lastFrameMs = performance.now();
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  let smoothedP = clamp(getProgress());
  let frozenSimTimeMs: number | null = null;
  let lastPausedRenderMs = 0;
  let lastBuildShadowProgress = Number.NaN;
  let livePlacementDetails = true;
  const PAUSED_RENDER_INTERVAL_MS = 250;

  const syncShadowUpdates = (progress: number) => {
    const needsLiveShadows =
      progress >= BUILD_LIVE_DETAIL_PROGRESS || focusState !== null || (getStoryActive?.() ?? false);

    if (needsLiveShadows) {
      if (!renderer.shadowMap.autoUpdate) {
        renderer.shadowMap.autoUpdate = true;
        renderer.shadowMap.needsUpdate = true;
      }
      return;
    }

    renderer.shadowMap.autoUpdate = false;
    if (
      Number.isNaN(lastBuildShadowProgress) ||
      Math.abs(progress - lastBuildShadowProgress) >= BUILD_SHADOW_REFRESH_STEP
    ) {
      renderer.shadowMap.needsUpdate = true;
      lastBuildShadowProgress = progress;
    }
  };

  const syncPlacementPerformanceMode = (progress: number) => {
    const nextLivePlacementDetails =
      progress >= BUILD_LIVE_DETAIL_PROGRESS || focusState !== null || (getStoryActive?.() ?? false);

    if (nextLivePlacementDetails !== livePlacementDetails) {
      livePlacementDetails = nextLivePlacementDetails;
      setPlacementDetailsVisible(build.steps, livePlacementDetails);
    }

    setRendererPixelRatioForBuild(mount, renderer, livePlacementDetails);
  };

  const render = () => {
    frameId = window.requestAnimationFrame(render);
    if (!isPageVisible) return;

    const now = performance.now();
    const isPaused = getScenePaused?.() ?? false;
    if (isPaused) {
      if (frozenSimTimeMs === null) frozenSimTimeMs = now;
      if (!focusState && now - lastPausedRenderMs < PAUSED_RENDER_INTERVAL_MS) {
        return;
      }
    } else {
      frozenSimTimeMs = null;
    }
    if (isPaused) {
      lastPausedRenderMs = now;
    }
    const simNow = frozenSimTimeMs ?? now;
    const deltaSec = isPaused ? 0 : Math.min(0.05, (now - lastFrameMs) / 1000);
    lastFrameMs = now;

    const rawP = clamp(getProgress());
    const isBuilding = rawP < 0.999;
    if (isBuilding) {
      smoothedP = rawP;
    } else {
      const lerpFactor = Math.min(1, deltaSec * 40);
      smoothedP += (rawP - smoothedP) * lerpFactor;
    }
    if (rawP >= 0.999) smoothedP = 1;
    const p = smoothedP;

    if (
      Number.isNaN(lastRevealProgress) ||
      Math.abs(p - lastRevealProgress) > 0.0005 ||
      (p === 1 && lastRevealProgress !== 1)
    ) {
      build.steps.forEach((step) => revealPart(step, p));
      lastRevealProgress = p;
    }

    updateLighting(lights, p, simNow, renderer);
    const storyActive = getStoryActive?.() ?? false;
    const storySnapshot = getStorySnapshot();
    build.flowVisuals.root.visible = storyActive;
    const flowState = storyActive
      ? computeFlowState(storySnapshot, simNow)
      : dormantFlowState(storySnapshot);
    if (!isPaused) {
      build.updateMachines(p, simNow, flowState);
    }

    factoryRoot.rotation.y = 0;
    factoryRoot.scale.setScalar(1);
    const rootLift = smoothstep(0, 0.12, p);
    factoryRoot.position.set(0, (1 - rootLift) * -0.35, 0);

    updateShellWallFade(build.shell.group, camera, {
      hideWalls: false,
    });

    const hasOverride = input.hasCameraOverride();
    if (!isPaused) {
      input.tickZoom();
    }

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
      updateFocusRing(focusRing, focusIntensity(focusState), simNow);
    } else {
      focusRing.visible = false;
      if (!hasOverride) {
        if (
          Number.isNaN(lastCameraProgress) ||
          Math.abs(p - lastCameraProgress) > 0.0005 ||
          (p === 1 && lastCameraProgress !== 1)
        ) {
          updateCameraForProgress(camera, controls, p);
          lastCameraProgress = p;
        }
      }
    }

    controls.update(deltaSec);
    syncPlacementPerformanceMode(p);
    syncShadowUpdates(p);
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
      if (prewarmTimer) {
        window.clearTimeout(prewarmTimer);
      }
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
