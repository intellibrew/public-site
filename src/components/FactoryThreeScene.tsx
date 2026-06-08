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
}: FactoryThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<FactorySceneHandle | null>(null);

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
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={mountRef}
        className="pointer-events-auto absolute inset-0"
        aria-label="Interactive 3D factory build"
      />
    </div>
  );
}
