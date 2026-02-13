"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Use cases", href: "#use-cases" },
  { label: "Products", href: "#products" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

export default function Header({ onBookDemo }: { onBookDemo?: () => void }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleBookDemo = useCallback(() => {
    closeMobile();
    onBookDemo?.();
  }, [closeMobile, onBookDemo]);

  return (
    <header
      className={`sticky top-0 z-[80] isolate w-full border-b transition-colors duration-300 ${
        scrolled
          ? "bg-[rgba(4,7,21,0.4)] backdrop-blur-xl border-white/5"
          : "bg-transparent backdrop-blur-0 border-white/5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 text-[0.95rem]">
        <div className="flex h-[70px] items-center justify-between">
          <Link
            href="/"
            aria-label="NeoFab home"
            className="shrink-0 font-bold tracking-tight text-[1.5rem] md:text-[1.7rem] hover:brand-glow text-white font-serif -ml-1 md:-ml-4 mr-8"
          >
            <span className="text-white">NeoFab </span>
            <span className="brand-ai-header">AI</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden md:flex flex-1 items-center justify-center gap-10 text-[0.95rem] font-serif"
          >
            {navLinks.map((link) => {
              const finalHref =
                link.href.startsWith("#") && pathname !== "/" ? `/${link.href}` : link.href;
              return (
                <Link
                  key={link.label}
                  href={finalHref}
                  className="relative hover:text-white hover:glow-text transition"
                  style={{ color: "rgb(121, 131, 148)" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block ml-4">
            {onBookDemo ? (
              <button
                type="button"
                onClick={onBookDemo}
                className="nav-demo-btn"
                aria-label="Book a demo"
              >
                <span>Book a demo</span>
              </button>
            ) : (
              <span className="nav-demo-btn cursor-default inline-flex" aria-hidden>
                <span>Book a demo</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 -mr-2 text-white/80 hover:text-white rounded-lg transition"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {typeof document !== "undefined" &&
        mobileOpen &&
        createPortal(
          <>
            <div
              className="fixed top-[70px] left-0 right-0 bottom-0 z-[9998] bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden
              onClick={closeMobile}
            />
            <div
              className="fixed top-[70px] right-0 bottom-0 z-[9999] w-full max-w-[280px] bg-[#0a0e1a] border-l border-white/10 shadow-2xl md:hidden flex flex-col overflow-y-auto"
              role="dialog"
              aria-label="Mobile menu"
            >
              <nav
                className="flex flex-col p-5 gap-0 font-serif text-white"
                aria-label="Primary mobile"
              >
                {navLinks.map((link) => {
                  const finalHref =
                    link.href.startsWith("#") && pathname !== "/" ? `/${link.href}` : link.href;
                  return (
                    <Link
                      key={link.label}
                      href={finalHref}
                      onClick={closeMobile}
                      className="py-3 px-4 rounded-lg text-[1rem] text-gray-200 hover:bg-white/10 hover:text-white transition"
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="mt-4 pt-4 border-t border-white/10">
                  {onBookDemo ? (
                    <button
                      type="button"
                      onClick={handleBookDemo}
                      className="w-full py-3 px-4 rounded-lg nav-demo-btn text-center"
                      aria-label="Book a demo"
                    >
                      Book a demo
                    </button>
                  ) : (
                    <span className="block w-full py-3 px-4 rounded-lg nav-demo-btn text-center cursor-default">
                      Book a demo
                    </span>
                  )}
                </div>
              </nav>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
