"use client";

export default function MovingMeshBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 70% 80% at 80% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 70% at 50% 50%, rgba(96, 165, 250, 0.06) 0%, transparent 45%),
            radial-gradient(ellipse 50% 50% at 90% 20%, rgba(29, 78, 216, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse 55% 55% at 10% 70%, rgba(59, 130, 246, 0.07) 0%, transparent 45%)
          `,
          backgroundSize: "200% 200%",
          backgroundPosition: "0% 0%",
          animation: "meshMove 25s ease-in-out infinite alternate",
          filter: "blur(1px)",
        }}
      />

      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `
            radial-gradient(ellipse 90% 50% at 70% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 55%),
            radial-gradient(ellipse 60% 90% at 30% 70%, rgba(37, 99, 235, 0.09) 0%, transparent 50%)
          `,
          backgroundSize: "180% 180%",
          backgroundPosition: "100% 100%",
          animation: "meshMove 30s ease-in-out infinite alternate-reverse",
          filter: "blur(2px)",
        }}
      />

      <div
        className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "meshBlobFloat1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 65%)",
          filter: "blur(70px)",
          animation: "meshBlobFloat2 24s ease-in-out infinite 2s",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.05) 0%, transparent 60%)",
          filter: "blur(50px)",
          animation: "meshBlobFloat3 28s ease-in-out infinite 4s",
        }}
      />
    </div>
  );
}
