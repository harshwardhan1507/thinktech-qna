import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function Home() {
  const routes = [
    {
      name: "Student",
      tag: "Mobile",
      href: "/ask",
      description: "Ask questions anonymously during ThinkTech orientation.",
      action: "Open Student Form",
    },
    {
      name: "Moderator",
      tag: "Desktop",
      href: "/moderator",
      description: "Curate, approve, and display incoming questions live.",
      action: "Open Control Panel",
    },
    {
      name: "Display",
      tag: "16:9 Stage",
      href: "/display",
      description: "Live 16:9 presentation screen for the orientation stage.",
      action: "Launch Stage Display",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-12 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <header className="w-full flex justify-between items-center py-4 border-b border-[#27272A]">
        <div className="flex items-center space-x-2.5">
          <span className="h-2 w-2 rounded-full bg-[#FAFAFA]"></span>
          <span className="font-mono text-xs tracking-widest uppercase text-[#71717A] font-semibold">
            THINKTECH SOCIETY
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181B] text-[#A1A1AA] border border-[#27272A] uppercase tracking-wider">
          System Overview
        </span>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center my-auto py-16 space-y-10 w-full max-w-2xl">
        <div className="space-y-4">
          <div className="text-xs font-mono tracking-widest text-[#71717A] uppercase font-semibold">
            THINKTECH SOCIETY
          </div>
          <h1 className="text-6xl sm:text-8xl font-extrabold tracking-tight text-[#FAFAFA]">
            Q&A
          </h1>
          <div className="pt-2 font-normal space-y-1.5 text-base sm:text-xl">
            <p className="text-[#A1A1AA] font-medium">
              Anonymous Live Q&A for ThinkTech Orientation
            </p>
            <p className="text-[#71717A] font-mono text-sm tracking-widest uppercase pt-1">
              Ask. Explore. Build.
            </p>
          </div>
        </div>

        {/* Minimal Routes Grid */}
        <div className="pt-4 w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {routes.map((route) => (
            <Link key={route.name} href={route.href} className="group block">
              <Card className="h-full flex flex-col justify-between group-hover:border-[#3F3F46] group-hover:bg-[#18181B] transition-all duration-150 p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#FAFAFA] group-hover:text-white transition-colors">
                      {route.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181B] text-[#71717A] border border-[#27272A]">
                      {route.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {route.description}
                  </p>
                </div>
                <div className="pt-6 flex items-center text-xs font-mono text-[#FAFAFA] group-hover:translate-x-1 transition-transform font-semibold">
                  <span>{route.action}</span>
                  <span className="ml-1.5">&rarr;</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t border-[#27272A] text-xs text-[#71717A] font-mono">
        ThinkTech Orientation Live Q&A &bull; Monochrome Design System
      </footer>
    </main>
  );
}
