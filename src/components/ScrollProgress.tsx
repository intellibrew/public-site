"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #14b8a6, #2dd4bf, #5eead4)",
        boxShadow: "0 0 10px rgba(20, 184, 166, 0.8), 0 0 20px rgba(20, 184, 166, 0.4)",
      }}
    />
  );
}
