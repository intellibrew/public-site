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

function intersectTargets(
  clientX: number,
  clientY: number,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  targets: THREE.Object3D[]
) {
  if (!targets.length) return [];
  setPointerFromClientPoint(clientX, clientY, element);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(targets, true);
}

export function hitFactoryAt(
  clientX: number,
  clientY: number,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  factoryTargets: THREE.Object3D[]
) {
  return intersectTargets(clientX, clientY, camera, element, factoryTargets).length > 0;
}

function pickStationIdAt(
  clientX: number,
  clientY: number,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  stationGroups: Map<string, THREE.Group>,
  pickTargets: THREE.Object3D[]
): string | null {
  const hits = intersectTargets(clientX, clientY, camera, element, pickTargets);
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

export type SceneInteractionBridge = {
  isScrollIntent: () => boolean;
  isDragging: () => boolean;
  isPointerDown: () => boolean;
};

export function bindStationPicking(options: {
  camera: THREE.PerspectiveCamera;
  element: HTMLCanvasElement;
  stationGroups: Map<string, THREE.Group>;
  factoryTargets: THREE.Object3D[];
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isFocusActive: () => boolean;
  interaction: SceneInteractionBridge;
}) {
  const {
    camera,
    element,
    stationGroups,
    factoryTargets,
    onHover,
    onSelect,
    isFocusActive,
    interaction,
  } = options;
  let hoveredId: string | null = null;
  const pickTargets = Array.from(stationGroups.values());
  let pendingClick: { x: number; y: number; pointerId: number } | null = null;
  let pendingPointer: { clientX: number; clientY: number } | null = null;
  let pointerMoveFrame = 0;

  const clearHover = () => {
    if (hoveredId) {
      hoveredId = null;
      onHover(null);
    }
  };

  const updateCursor = (stationId: string | null, overFactory: boolean) => {
    if (interaction.isDragging()) {
      element.style.cursor = "grabbing";
      return;
    }
    if (stationId) {
      element.style.cursor = "pointer";
      return;
    }
    element.style.cursor = overFactory ? "grab" : "default";
  };

  const flushPointerMove = () => {
    pointerMoveFrame = 0;
    const point = pendingPointer;
    pendingPointer = null;
    if (!point) return;

    if (
      interaction.isScrollIntent() ||
      interaction.isDragging() ||
      isFocusActive()
    ) {
      if (interaction.isDragging()) {
        updateCursor(null, true);
      } else {
        clearHover();
        element.style.cursor = "default";
      }
      return;
    }

    if (interaction.isPointerDown()) {
      return;
    }

    const overFactory = hitFactoryAt(
      point.clientX,
      point.clientY,
      camera,
      element,
      factoryTargets
    );
    const id = overFactory
      ? pickStationIdAt(
          point.clientX,
          point.clientY,
          camera,
          element,
          stationGroups,
          pickTargets
        )
      : null;

    if (id !== hoveredId) {
      hoveredId = id;
      onHover(id);
    }

    updateCursor(id, overFactory);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (interaction.isDragging() || interaction.isScrollIntent() || interaction.isPointerDown()) {
      return;
    }
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

    if (interaction.isScrollIntent() || interaction.isDragging()) return;
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
