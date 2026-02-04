"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const clients: { name: string; logo: string; noInvert?: boolean }[] = [
  { name: "Amazon", logo: "/logo/amazon.svg" },
  { name: "BCG", logo: "/logo/bcg.svg" },
  { name: "Can-Tek", logo: "/logo/can-tek.svg" },
  { name: "Cummins", logo: "/logo/cummins.svg" },
  { name: "Deloitte", logo: "/logo/deloitte.png" },
  { name: "Delux Bearings", logo: "/logo/delux_bearings_ltd__logo.jpeg", noInvert: true },
  { name: "Emo Energy", logo: "/logo/emo-energy.svg" },
  { name: "Ford", logo: "/logo/ford.svg" },
  { name: "Macauw Paints", logo: "/logo/macauw-paints.png" },
  { name: "Ola", logo: "/logo/ola.svg" },
  { name: "One Energy", logo: "/logo/one-energy.svg" },
  { name: "Seurat", logo: "/logo/_seurat__LOGO_COLOR_01052022.png" },
  { name: "Shivam Steel", logo: "/logo/shivam-steel-logo.png.webp", noInvert: true },
  { name: "Shyam Steel", logo: "/logo/shyam-steel.png", noInvert: true },
  { name: "Society Tea", logo: "/logo/society-tea-logo_178x_2x-2_140x@2x.avif" },
  { name: "Volkswagen", logo: "/logo/Volkswagen_logo_2019.svg.png" },
  { name: "Yellow", logo: "/logo/yellow-logo-dark.webp" },
];

export function ClientsSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="clients" className="relative bg-[#080a0f] py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6 md:mb-10">
        <motion.p 
          className="text-center text-slate-400 text-sm sm:text-[16px] italic"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by Engineers and Consultants globally
        </motion.p>
      </div>

      <div 
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-[#080a0f] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-[#080a0f] to-transparent" />

        <motion.div
          className="flex gap-6 sm:gap-10 md:gap-12 items-center"
          animate={{
            x: [0, -2400],
          }}
          transition={{
            x: {
              duration: isPaused ? 999999 : 50,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {clients.map((client, index) => (
            <motion.div
              key={`first-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-blue-500/20 bg-slate-900/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center transition-all duration-300"
              whileHover={{ 
                scale: 1.05, 
                borderColor: "rgba(59, 130, 246, 0.5)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
              }}
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[40px] sm:max-h-[50px] w-auto opacity-80 hover:opacity-100 transition-opacity ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
          {clients.map((client, index) => (
            <motion.div
              key={`second-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-blue-500/20 bg-slate-900/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center transition-all duration-300"
              whileHover={{ 
                scale: 1.05, 
                borderColor: "rgba(59, 130, 246, 0.5)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
              }}
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[40px] sm:max-h-[50px] w-auto opacity-80 hover:opacity-100 transition-opacity ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
          {clients.map((client, index) => (
            <motion.div
              key={`third-${index}`}
              className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border border-blue-500/20 bg-slate-900/30 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] h-[60px] sm:h-[70px] md:h-[80px] flex items-center justify-center transition-all duration-300"
              whileHover={{ 
                scale: 1.05, 
                borderColor: "rgba(59, 130, 246, 0.5)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
              }}
            >
              <img
                src={client.logo}
                alt={client.name}
                width={120}
                height={50}
                className={`object-contain max-h-[40px] sm:max-h-[50px] w-auto opacity-80 hover:opacity-100 transition-opacity ${!client.noInvert ? "brightness-0 invert" : ""}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
