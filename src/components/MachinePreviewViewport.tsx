"use client";

import { useEffect, useRef } from "react";
import { mountStationPreview } from "@/lib/factory/stationPreview";

type MachinePreviewViewportProps = {
  stationId: string;
  className?: string;
};

export default function MachinePreviewViewport({
  stationId,
  className = "",
}: MachinePreviewViewportProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const preview = mountStationPreview(mount, stationId);
    return () => preview?.dispose();
  }, [stationId]);

  return (
    <div
      ref={mountRef}
      className={`machine-preview-viewport ${className}`}
      aria-hidden
    />
  );
}
