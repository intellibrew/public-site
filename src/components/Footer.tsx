"use client";

import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#060810] border-t border-blue-500/10">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="flex flex-col items-start gap-2 text-slate-500 text-[13px] md:flex-row md:items-center md:justify-between">
          <span>© 2026 NeoFab. All rights reserved.</span>
          <a
            href="mailto:Hello@neofab.ai"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>Contact us: Hello@neofab.ai</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
