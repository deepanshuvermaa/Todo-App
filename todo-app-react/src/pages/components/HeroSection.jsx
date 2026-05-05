import React from 'react';
import { ChevronRight } from 'lucide-react';
import LandingNavbar from './LandingNavbar';
import DashboardPreview from './DashboardPreview';

export default function HeroSection({ onLogin }) {
  return (
    <div className="relative w-full min-h-screen bg-[#d9d9d9] rounded-2xl sm:rounded-3xl">
      {/* Video container - clips the video to rounded corners */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay loop muted playsInline preload="auto"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* Content - NOT clipped */}
      <div className="relative z-10 pb-12 sm:pb-16">
        <LandingNavbar onLogin={onLogin} />

        <div className="flex flex-col items-center px-4 pt-10 sm:pt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px]">
            <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
            Life Productivity Suite
          </div>

          <h1 className="mt-5 sm:mt-6 text-neutral-900 max-w-4xl" style={{
            fontSize: 'clamp(36px, 8vw, 72px)', lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.02em'
          }}>
            Organize{' '}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>Everything</span>
            <br />in one place
          </h1>

          <p className="mt-4 sm:mt-6 text-neutral-700 px-2" style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
            15+ productivity tools. Tasks, expenses, habits, journal — all in one beautiful app.
          </p>

          <button onClick={onLogin}
            className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-[#0b0f1a] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] hover:bg-[#1a1f2e] transition">
            Get Started Free
            <span className="bg-white/15 rounded-full p-1.5"><ChevronRight size={16} /></span>
          </button>

          <DashboardPreview />
        </div>
      </div>
    </div>
  );
}
