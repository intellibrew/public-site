"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const canvas = mountRef.current?.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    canvas.style.pointerEvents = sceneInteractive ? "auto" : "none";
    canvas.style.touchAction = sceneInteractive ? "none" : "pan-y";
  }, [sceneInteractive]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = mountFactoryScene(mount, {
      getProgress: getBuildProgress,
      getStoryActive,
      getScenePaused,
      getStorySnapshot: () => storyRef.current,
      onFocusChange,
      onStationHover,
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
  }, [
    onFocusChange,
    onStationHover,
    focusRequestRef,
    storyRef,
    getBuildProgress,
    getStoryActive,
    getScenePaused,
    simplified,
  ]);

  return (
    <div className="factory-model-mount relative h-full w-full overflow-hidden">
      <div
        ref={mountRef}
        className={`absolute inset-0 ${sceneInteractive ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-label="Interactive 3D factory build"
      />
    </div>
  );
}
