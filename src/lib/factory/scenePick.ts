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
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  isFocusActive: () => boolean;
}) {
  const {
    camera,
    element,
    stationGroups,
    onHover,
    onSelect,
    isFocusActive,
  } = options;
  let hoveredId: string | null = null;

  const onPointerMove = (event: PointerEvent) => {
    if (isFocusActive()) {
      if (hoveredId) {
        hoveredId = null;
        onHover(null);
      }
      element.style.cursor = "default";
      return;
    }

    const id = pickStationId(event, camera, element, stationGroups);

    if (id !== hoveredId) {
      hoveredId = id;
      onHover(id);
    }

    element.style.cursor = id ? "pointer" : "grab";
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isFocusActive()) return;
    const id = pickStationId(event, camera, element, stationGroups);
    if (id) {
      event.stopPropagation();
      onSelect(id);
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
