"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Cog, ShoppingCart, CheckCircle } from "lucide-react";

const roles = [
  {
    icon: Ruler,
    title: "Design Engineers",
    items: ["Product integration", "Line specifications", "Technical drawings"],
    gradient: "from-emerald-500/15 to-transparent",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    hoverTitle: "group-hover:text-emerald-400",
  },
  {
    icon: Cog,
    title: "Process & IE",
    items: ["Station design", "Cycle time modeling", "Layout iteration"],
    gradient: "from-blue-500/15 to-transparent",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    hoverTitle: "group-hover:text-blue-400",
  },
  {
    icon: ShoppingCart,
    title: "Ops & Procurement",
    items: ["RFQ packs", "Equipment selection", "Capacity & bottlenecks"],
    gradient: "from-violet-500/15 to-transparent",
    accent: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    hoverBorder: "hover:border-violet-500/50",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    hoverTitle: "group-hover:text-violet-400",
  },
];

export function TeamsSection({ onBookDemo }: { onBookDemo?: () => void } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="teams" className="relative py-24 md:py-36" data-testid="section-teams">
      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight mb-4" data-testid="text-teams-heading">
            Built for teams
            <br />
            <span className="gradient-text-animated">that ship</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="group"
            >
              <Card
                className={`bg-card/60 backdrop-blur-sm h-full border transition-all duration-300 hover:-translate-y-1.5 ${role.hoverBorder} ${role.hoverShadow}`}
                data-testid={`card-role-${i}`}
              >
                <CardContent className="p-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.4 + i * 0.15, type: "spring", stiffness: 200 }}
                    className={`w-12 h-12 rounded-lg ${role.bg} ${role.border} border flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <role.icon className={`w-5 h-5 ${role.accent}`} />
                  </motion.div>

                  <h3 className={`text-lg font-bold mb-5 text-foreground transition-colors duration-300 ${role.hoverTitle}`} data-testid={`text-role-title-${i}`}>{role.title}</h3>

                  <ul className="space-y-3">
                    {role.items.map((item, j) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.6 + i * 0.15 + j * 0.1, duration: 0.4 }}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <CheckCircle className={`w-4 h-4 ${role.accent} flex-shrink-0`} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
