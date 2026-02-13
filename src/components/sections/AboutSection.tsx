"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileDown, Users } from "lucide-react";

const whatItDoes = [
  "Generates a linked production line model from your inputs",
  "Connects stations, machines, cycle times, and cost in one system",
  "Exports artifacts teams can use immediately (RFQs, CAPEX, layouts)",
];

const outputs = ["Layout file", "Stations table", "RFQ pack", "CAPEX/OPEX sheet"];

export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section id="about" className="relative py-24 md:py-36" data-testid="section-about">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" data-testid="text-about-heading">
            About <span className="gradient-text-animated">NeoFab</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm h-full" data-testid="card-about-what">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">What it does</h3>
                </div>
                <ul className="space-y-4">
                  {whatItDoes.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -15 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <FileDown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">What you get</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {outputs.map((item, i) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.7 + i * 0.08, duration: 0.3 }}
                        className="px-3 py-1 rounded-md bg-card border border-border text-xs font-mono text-muted-foreground"
                        data-testid={`tag-about-output-${item.toLowerCase().replace(/[\s/]/g, "-")}`}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm h-full" data-testid="card-about-team">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">Built by operators and engineers</h3>
                </div>
                <div className="space-y-6">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Founders are veterans in manufacturing and AI, and have led teams at{" "}
                    <span className="text-foreground font-medium">Amazon, Rivian, Ola, and Ather</span>.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    World-class engineers and operators building the system end-to-end
                    {" "}&mdash; from line modeling to execution artifacts.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    Obsessed with{" "}
                    <span className="text-primary font-medium">throughput, cost, and time-to-build</span>
                    {" "}&mdash; not dashboards.
                  </motion.p>
                </div>

                <div className="mt-8 pt-6 border-t border-border/50">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex items-center gap-1 text-xs text-muted-foreground font-mono flex-wrap"
                  >
                    <span className="text-primary">Inputs</span>
                    <span>&rarr;</span>
                    <span className="text-primary">Outputs</span>
                    <span className="ml-2">: Upload CAD + BOM + specs &rarr; get a complete line model</span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
