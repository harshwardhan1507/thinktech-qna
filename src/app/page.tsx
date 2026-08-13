import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroIllustration } from '@/components/illustrations/ThinkTechIllustrations';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans">
      {/* Top navigation bar */}
      <header className="w-full border-b border-[#E5E7EB] bg-[#FFFFFF] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="font-extrabold text-xl tracking-tight text-[#111111]">
            THINKTECH Q&A
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-[#111111] border-b-2 border-[#1769D1] py-5">
              Home
            </Link>
            <Link href="/ask" className="text-sm font-medium text-[#687280] hover:text-[#111111] py-5 transition-colors">
              Ask
            </Link>
            <Link href="/moderator" className="text-sm font-medium text-[#687280] hover:text-[#111111] py-5 transition-colors">
              Moderator
            </Link>
            <Link href="/display" className="text-sm font-medium text-[#687280] hover:text-[#111111] py-5 transition-colors">
              Display
            </Link>
          </nav>
          
          <div className="flex items-center">
            <Link href="/display">
              <Button variant="primary" className="text-sm rounded-full px-5 py-2 h-auto font-medium">
                Go to Display
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 lg:px-12 py-12 md:py-24 flex flex-col">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24 mb-24">
          {/* Left column */}
          <div className="w-full md:w-[55%] flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#111111] leading-[1.1] tracking-tight">
              Live Q&A for<br />
              ThinkTech<br />
              Orientation.
            </h1>
            
            <div className="space-y-2 mt-2">
              <p className="text-lg font-semibold text-[#1769D1]">
                Ask. Explore. Build.
              </p>
              <p className="text-base text-[#687280] whitespace-pre-line leading-relaxed">
                Anonymous questions.{"\n"}
                Real conversations.
              </p>
            </div>
          </div>
          
          {/* Right column */}
          <div className="w-full md:w-[45%] flex justify-center md:justify-end">
            <HeroIllustration className="w-full max-w-[400px] h-auto" />
          </div>
        </div>

        {/* Three action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
          {/* Student Card */}
          <Link href="/ask" className="group block h-full">
            <Card variant="default" className="h-full p-8 flex flex-col items-start gap-4 hover:shadow-md hover:border-[#1769D1]/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#F5F6F7] flex items-center justify-center text-[#111111] group-hover:bg-[#1769D1]/10 group-hover:text-[#1769D1] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111111] mb-1">I&apos;m a Student</h3>
                <p className="text-sm text-[#687280]">Ask a question anonymously.</p>
              </div>
              <div className="mt-auto pt-4 self-end text-[#111111] opacity-50 group-hover:opacity-100 group-hover:text-[#1769D1] transition-all group-hover:translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Card>
          </Link>

          {/* Moderator Card */}
          <Link href="/moderator" className="group block h-full">
            <Card variant="default" className="h-full p-8 flex flex-col items-start gap-4 hover:shadow-md hover:border-[#1769D1]/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#F5F6F7] flex items-center justify-center text-[#111111] group-hover:bg-[#1769D1]/10 group-hover:text-[#1769D1] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111111] mb-1">I&apos;m a Moderator</h3>
                <p className="text-sm text-[#687280]">Manage and display questions.</p>
              </div>
              <div className="mt-auto pt-4 self-end text-[#111111] opacity-50 group-hover:opacity-100 group-hover:text-[#1769D1] transition-all group-hover:translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Card>
          </Link>

          {/* Display Card */}
          <Link href="/display" className="group block h-full">
            <Card variant="default" className="h-full p-8 flex flex-col items-start gap-4 hover:shadow-md hover:border-[#1769D1]/30 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#F5F6F7] flex items-center justify-center text-[#111111] group-hover:bg-[#1769D1]/10 group-hover:text-[#1769D1] transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#111111] mb-1">View Display</h3>
                <p className="text-sm text-[#687280]">Open the stage view for the audience.</p>
              </div>
              <div className="mt-auto pt-4 self-end text-[#111111] opacity-50 group-hover:opacity-100 group-hover:text-[#1769D1] transition-all group-hover:translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
