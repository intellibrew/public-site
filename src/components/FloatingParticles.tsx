"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        className="absolute -top-[40%] -left-[20%] w-[140%] h-[80%]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, 
              rgba(59, 130, 246, 0.08) 0%, 
              rgba(99, 102, 241, 0.05) 30%,
              rgba(139, 92, 246, 0.03) 50%,
              transparent 70%
            )
          `,
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-[30%] -right-[20%] w-[100%] h-[70%]"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, 
              rgba(6, 182, 212, 0.06) 0%, 
              rgba(59, 130, 246, 0.04) 40%,
              transparent 70%
            )
          `,
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-[50%] right-[10%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.03) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -100, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      <motion.div
        className="absolute bottom-[20%] left-[30%] w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)",
          filter: "blur(45px)",
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      <motion.div
        className="absolute top-0 left-[40%] w-[300px] h-full"
        style={{
          background: "linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, transparent 30%, transparent 70%, rgba(59, 130, 246, 0.02) 100%)",
          filter: "blur(30px)",
          transform: "skewX(-15deg)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          x: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)",
          boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.2)",
        }}
        animate={{
          top: ["0%", "100%"],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: "rgba(59, 130, 246, 0.6)",
            boxShadow: "0 0 6px 2px rgba(59, 130, 246, 0.3)",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px]"
        style={{
          background: "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px]"
        style={{
          background: "radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)",
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(8, 10, 15, 0.4) 100%)",
        }}
      />
    </div>
  );
}
