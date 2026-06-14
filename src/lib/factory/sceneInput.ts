import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CANVAS_EVENTS_TO_STOP, CTRL_WHEEL_ZOOM, POINTER_DRAG_THRESHOLD_SQ } from "./sceneConfig";

type SceneInputOptions = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  element: HTMLCanvasElement;
  onResetView?: () => void;
  getIsInteractive?: () => boolean;
  enablePinchZoom?: boolean;
};

type ActivePointer = { x: number; y: number; id: number };

const DOUBLE_TAP_WINDOW_MS = 320;
const RESET_DEBOUNCE_MS = 48;

export function bindSceneInput({
  camera,
  controls,
  element,
  onResetView,
  getIsInteractive,
  enablePinchZoom = false,
}: SceneInputOptions) {
  let cameraOverride = false;
  let isDragging = false;
  let activePointer: ActivePointer | null = null;
  let targetZoomDistance: number | null = null;
  let lastTapAt = 0;
  let lastResetAt = 0;
  let lastPinchDistance: number | null = null;
  const activePointers = new Map<number, ActivePointer>();
  const zoomOffset = new THREE.Vector3();
  const stopCanvasEvent = (event: Event) => {
    event.stopPropagation();
  };

  const getPinchDistance = () => {
    const pointers = [...activePointers.values()];
    if (pointers.length < 2) return 0;
    const dx = pointers[1].x - pointers[0].x;
    const dy = pointers[1].y - pointers[0].y;
    return Math.hypot(dx, dy);
  };

  const applyPinchZoom = (scale: number) => {
    if (!(getIsInteractive?.() ?? true) || scale <= 0) return;

    cameraOverride = true;
    zoomOffset.copy(camera.position).sub(controls.target);
    const currentDistance = targetZoomDistance ?? zoomOffset.length();
    targetZoomDistance = THREE.MathUtils.clamp(
      currentDistance / scale,
      CTRL_WHEEL_ZOOM.minDistance,
      CTRL_WHEEL_ZOOM.maxDistance
    );
  };

  const canReset = () => (getIsInteractive?.() ?? true) && Boolean(onResetView);

  const invokeReset = () => {
    if (!canReset()) return;
    const now = performance.now();
    if (now - lastResetAt < RESET_DEBOUNCE_MS) return;
    lastResetAt = now;
    lastTapAt = 0;
    onResetView?.();
  };

  const onPointerDown = (event: PointerEvent) => {
    const pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    activePointers.set(event.pointerId, pointer);

    if (activePointers.size === 1) {
      activePointer = pointer;
      isDragging = false;
    }

    if (enablePinchZoom && activePointers.size === 2) {
      lastPinchDistance = getPinchDistance();
      isDragging = true;
      lastTapAt = 0;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
      });
    }

    if (enablePinchZoom && activePointers.size >= 2) {
      const pinchDistance = getPinchDistance();
      if (lastPinchDistance !== null && lastPinchDistance > 0 && pinchDistance > 0) {
        applyPinchZoom(pinchDistance / lastPinchDistance);
      }
      lastPinchDistance = pinchDistance;
      isDragging = true;
      return;
    }

    if (!activePointer || event.pointerId !== activePointer.id || isDragging) return;
    const dx = event.clientX - activePointer.x;
    const dy = event.clientY - activePointer.y;
    if (dx * dx + dy * dy >= POINTER_DRAG_THRESHOLD_SQ) {
      isDragging = true;
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    activePointers.delete(event.pointerId);

    if (enablePinchZoom && activePointers.size < 2) {
      lastPinchDistance = null;
    }

    if (!activePointer || event.pointerId !== activePointer.id) {
      if (activePointers.size === 1) {
        activePointer = [...activePointers.values()][0] ?? null;
        isDragging = false;
      }
      return;
    }

    const wasDragging = isDragging;
    activePointer = activePointers.size === 1 ? [...activePointers.values()][0] ?? null : null;
    isDragging = activePointers.size >= 2;

    if (wasDragging || event.pointerType !== "touch" || !onResetView || activePointers.size > 0) return;

    const now = performance.now();
    if (now - lastTapAt < DOUBLE_TAP_WINDOW_MS) {
      invokeReset();
      return;
    }
    lastTapAt = now;
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
    if (!onResetView || !canReset()) return;
    event.preventDefault();
    invokeReset();
  };

  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);
  element.style.cursor = "grab";
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerUp);
  CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
    element.addEventListener(eventName, stopCanvasEvent);
  });
  element.addEventListener("dblclick", onDoubleClick);

  return {
    hasCameraOverride: () => cameraOverride,
    isDragging: () => isDragging,
    resetCameraOverride: () => {
      cameraOverride = false;
      isDragging = false;
      activePointer = null;
      activePointers.clear();
      lastPinchDistance = null;
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
        element.removeEventListener(eventName, stopCanvasEvent);
      });
      element.removeEventListener("dblclick", onDoubleClick);
    },
  };
}
