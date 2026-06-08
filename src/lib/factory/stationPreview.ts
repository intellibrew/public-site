import * as THREE from "three";
import { makeMaterials, type Materials } from "./materials";
import { getEffectivePixelRatio, RENDERER_SETTINGS } from "./sceneConfig";
import {
  buildBlankingPress,
  buildFinalAssembly,
  buildIntake,
  buildPackaging,
  buildPaintBooth,
  buildQualityCheck,
  buildStamping,
  buildSubAssembly,
  buildWelding,
  tickBlankingPress,
  tickFinalAssembly,
  tickIntake,
  tickPackaging,
  tickPaintBooth,
  tickQualityCheck,
  tickStamping,
  tickSubAssembly,
  tickWelding,
} from "./stations";

type StationEntry = {
  build: (materials: Materials) => THREE.Group;
  tick: (group: THREE.Group, progress: number, elapsedMs: number) => void;
};

const STATIONS: Record<string, StationEntry> = {
  intake: { build: buildIntake, tick: tickIntake },
  blanking: { build: buildBlankingPress, tick: tickBlankingPress },
  stamping: { build: buildStamping, tick: tickStamping },
  subAssembly: { build: buildSubAssembly, tick: tickSubAssembly },
  welding: { build: buildWelding, tick: tickWelding },
  paint: { build: buildPaintBooth, tick: tickPaintBooth },
  qualityCheck: {
    build: buildQualityCheck,
    tick: (group, progress) => tickQualityCheck(group, progress, 0.65, 0),
  },
  finalAssembly: { build: buildFinalAssembly, tick: tickFinalAssembly },
  packaging: { build: buildPackaging, tick: tickPackaging },
};

const PREVIEW_TIME_MS: Record<string, number> = {
  intake: 5200,
  subAssembly: 4200,
  finalAssembly: 4100,
  packaging: 4800,
};

const PREVIEW_FRAMING: Record<string, number> = {
  intake: 1.55,
  finalAssembly: 1.65,
  packaging: 1.6,
  qualityCheck: 1.25,
};

function createTurntable(source: THREE.Group) {
  const turntable = new THREE.Group();
  const spin = new THREE.Group();

  const box = new THREE.Box3().setFromObject(source);
  const center = box.getCenter(new THREE.Vector3());
  source.position.sub(center);

  spin.add(source);
  turntable.add(spin);

  return { turntable, spin };
}

function frameCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  distanceScale = 1
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.5);

  const dist = maxDim * distanceScale;
  camera.position.set(center.x + dist * 0.85, center.y + dist * 0.65, center.z + dist);
  camera.lookAt(center.x, center.y, center.z);
  camera.near = 0.05;
  camera.far = maxDim * 24;
  camera.updateProjectionMatrix();

  return center.y;
}

function makePreviewLights(scene: THREE.Scene, lookY: number) {
  scene.add(new THREE.AmbientLight(0x8ec5c0, 0.45));
  const key = new THREE.DirectionalLight(0xdaf5f2, 1.1);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x2dd4bf, 0.35);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
  const rim = new THREE.PointLight(0x5eead4, 0.6, 12);
  rim.position.set(0, lookY + 1.5, -3);
  scene.add(rim);
}

export type StationPreviewHandle = {
  dispose: () => void;
};

export function mountStationPreview(
  mount: HTMLDivElement,
  stationId: string
): StationPreviewHandle | null {
  const entry = STATIONS[stationId];
  if (!entry) return null;

  const materials = makeMaterials();
  const group = entry.build(materials);
  group.scale.setScalar(1);
  group.visible = true;
  group.userData.isPreview = true;

  const previewTime = PREVIEW_TIME_MS[stationId] ?? 0;
  entry.tick(group, 1, previewTime);

  const { turntable, spin } = createTurntable(group);

  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = null;
  scene.add(turntable);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
  const framing = PREVIEW_FRAMING[stationId] ?? 1.15;
  const lookY = frameCamera(camera, turntable, framing);
  makePreviewLights(scene, lookY);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(getEffectivePixelRatio());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDERER_SETTINGS.toneExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  mount.appendChild(renderer.domElement);

  const setSize = () => {
    const { clientWidth, clientHeight } = mount;
    if (clientWidth < 1 || clientHeight < 1) return;
    renderer.setPixelRatio(getEffectivePixelRatio());
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  const resizeObserver = new ResizeObserver(setSize);
  resizeObserver.observe(mount);
  setSize();

  let frameId = 0;
  let isPageVisible = document.visibilityState === "visible";
  const onVisibilityChange = () => {
    isPageVisible = document.visibilityState === "visible";
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  const startMs = performance.now();
  let lastRenderMs = 0;
  const minFrameMs = 1000 / 30;

  const render = (now: number) => {
    frameId = requestAnimationFrame(render);
    if (!isPageVisible) return;
    if (now - lastRenderMs < minFrameMs) return;
    lastRenderMs = now;

    spin.rotation.y = (now - startMs) * 0.00018;
    renderer.render(scene, camera);
  };
  frameId = requestAnimationFrame(render);

  return {
    dispose: () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
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
    },
  };
}
