import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';

const LogoSVG = () => {
  const petals = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const cx = 16 + 10 * Math.cos(angle);
    const cy = 16 + 10 * Math.sin(angle);
    petals.push(<circle key={i} cx={cx} cy={cy} r={3.5} fill="#ef4d23" />);
  }
  return (
    <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8">
      {petals}
      <circle cx={16} cy={16} r={3.5} fill="#ef4d23" />
    </svg>
  );
};

export default function LandingNavbar({ onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 relative z-10">
      <div className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center">
        {/* Logo */}
        <LogoSVG />

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-[14px] items-center ml-6">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />
            Home
          </span>
          <span className="text-neutral-600 cursor-pointer hover:text-black transition">Features</span>
          <span className="text-neutral-600 cursor-pointer hover:text-black transition">About</span>
          <span className="text-[#ef4d23] flex items-center gap-0.5 cursor-pointer">
            Pricing <ChevronDown size={14} />
          </span>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onLogin}
            className="bg-[#ef4d23] text-white rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 text-[13px] font-medium flex items-center gap-2 hover:bg-[#d9431d] transition"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
            <span className="bg-white/20 rounded-full p-1">
              <ChevronRight size={14} />
            </span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 text-neutral-600 hover:text-black"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-20 md:hidden">
            <div className="flex flex-col gap-2">
              <span className="px-3 py-2 text-sm font-medium rounded-lg bg-neutral-50">Home</span>
              <span className="px-3 py-2 text-sm text-neutral-600 rounded-lg hover:bg-neutral-50">Features</span>
              <span className="px-3 py-2 text-sm text-neutral-600 rounded-lg hover:bg-neutral-50">About</span>
              <span className="px-3 py-2 text-sm text-[#ef4d23] rounded-lg hover:bg-neutral-50">Pricing</span>
              <button
                onClick={onLogin}
                className="mt-1 bg-[#ef4d23] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#d9431d] transition"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
