"use client";

import { useEffect, useState } from "react";
import type { FC, PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SafeAnimatePresence = AnimatePresence as FC<PropsWithChildren>;

const navItems = [
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "use-cases", label: "Use Cases" },
  { id: "products", label: "Products" },
  { id: "teams", label: "Teams" },
  { id: "in-action", label: "In Action" },
  { id: "clients", label: "Clients" },
  { id: "about", label: "About" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export function SideNav() {
  const [activeSection, setActiveSection] = useState("problem");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      const viewportThreshold = window.innerHeight * 0.25;
      const heroSection = document.getElementById("product");
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        setIsVisible(heroRect.bottom < window.innerHeight - 100);
      } else {
        setIsVisible(window.scrollY > window.innerHeight - 150);
      }

      let currentSection = navItems[0].id;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= viewportThreshold) {
            currentSection = section.id;
            break;
          }
        }
      }
      setActiveSection(currentSection);

      if (window.scrollY < 50) {
        setActiveSection("problem");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const lenis = window.lenis;
      if (lenis) {
        lenis.scrollTo(element, { offset: -80, duration: 1.5 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <SafeAnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-0 top-[35%] z-50 hidden lg:block"
        >
          <div className="flex flex-col items-end gap-3 pr-4">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="group flex items-center gap-3 py-1 transition-all duration-300"
            >
              <span
                className={`text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : isHovered
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>

              <motion.div
                className="relative h-[2px] rounded-full overflow-hidden"
                initial={false}
                animate={{
                  width: isActive ? 28 : isHovered ? 20 : 14,
                  backgroundColor: isActive
                    ? "hsl(160, 70%, 45%)"
                    : isHovered
                    ? "rgb(148, 163, 184)"
                    : "rgb(71, 85, 105)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      boxShadow: "0 0 10px hsl(160 70% 45% / 0.8)",
                    }}
                  />
                )}
              </motion.div>
            </button>
          );
        })}
      </div>
        </motion.nav>
      )}
    </SafeAnimatePresence>
  );
}
