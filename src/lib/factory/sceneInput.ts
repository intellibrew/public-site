import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CANVAS_EVENTS_TO_STOP, CTRL_WHEEL_ZOOM, POINTER_DRAG_THRESHOLD_SQ } from "./sceneConfig";

type SceneInputOptions = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  element: HTMLCanvasElement;
  onResetView?: () => void;
  getIsInteractive?: () => boolean;
};

export function bindSceneInput({ camera, controls, element, onResetView, getIsInteractive }: SceneInputOptions) {
  let cameraOverride = false;
  let isDragging = false;
  let activePointer: { x: number; y: number; id: number } | null = null;
  let targetZoomDistance: number | null = null;
  let lastTapTime = 0;
  const zoomOffset = new THREE.Vector3();
  const stopPropagation = (event: Event) => event.stopPropagation();

  const onPointerDown = (event: PointerEvent) => {
    activePointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    isDragging = false;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!activePointer || event.pointerId !== activePointer.id || isDragging) return;
    const dx = event.clientX - activePointer.x;
    const dy = event.clientY - activePointer.y;
    if (dx * dx + dy * dy >= POINTER_DRAG_THRESHOLD_SQ) {
      isDragging = true;
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!activePointer || event.pointerId !== activePointer.id) return;
    activePointer = null;
    isDragging = false;
  };

  const onControlStart = () => {
    cameraOverride = true;
    controls.enableDamping = false;
    element.style.cursor = "grabbing";
  };
  const onControlEnd = () => {
    controls.enableDamping = false;
    element.style.cursor = "grab";
  };
  const onWheel = (event: WheelEvent) => {
    if (!(getIsInteractive?.() ?? true)) return;
    event.preventDefault();
    event.stopPropagation();

    cameraOverride = true;
    zoomOffset.copy(camera.position).sub(controls.target);
    const currentDistance = targetZoomDistance ?? zoomOffset.length();
    targetZoomDistance = THREE.MathUtils.clamp(
      currentDistance * (1 + event.deltaY * CTRL_WHEEL_ZOOM.speed),
      CTRL_WHEEL_ZOOM.minDistance,
      CTRL_WHEEL_ZOOM.maxDistance
    );
  };

  const tickZoom = () => {
    if (targetZoomDistance === null) return;

    zoomOffset.copy(camera.position).sub(controls.target);
    const currentDistance = zoomOffset.length();
    const nextDistance = THREE.MathUtils.lerp(
      currentDistance,
      targetZoomDistance,
      CTRL_WHEEL_ZOOM.smoothFactor
    );

    if (Math.abs(nextDistance - targetZoomDistance) < 0.004) {
      zoomOffset.setLength(targetZoomDistance);
      targetZoomDistance = null;
    } else {
      zoomOffset.setLength(nextDistance);
    }

    camera.position.copy(controls.target).add(zoomOffset);
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
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerUp);
  CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
    element.addEventListener(eventName, stopPropagation);
  });
  element.addEventListener("wheel", onWheel, { passive: false });
  element.addEventListener("dblclick", onDoubleClick);
  element.addEventListener("touchend", onTouchEnd, { passive: false });

  return {
    hasCameraOverride: () => cameraOverride,
    isDragging: () => isDragging,
    resetCameraOverride: () => {
      cameraOverride = false;
      isDragging = false;
      activePointer = null;
      controls.enableDamping = false;
      targetZoomDistance = null;
    },
    tickZoom,
    dispose: () => {
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
        element.removeEventListener(eventName, stopPropagation);
      });
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("dblclick", onDoubleClick);
      element.removeEventListener("touchend", onTouchEnd);
    },
  };
}
