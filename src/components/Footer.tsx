"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#060810] border-t border-blue-500/10">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-10 md:gap-8">
          <div>
            <Image 
              src="/neofab-icon-transparent.png" 
              alt="NeoFab AI" 
              width={48} 
              height={48}
              className="object-contain mb-4"
            />
            <p className="text-slate-500 text-[14px] leading-relaxed">
              Factory planning,<br />automated.
            </p>
          </div>

          <div className="md:text-right">
            <h4 className="text-white font-semibold text-[14px] mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:Hello@neofab.ai"
                  className="flex items-center gap-2 text-slate-400 text-[14px] hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Hello@neofab.ai
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400 text-[14px]">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>US  +1 (203) 895-6569</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blue-500/10">
          <p className="text-slate-600 text-[13px]">
            © 2026 NeoFab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
