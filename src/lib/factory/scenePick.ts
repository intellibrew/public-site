import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function setPointerFromEvent(
  event: PointerEvent,
  element: HTMLElement
) {
  const rect = element.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

export function pickConveyorHit(
  event: PointerEvent,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  conveyorGroup: THREE.Group
): boolean {
  setPointerFromEvent(event, element);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObject(conveyorGroup, true);
  for (const hit of hits) {
    let node: THREE.Object3D | null = hit.object;
    while (node) {
      if (node.userData.stationId) return false;
      if (node.userData.conveyorPickable) return true;
      node = node.parent;
    }
  }

  return hits.length > 0;
}

export function pickStationId(
  event: PointerEvent,
  camera: THREE.PerspectiveCamera,
  element: HTMLElement,
  stationGroups: Map<string, THREE.Group>
): string | null {
  setPointerFromEvent(event, element);
  raycaster.setFromCamera(pointer, camera);

  const targets: THREE.Object3D[] = [];
  stationGroups.forEach((group) => {
    if (group.visible) targets.push(group);
  });

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
  conveyorGroup: THREE.Group;
  onHover: (id: string | null) => void;
  onConveyorHover?: (hovered: boolean) => void;
  onSelect: (id: string) => void;
  onConveyorSelect?: () => void;
  isFocusActive: () => boolean;
  isConveyorFocusActive: () => boolean;
}) {
  const {
    camera,
    element,
    stationGroups,
    conveyorGroup,
    onHover,
    onConveyorHover,
    onSelect,
    onConveyorSelect,
    isFocusActive,
    isConveyorFocusActive,
  } = options;
  let hoveredId: string | null = null;
  let conveyorHovered = false;

  const onPointerMove = (event: PointerEvent) => {
    if (isFocusActive() || isConveyorFocusActive()) {
      if (hoveredId) {
        hoveredId = null;
        onHover(null);
      }
      if (conveyorHovered) {
        conveyorHovered = false;
        onConveyorHover?.(false);
      }
      element.style.cursor = "default";
      return;
    }

    const id = pickStationId(event, camera, element, stationGroups);
    const beltHit = !id && pickConveyorHit(event, camera, element, conveyorGroup);

    if (id !== hoveredId) {
      hoveredId = id;
      onHover(id);
    }
    if (beltHit !== conveyorHovered) {
      conveyorHovered = beltHit;
      onConveyorHover?.(beltHit);
    }

    element.style.cursor = id || beltHit ? "pointer" : "grab";
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isFocusActive() || isConveyorFocusActive()) return;
    const id = pickStationId(event, camera, element, stationGroups);
    if (id) {
      event.stopPropagation();
      onSelect(id);
      return;
    }
    if (pickConveyorHit(event, camera, element, conveyorGroup)) {
      event.stopPropagation();
      onConveyorSelect?.();
    }
  };

  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerdown", onPointerDown);

  return {
    dispose: () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerdown", onPointerDown);
    },
  };
}
