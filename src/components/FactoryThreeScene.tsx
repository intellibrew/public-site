"use client";

import { useEffect, useRef } from "react";
import { mountFactoryScene, type FactorySceneHandle } from "@/lib/factory/runtime";
import type { StorySnapshot } from "@/lib/factory/flowOptimization";

export type FocusPhase = "idle" | "entering" | "active" | "exiting";

type FactoryThreeSceneProps = {
  getBuildProgress: () => number;
  getStoryActive: () => boolean;
  getScenePaused?: () => boolean;
  getAutoplayLocked?: () => boolean;
  storyRef: React.MutableRefObject<StorySnapshot>;
  onFocusChange?: (stationId: string | null, phase: FocusPhase) => void;
  onStationHover?: (stationId: string | null) => void;
  focusRequestRef?: React.MutableRefObject<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >;
  simplified?: boolean;
  preferPageScroll?: boolean;
};

export default function FactoryThreeScene({
  getBuildProgress,
  getStoryActive,
  getScenePaused,
  getAutoplayLocked,
  storyRef,
  onFocusChange,
  onStationHover,
  focusRequestRef,
  simplified = false,
  preferPageScroll = false,
}: FactoryThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<FactorySceneHandle | null>(null);
  const latestRefs = useRef({
    getBuildProgress,
    getStoryActive,
    getScenePaused,
    getAutoplayLocked,
    storyRef,
    onFocusChange,
    onStationHover,
  });

  latestRefs.current = {
    getBuildProgress,
    getStoryActive,
    getScenePaused,
    getAutoplayLocked,
    storyRef,
    onFocusChange,
    onStationHover,
  };

  useEffect(() => {
    sceneHandleRef.current?.setPreferPageScroll(preferPageScroll);
  }, [preferPageScroll]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = mountFactoryScene(mount, {
      getProgress: () => latestRefs.current.getBuildProgress(),
      getStoryActive: () => latestRefs.current.getStoryActive(),
      getScenePaused: () => latestRefs.current.getScenePaused?.() ?? false,
      getAutoplayLocked: () => latestRefs.current.getAutoplayLocked?.() ?? false,
      getStorySnapshot: () => latestRefs.current.storyRef.current,
      onFocusChange: (stationId, phase) =>
        latestRefs.current.onFocusChange?.(stationId, phase),
      onStationHover: (stationId) => latestRefs.current.onStationHover?.(stationId),
      simplified,
      preferPageScroll,
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
  }, [focusRequestRef, simplified, preferPageScroll]);

  return (
    <div className="factory-model-mount relative h-full w-full overflow-hidden">
      <div
        ref={mountRef}
        className="factory-model-mount-surface absolute inset-0 touch-manipulation"
        style={{ touchAction: preferPageScroll ? "pan-y" : "auto" }}
        aria-label="Interactive 3D factory build"
      />
    </div>
  );
}
