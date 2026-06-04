import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CANVAS_EVENTS_TO_STOP, CTRL_WHEEL_ZOOM } from "./sceneConfig";

type SceneInputOptions = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  element: HTMLCanvasElement;
  onResetView?: () => void;
  getIsInteractive?: () => boolean;
};

export function bindSceneInput({ camera, controls, element, onResetView, getIsInteractive }: SceneInputOptions) {
  let cameraOverride = false;
  let targetZoomDistance: number | null = null;
  let lastTapTime = 0;
  const stopPropagation = (event: Event) => event.stopPropagation();

  const onControlStart = () => {
    cameraOverride = true;
    element.style.cursor = "grabbing";
  };
  const onControlEnd = () => {
    element.style.cursor = "grab";
  };
  const onWheel = (event: WheelEvent) => {
    if (!(getIsInteractive?.() ?? true)) return;
    event.preventDefault();
    event.stopPropagation();

    cameraOverride = true;
    const offset = camera.position.clone().sub(controls.target);
    const currentDistance = targetZoomDistance ?? offset.length();
    targetZoomDistance = THREE.MathUtils.clamp(
      currentDistance * (1 + event.deltaY * CTRL_WHEEL_ZOOM.speed),
      CTRL_WHEEL_ZOOM.minDistance,
      CTRL_WHEEL_ZOOM.maxDistance
    );
  };

  const tickZoom = () => {
    if (targetZoomDistance === null) return;

    const offset = camera.position.clone().sub(controls.target);
    const currentDistance = offset.length();
    const nextDistance = THREE.MathUtils.lerp(
      currentDistance,
      targetZoomDistance,
      CTRL_WHEEL_ZOOM.smoothFactor
    );

    if (Math.abs(nextDistance - targetZoomDistance) < 0.004) {
      offset.setLength(targetZoomDistance);
      targetZoomDistance = null;
    } else {
      offset.setLength(nextDistance);
    }

    camera.position.copy(controls.target).add(offset);
  };

  const onDoubleClick = (event: MouseEvent) => {
    event.preventDefault();
    onResetView?.();
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (event.touches.length > 0) return;
    const now = performance.now();
    if (now - lastTapTime < 320) {
      event.preventDefault();
      onResetView?.();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
  };

  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);
  element.style.cursor = "grab";
  CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
    element.addEventListener(eventName, stopPropagation);
  });
  element.addEventListener("wheel", onWheel, { passive: false });
  element.addEventListener("dblclick", onDoubleClick);
  element.addEventListener("touchend", onTouchEnd, { passive: false });

  return {
    hasCameraOverride: () => cameraOverride,
    resetCameraOverride: () => {
      cameraOverride = false;
      targetZoomDistance = null;
    },
    tickZoom,
    dispose: () => {
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
        element.removeEventListener(eventName, stopPropagation);
      });
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("dblclick", onDoubleClick);
      element.removeEventListener("touchend", onTouchEnd);
    },
  };
}
