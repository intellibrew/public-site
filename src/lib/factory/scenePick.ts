import * as THREE from "three";
import { POINTER_DRAG_THRESHOLD_SQ } from "./sceneConfig";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function setPointerFromClientPoint(
  clientX: number,
  clientY: number,
  element: HTMLElement
) {
  const rect = element.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
}

function pickStationIdAt(
  clientX: number,
  clientY: number,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  stationGroups: Map<string, THREE.Group>,
  pickTargets?: THREE.Object3D[]
): string | null {
  setPointerFromClientPoint(clientX, clientY, element);
  raycaster.setFromCamera(pointer, camera);

  const targets = pickTargets ?? [];
  if (!pickTargets) {
    stationGroups.forEach((group) => {
      if (group.visible) targets.push(group);
    });
  }

  const hits = raycaster.intersectObjects(targets, true);
  for (const hit of hits) {
    let node: THREE.Object3D | null = hit.object;
    while (node) {
      if (typeof node.userData.stationId === "string") {
        return node.userData.stationId;
      }
      node = node.parent;
    }
  }
  return null;
}

export function bindStationPicking(options: {
  camera: THREE.PerspectiveCamera;
  element: HTMLCanvasElement;
  stationGroups: Map<string, THREE.Group>;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isFocusActive: () => boolean;
  isDragging?: () => boolean;
}) {
  const {
    camera,
    element,
    stationGroups,
    onHover,
    onSelect,
    isFocusActive,
    isDragging,
  } = options;
  let hoveredId: string | null = null;
  const pickTargets = Array.from(stationGroups.values());
  let pendingPointer: { clientX: number; clientY: number } | null = null;
  let pendingClick: { x: number; y: number; pointerId: number } | null = null;
  let pointerMoveFrame = 0;

  const clearHover = () => {
    if (hoveredId) {
      hoveredId = null;
      onHover(null);
    }
    element.style.cursor = "default";
  };

  const flushPointerMove = () => {
    pointerMoveFrame = 0;
    const point = pendingPointer;
    pendingPointer = null;
    if (!point) return;

    if (isDragging?.() || isFocusActive()) {
      if (isDragging?.()) {
        element.style.cursor = "grabbing";
      } else {
        clearHover();
      }
      return;
    }

    const id = pickStationIdAt(
      point.clientX,
      point.clientY,
      camera,
      element,
      stationGroups,
      pickTargets
    );

    if (id !== hoveredId) {
      hoveredId = id;
      onHover(id);
    }

    element.style.cursor = id ? "pointer" : "grab";
  };

  const onPointerMove = (event: PointerEvent) => {
    if (isDragging?.()) return;
    pendingPointer = { clientX: event.clientX, clientY: event.clientY };
    if (pointerMoveFrame) return;
    pointerMoveFrame = window.requestAnimationFrame(flushPointerMove);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isFocusActive()) return;
    pendingClick = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.button !== 0 || isFocusActive() || !pendingClick) return;
    if (event.pointerId !== pendingClick.pointerId) return;

    const dx = event.clientX - pendingClick.x;
    const dy = event.clientY - pendingClick.y;
    pendingClick = null;

    if (dx * dx + dy * dy > POINTER_DRAG_THRESHOLD_SQ) return;

    const id = pickStationIdAt(
      event.clientX,
      event.clientY,
      camera,
      element,
      stationGroups,
      pickTargets
    );
    if (id) {
      event.stopPropagation();
      onSelect(id);
    }
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (pendingClick && event.pointerId === pendingClick.pointerId) {
      pendingClick = null;
    }
  };

  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerCancel);

  return {
    dispose: () => {
      if (pointerMoveFrame) window.cancelAnimationFrame(pointerMoveFrame);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerCancel);
    },
  };
}
