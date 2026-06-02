"use client";

import { useEffect, useRef } from "react";
import { mountFactoryScene, type FactorySceneHandle } from "@/lib/factory/runtime";
import type { StorySnapshot } from "@/lib/factory/flowOptimization";

export type FocusPhase = "idle" | "entering" | "active" | "exiting";
export type ConveyorFocusPhase = "idle" | "entering" | "active" | "exiting";

type FactoryThreeSceneProps = {
  getBuildProgress: () => number;
  getStoryActive: () => boolean;
  storyRef: React.MutableRefObject<StorySnapshot>;
  onFocusChange?: (stationId: string | null, phase: FocusPhase) => void;
  onConveyorFocusChange?: (phase: ConveyorFocusPhase) => void;
  onStationHover?: (stationId: string | null) => void;
  onConveyorHover?: (hovered: boolean) => void;
  focusRequestRef?: React.MutableRefObject<
    ((id: string | null, options?: { immediate?: boolean }) => void) | null
  >;
  conveyorFocusRequestRef?: React.MutableRefObject<
    ((active: boolean) => void) | null
  >;
};

export default function FactoryThreeScene({
  getBuildProgress,
  getStoryActive,
  storyRef,
  onFocusChange,
  onConveyorFocusChange,
  onStationHover,
  onConveyorHover,
  focusRequestRef,
  conveyorFocusRequestRef,
}: FactoryThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneHandleRef = useRef<FactorySceneHandle | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = mountFactoryScene(mount, {
      getProgress: getBuildProgress,
      getStoryActive,
      getStorySnapshot: () => storyRef.current,
      onFocusChange,
      onConveyorFocusChange,
      onStationHover,
      onConveyorHover,
    });
    sceneHandleRef.current = scene;

    if (focusRequestRef) {
      focusRequestRef.current = (id, options) => scene.focusStation(id, options);
    }
    if (conveyorFocusRequestRef) {
      conveyorFocusRequestRef.current = (active) => {
        if (active) scene.focusConveyor();
        else scene.exitConveyorFocus();
      };
    }

    return () => {
      scene.dispose();
      sceneHandleRef.current = null;
      if (focusRequestRef) {
        focusRequestRef.current = null;
      }
      if (conveyorFocusRequestRef) {
        conveyorFocusRequestRef.current = null;
      }
    };
  }, [
    onFocusChange,
    onConveyorFocusChange,
    onStationHover,
    onConveyorHover,
    focusRequestRef,
    conveyorFocusRequestRef,
    storyRef,
    getBuildProgress,
    getStoryActive,
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
