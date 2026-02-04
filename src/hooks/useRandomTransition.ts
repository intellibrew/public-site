"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Hook that provides slightly randomized animation values
 * for organic, unique-feeling transitions on each interaction.
 */
export function useRandomTransition() {
  const [seed, setSeed] = useState(0);

  // Regenerate random values on each hover
  const refresh = useCallback(() => {
    setSeed(Date.now());
  }, []);

  // Generate slightly varied values based on seed
  const values = useMemo(() => {
    const random = (min: number, max: number) => {
      // Simple seeded random for consistency during render
      const x = Math.sin(seed + 1) * 10000;
      const r = x - Math.floor(x);
      return min + r * (max - min);
    };

    return {
      // Slight scale variation (1.01 to 1.03)
      scale: random(1.01, 1.03),
      // Slight Y translation variation (-2px to -4px)
      translateY: random(-2, -4),
      // Slight rotation for organic feel (-0.5deg to 0.5deg)
      rotate: random(-0.5, 0.5),
      // Shimmer duration variation (0.6s to 0.9s)
      shimmerDuration: random(0.6, 0.9),
      // Glow intensity variation (0.8 to 1.2)
      glowIntensity: random(0.8, 1.2),
    };
  }, [seed]);

  return { values, refresh };
}

/**
 * Framer Motion spring configurations with slight randomization
 */
export function getRandomSpring() {
  const baseStiffness = 400;
  const baseDamping = 30;
  
  return {
    type: "spring" as const,
    stiffness: baseStiffness + Math.random() * 100 - 50, // 350-450
    damping: baseDamping + Math.random() * 10 - 5, // 25-35
    mass: 0.8 + Math.random() * 0.4, // 0.8-1.2
  };
}

/**
 * Generate random but smooth animation variants
 */
export function getRandomHoverVariant() {
  const yOffset = -2 - Math.random() * 2; // -2 to -4
  const scale = 1.01 + Math.random() * 0.02; // 1.01 to 1.03
  
  return {
    y: yOffset,
    scale: scale,
    transition: getRandomSpring(),
  };
}

/**
 * Stagger children with slight randomization
 */
export function getRandomStagger(baseDelay = 0.1) {
  return {
    staggerChildren: baseDelay + Math.random() * 0.05, // slight variation
    delayChildren: Math.random() * 0.1, // 0 to 0.1s delay
  };
}
