"use client";

import { useCallback, useEffect, useRef } from "react";
import { mountFactoryScene, type FactorySceneHandle } from "@/lib/factory/runtime";
import type { StorySnapshot } from "@/lib/factory/flowOptimization";

export type FocusPhase = "idle" | "entering" | "active" | "exiting";

type FactoryThreeSceneProps = {
  getBuildProgress: () => number;
  getStoryActive: () => boolean;
  getScenePaused?: () => boolean;
  storyRef: React.MutableRefObject<StorySnapshot>;
  onFocusChange?: (stationId: string | null, phase: FocusPhase) => void;
  onStationHover?: (stationId: string | null) => void;
  focusRequestRef?: React.MutableRefObject<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >;
  simplified?: boolean;
  sceneInteractive?: boolean;
};

export default function FactoryThreeScene({
  getBuildProgress,
  getStoryActive,
  getScenePaused,
  storyRef,
  onFocusChange,
  onStationHover,
  focusRequestRef,
  simplified = false,
  sceneInteractive = false,
}: FactoryThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<FactorySceneHandle | null>(null);
  const latestRefs = useRef({
    getBuildProgress,
    getStoryActive,
    getScenePaused,
    storyRef,
    onFocusChange,
    onStationHover,
  });

  latestRefs.current = {
    getBuildProgress,
    getStoryActive,
    getScenePaused,
    storyRef,
    onFocusChange,
    onStationHover,
  };

  const applyCanvasInteraction = useCallback(() => {
    const canvas = mountRef.current?.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    canvas.style.pointerEvents = sceneInteractive ? "auto" : "none";
    canvas.style.touchAction = sceneInteractive ? "none" : "pan-y";

    if (sceneInteractive) {
      canvas.setAttribute("data-lenis-prevent", "");
    } else {
      canvas.removeAttribute("data-lenis-prevent");
    }
  }, [sceneInteractive]);

  useEffect(() => {
    applyCanvasInteraction();
    const frameId = requestAnimationFrame(applyCanvasInteraction);
    return () => cancelAnimationFrame(frameId);
  }, [applyCanvasInteraction]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = mountFactoryScene(mount, {
      getProgress: () => latestRefs.current.getBuildProgress(),
      getStoryActive: () => latestRefs.current.getStoryActive(),
      getScenePaused: () => latestRefs.current.getScenePaused?.() ?? false,
      getStorySnapshot: () => latestRefs.current.storyRef.current,
      onFocusChange: (stationId, phase) =>
        latestRefs.current.onFocusChange?.(stationId, phase),
      onStationHover: (stationId) => latestRefs.current.onStationHover?.(stationId),
      simplified,
    });
    sceneHandleRef.current = scene;

    if (focusRequestRef) {
      focusRequestRef.current = (id, options) => scene.focusStation(id, options);
    }

    return () => {
      scene.dispose();
      sceneHandleRef.current = null;
      if (focusRequestRef) {
        focusRequestRef.current = null;
      }
    };
  }, [focusRequestRef, simplified]);

  return (
    <div className="factory-model-mount relative h-full w-full overflow-hidden">
      <div
        ref={mountRef}
        className={`absolute inset-0 ${sceneInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
        data-lenis-prevent={sceneInteractive ? "" : undefined}
        style={{ touchAction: sceneInteractive ? "none" : "pan-y" }}
        aria-label="Interactive 3D factory build"
      />
    </div>
  );
}
