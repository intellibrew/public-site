"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Blog", href: "/blog" },
];

type HeaderProps = {
  onBookDemo?: () => void;
  minimal?: boolean;
  overlay?: boolean;
  transparent?: boolean;
};

export default function Header({ onBookDemo, minimal = false, overlay = false, transparent = false }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleBookDemo = useCallback(() => {
    closeMobile();
    onBookDemo?.();
  }, [closeMobile, onBookDemo]);

  return (
    <header
      className={`${overlay ? "fixed" : "sticky"} top-0 z-[80] isolate w-full transition-all duration-500 ${
        transparent
          ? "border-b border-transparent bg-transparent backdrop-blur-0"
          : "border-b border-teal-500/10 bg-[rgba(2,12,14,0.8)] shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 text-[0.95rem]">
        <div className="flex h-[70px] items-center justify-between">
          <Link
            href="/"
            aria-label="NeoFab home"
            className="shrink-0 font-bold tracking-tight text-[1.5rem] md:text-[1.7rem] text-white font-orbitron -ml-1 md:-ml-4 mr-8 hover:text-teal-50 transition-colors"
          >
            <span className="text-white">NeoFab</span>
            {!minimal && <span className="text-primary"> AI</span>}
          </Link>

          {!minimal && (
            <nav
              aria-label="Primary"
              className="hidden md:flex flex-1 items-center justify-center gap-10 text-[0.95rem] font-orbitron"
            >
              {navLinks.map((link) => {
                const finalHref =
                  link.href.startsWith("#") && pathname !== "/" ? `/${link.href}` : link.href;
                return (
                  <Link
                    key={link.label}
                    href={finalHref}
                    className="relative text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {!minimal && onBookDemo && (
            <div className="hidden md:block ml-4">
              <button
                type="button"
                onClick={onBookDemo}
                className="nav-demo-btn"
                aria-label="Book a demo"
              >
                <span>Book a demo</span>
              </button>
            </div>
          )}

          {!minimal && (
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 -mr-2 text-white/80 hover:text-white rounded-lg transition"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {typeof document !== "undefined" &&
        !minimal &&
        mobileOpen &&
        createPortal(
          <>
            <div
              className="fixed top-[70px] left-0 right-0 bottom-0 z-[9998] bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden
              onClick={closeMobile}
            />
            <div
              className="fixed top-[70px] right-0 bottom-0 z-[9999] w-full max-w-[280px] bg-[#060c0e] border-l border-teal-500/10 shadow-2xl md:hidden flex flex-col overflow-y-auto"
              role="dialog"
              aria-label="Mobile menu"
            >
              <nav
                className="flex flex-col p-5 gap-0 font-orbitron text-white"
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
                {onBookDemo && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleBookDemo}
                      className="w-full py-3 px-4 rounded-lg nav-demo-btn text-center"
                      aria-label="Book a demo"
                    >
                      Book a demo
                    </button>
                  </div>
                )}
              </nav>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}
