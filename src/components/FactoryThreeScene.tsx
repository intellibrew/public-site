"use client";

import { useEffect, useRef } from "react";
import { mountFactoryScene } from "@/lib/factory/runtime";

type FactoryThreeSceneProps = {
  progress: number;
};

export default function FactoryThreeScene({ progress }: FactoryThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = mountFactoryScene(mount, () => progressRef.current);
    return () => scene.dispose();
  }, []);

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
