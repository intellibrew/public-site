import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CANVAS_EVENTS_TO_STOP,
  CTRL_WHEEL_ZOOM,
  POINTER_DRAG_THRESHOLD_SQ,
  SCROLL_INTENT_MIN_DELTA_Y,
  SCROLL_INTENT_VERTICAL_RATIO,
  TOUCH_DRAG_HORIZONTAL_RATIO,
  TOUCH_DRAG_INTENT_MIN_DELTA,
} from "./sceneConfig";

type SceneInputOptions = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  element: HTMLCanvasElement;
  onResetView?: () => void;
  getIsInteractive?: () => boolean;
  enablePinchZoom?: boolean;
  preferPageScroll?: boolean;
  hitFactoryAt: (clientX: number, clientY: number) => boolean;
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
  preferPageScroll = false,
  hitFactoryAt,
}: SceneInputOptions) {
  let cameraOverride = false;
  let isDragging = false;
  let scrollIntent = false;
  let touchOrbitActive = false;
  let bootstrappingOrbit = false;
  let pointerDown = false;
  let orbitEligible = false;
  let activePointer: ActivePointer | null = null;
  let targetZoomDistance: number | null = null;
  let lastTapAt = 0;
  let lastResetAt = 0;
  let lastPinchDistance: number | null = null;
  let preferPageScrollEnabled = preferPageScroll;
  const activePointers = new Map<number, ActivePointer>();
  const zoomOffset = new THREE.Vector3();

  const isTouchGesture = () =>
    preferPageScrollEnabled && activePointers.size === 1;

  const shouldAllowPageScroll = () =>
    preferPageScrollEnabled && !touchOrbitActive && (scrollIntent || !isDragging);

  const syncTouchAction = () => {
    if (preferPageScrollEnabled) {
      if (
        touchOrbitActive ||
        (enablePinchZoom && isDragging && activePointers.size >= 2)
      ) {
        element.style.touchAction = "none";
        return;
      }
      element.style.touchAction = "pan-y";
      return;
    }

    if (!getIsInteractive?.()) {
      element.style.touchAction = "none";
      return;
    }
    if (isDragging && orbitEligible && !scrollIntent) {
      element.style.touchAction = "none";
      return;
    }
    element.style.touchAction = "none";
  };

  const blockOrbitEvent = (event: Event) => {
    event.stopImmediatePropagation();
  };

  const syncControlsEnabled = (enabled: boolean) => {
    controls.enabled = enabled;
  };

  const shouldStopCanvasEvent = () => {
    if (touchOrbitActive && isDragging) return true;
    if (shouldAllowPageScroll() && !isDragging) return false;
    return pointerDown || isDragging;
  };

  const stopCanvasEvent = (event: Event) => {
    if (!shouldStopCanvasEvent()) return;
    event.stopPropagation();
  };

  const resetPointerState = () => {
    pointerDown = false;
    isDragging = false;
    scrollIntent = false;
    touchOrbitActive = false;
    bootstrappingOrbit = false;
    orbitEligible = false;
    activePointer = null;
    activePointers.clear();
    lastPinchDistance = null;
    syncControlsEnabled(false);
    syncTouchAction();
    element.style.cursor = "default";
  };

  const detectScrollIntent = (dx: number, dy: number) => {
    if (!preferPageScrollEnabled || touchOrbitActive) return false;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    return absY >= SCROLL_INTENT_MIN_DELTA_Y && absY > absX * SCROLL_INTENT_VERTICAL_RATIO;
  };

  const detectTouchDragIntent = (dx: number, dy: number) => {
    if (!preferPageScrollEnabled || touchOrbitActive || scrollIntent || !orbitEligible) {
      return false;
    }
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (absX < TOUCH_DRAG_INTENT_MIN_DELTA) return false;
    return absX >= absY * TOUCH_DRAG_HORIZONTAL_RATIO;
  };

  const beginTouchOrbit = (pointer: ActivePointer) => {
    if (touchOrbitActive || scrollIntent || !orbitEligible) return;

    touchOrbitActive = true;
    isDragging = true;
    cameraOverride = true;
    syncControlsEnabled(true);
    syncTouchAction();
    element.style.cursor = "grabbing";

    bootstrappingOrbit = true;
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        clientX: pointer.x,
        clientY: pointer.y,
        pointerId: pointer.id,
        pointerType: "touch",
        isPrimary: true,
      })
    );
    bootstrappingOrbit = false;
  };

  const resolveTouchGesture = (dx: number, dy: number, pointer: ActivePointer) => {
    if (!isTouchGesture() || touchOrbitActive) return false;

    if (detectScrollIntent(dx, dy)) {
      scrollIntent = true;
      orbitEligible = false;
      syncControlsEnabled(false);
      syncTouchAction();
      return true;
    }

    if (detectTouchDragIntent(dx, dy)) {
      beginTouchOrbit(pointer);
      return true;
    }

    return false;
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

  const shouldArmOrbitControls = (event: PointerEvent) => {
    if (!preferPageScrollEnabled) return true;
    return event.pointerType !== "touch";
  };

  const onPointerDownCapture = (event: PointerEvent) => {
    if (bootstrappingOrbit) return;

    const interactive = getIsInteractive?.() ?? true;
    if (!interactive) {
      syncControlsEnabled(false);
      blockOrbitEvent(event);
      return;
    }

    const onFactory = hitFactoryAt(event.clientX, event.clientY);
    orbitEligible = onFactory;
    scrollIntent = false;
    touchOrbitActive = false;

    if (!onFactory || !shouldArmOrbitControls(event)) {
      syncControlsEnabled(false);
      if (!onFactory) {
        blockOrbitEvent(event);
      }
      return;
    }

    syncControlsEnabled(true);
  };

  const onPointerMoveCapture = (event: PointerEvent) => {
    if (!pointerDown || !activePointer || event.pointerId !== activePointer.id) return;
    if (touchOrbitActive) return;

    const dx = event.clientX - activePointer.x;
    const dy = event.clientY - activePointer.y;

    if (preferPageScrollEnabled && event.pointerType === "touch" && activePointers.size === 1) {
      resolveTouchGesture(dx, dy, activePointer);
      if (!touchOrbitActive) {
        blockOrbitEvent(event);
      }
      return;
    }

    if (!orbitEligible || scrollIntent) {
      blockOrbitEvent(event);
      return;
    }

    if (detectScrollIntent(dx, dy)) {
      scrollIntent = true;
      syncControlsEnabled(false);
      syncTouchAction();
      blockOrbitEvent(event);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (bootstrappingOrbit) return;

    const pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    activePointers.set(event.pointerId, pointer);
    pointerDown = true;
    scrollIntent = false;
    touchOrbitActive = false;

    if (activePointers.size === 1) {
      activePointer = pointer;
      isDragging = false;
      orbitEligible =
        (getIsInteractive?.() ?? true) &&
        hitFactoryAt(event.clientX, event.clientY);
    }

    if (enablePinchZoom && activePointers.size === 2) {
      lastPinchDistance = getPinchDistance();
      isDragging = true;
      orbitEligible = true;
      touchOrbitActive = false;
      syncControlsEnabled(false);
      lastTapAt = 0;
    }

    syncTouchAction();
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
      syncTouchAction();
      return;
    }

    if (!activePointer || event.pointerId !== activePointer.id) return;
    if (touchOrbitActive) return;

    const dx = event.clientX - activePointer.x;
    const dy = event.clientY - activePointer.y;

    if (preferPageScrollEnabled && event.pointerType === "touch") {
      resolveTouchGesture(dx, dy, activePointer);
      return;
    }

    if (!isDragging && detectScrollIntent(dx, dy)) {
      scrollIntent = true;
      orbitEligible = false;
      syncControlsEnabled(false);
      syncTouchAction();
      return;
    }

    if (scrollIntent || !orbitEligible) return;
    if (isDragging) return;

    if (dx * dx + dy * dy >= POINTER_DRAG_THRESHOLD_SQ) {
      isDragging = true;
      syncTouchAction();
    }
  };

  const schedulePointerReset = () => {
    queueMicrotask(resetPointerState);
  };

  const onPointerUp = (event: PointerEvent) => {
    if (bootstrappingOrbit) return;

    activePointers.delete(event.pointerId);

    if (enablePinchZoom && activePointers.size < 2) {
      lastPinchDistance = null;
    }

    if (!activePointer || event.pointerId !== activePointer.id) {
      if (activePointers.size === 0) {
        schedulePointerReset();
      } else if (activePointers.size === 1) {
        activePointer = [...activePointers.values()][0] ?? null;
        isDragging = false;
        scrollIntent = false;
        touchOrbitActive = false;
        orbitEligible =
          activePointer !== null &&
          (getIsInteractive?.() ?? true) &&
          hitFactoryAt(activePointer.x, activePointer.y);
        syncControlsEnabled(orbitEligible && !preferPageScrollEnabled);
        syncTouchAction();
      }
      return;
    }

    const wasDragging = isDragging;
    const hadScrollIntent = scrollIntent;
    const hadTouchOrbit = touchOrbitActive;
    schedulePointerReset();

    if (wasDragging || hadScrollIntent || hadTouchOrbit) return;
    if (event.pointerType !== "touch" || !onResetView) return;

    const now = performance.now();
    if (now - lastTapAt < DOUBLE_TAP_WINDOW_MS) {
      invokeReset();
      return;
    }
    lastTapAt = now;
  };

  const onControlStart = () => {
    if (!orbitEligible || scrollIntent) return;
    isDragging = true;
    cameraOverride = true;
    controls.enableDamping = false;
    element.style.cursor = "grabbing";
    syncTouchAction();
  };
  const onControlEnd = () => {
    controls.enableDamping = false;
    if (!pointerDown) {
      isDragging = false;
      touchOrbitActive = false;
      element.style.cursor = "default";
      syncTouchAction();
    }
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

  syncControlsEnabled(false);
  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);
  element.style.cursor = "default";
  syncTouchAction();
  element.addEventListener("pointerdown", onPointerDownCapture, { capture: true });
  element.addEventListener("pointermove", onPointerMoveCapture, { capture: true });
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
    isScrollIntent: () => scrollIntent,
    isPointerDown: () => pointerDown,
    setPreferPageScroll: (value: boolean) => {
      preferPageScrollEnabled = value;
      syncTouchAction();
    },
    resetCameraOverride: () => {
      cameraOverride = false;
      resetPointerState();
      targetZoomDistance = null;
      controls.enableDamping = false;
    },
    tickZoom,
    dispose: () => {
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      element.removeEventListener("pointerdown", onPointerDownCapture, { capture: true });
      element.removeEventListener("pointermove", onPointerMoveCapture, { capture: true });
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
        element.removeEventListener(eventName, stopCanvasEvent);
      });
      element.removeEventListener("dblclick", onDoubleClick);
      syncControlsEnabled(false);
    },
  };
}
