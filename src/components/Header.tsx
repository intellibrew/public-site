"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Products", href: "#products" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

export default function Header({ onBookDemo }: { onBookDemo?: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[80] isolate w-full bg-[rgba(4,7,21,0.7)] backdrop-blur-xl border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 md:px-6 text-[0.95rem]">
        <div className="flex h-[70px] items-center">
          <Link
            href="/"
            aria-label="NeoFab home"
            className="shrink-0 font-bold tracking-tight text-[1.5rem] md:text-[1.7rem] hover:brand-glow text-white font-orbitron -ml-1 md:-ml-4 mr-8"
          >
            <span className="text-white">NeoFab </span>
            <span className="brand-ai-header">AI</span>
          </Link>

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
                  className="relative hover:text-white hover:glow-text transition"
                  style={{ color: "rgb(121, 131, 148)" }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {onBookDemo ? (
            <button
              type="button"
              onClick={onBookDemo}
              className="ml-4 hidden md:inline-flex nav-demo-btn"
              aria-label="Book a demo"
            >
              <span>Book a demo</span>
            </button>
          ) : (
            <span
              className="ml-4 hidden md:inline-flex nav-demo-btn cursor-default"
              aria-hidden
            >
              <span>Book a demo</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
