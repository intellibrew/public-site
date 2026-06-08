"use client";

import { Mail } from "lucide-react";

export default function FactoryContactCue() {
  return (
    <a
      href="mailto:Hello@neofab.ai"
      className="factory-contact-cue inline-flex min-w-0 items-center gap-2 font-body text-[12px] text-slate-400/90 transition-colors hover:text-teal-400/95 sm:text-[13px]"
      title="Contact us: Hello@neofab.ai"
    >
      <Mail className="h-3.5 w-3.5 flex-shrink-0 opacity-80 sm:h-4 sm:w-4" aria-hidden />
      <span className="factory-contact-cue-label">Contact us: Hello@neofab.ai</span>
    </a>
  );
}
