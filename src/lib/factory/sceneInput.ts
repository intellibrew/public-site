import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CANVAS_EVENTS_TO_STOP, CTRL_WHEEL_ZOOM } from "./sceneConfig";

type SceneInputOptions = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  element: HTMLCanvasElement;
};

export function bindSceneInput({ camera, controls, element }: SceneInputOptions) {
  let cameraOverride = false;
  const stopPropagation = (event: Event) => event.stopPropagation();

  const onControlStart = () => {
    cameraOverride = true;
    element.style.cursor = "grabbing";
  };
  const onControlEnd = () => {
    element.style.cursor = "grab";
  };
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;

    event.preventDefault();
    event.stopPropagation();

    const offset = camera.position.clone().sub(controls.target);
    const nextDistance = THREE.MathUtils.clamp(
      offset.length() * (1 + event.deltaY * CTRL_WHEEL_ZOOM.speed),
      CTRL_WHEEL_ZOOM.minDistance,
      CTRL_WHEEL_ZOOM.maxDistance
    );
    offset.setLength(nextDistance);
    camera.position.copy(controls.target).add(offset);
  };

  controls.addEventListener("start", onControlStart);
  controls.addEventListener("end", onControlEnd);
  element.style.cursor = "grab";
  CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
    element.addEventListener(eventName, stopPropagation);
  });
  element.addEventListener("wheel", onWheel, { passive: false });

  return {
    hasCameraOverride: () => cameraOverride,
    dispose: () => {
      controls.removeEventListener("start", onControlStart);
      controls.removeEventListener("end", onControlEnd);
      CANVAS_EVENTS_TO_STOP.forEach((eventName) => {
        element.removeEventListener(eventName, stopPropagation);
      });
      element.removeEventListener("wheel", onWheel);
    },
  };
}
