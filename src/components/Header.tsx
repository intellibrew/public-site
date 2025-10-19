import Link from "next/link";
import { usePathname } from "next/navigation"; // Next 13+ App Router
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const navLinks = [
  ["Demo", "#demos"],
  ["Features", "#features"],
  ["FAQ", "#faq"],
  ["About", "#about"],
  ["Blog", "/blog"], // external page, doesn't need home prefix
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[80] isolate w-full bg-white/75 backdrop-blur-xl ring-1 ring-zinc-200/70">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            aria-label="NeoFab home"
            className="shrink-0 font-bold tracking-tight text-[1.5rem] md:text-[1.7rem] hover:brand-glow"
          >
            <span className="text-zinc-900">NeoFab </span>
            <span className="brand-ai">AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-1 ring-1 ring-zinc-200 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)]"
            >
              {navLinks.map(([label, href]) => {
                // If link is a section, prepend home page if not already on home
                const finalHref =
                  href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

                return (
                  <a
                    key={label}
                    href={finalHref}
                    className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:glow-text transition"
                  >
                    {label}
                  </a>
                );
              })}
            </nav>

            <Button asChild className="neo-btn btn-halo">
              <a href="https://app.neofab.ai/login" target="_blank" rel="noreferrer">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
