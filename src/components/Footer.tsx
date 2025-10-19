"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-[1.05rem]">
              NeoFab <span className="brand-ai">AI</span>
            </span>
            <span className="text-sm text-zinc-600">
              © {currentYear} NeoFab. All rights reserved.
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <Link href="#flow" className="hover:glow-text">Flow</Link>
            <Link href="#features" className="hover:glow-text">Features</Link>
            <Link href="#faq" className="hover:glow-text">FAQ</Link>
            <Link href="#contact" className="hover:glow-text">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
