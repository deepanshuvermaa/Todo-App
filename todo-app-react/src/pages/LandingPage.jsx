import React from 'react';
import '@/styles/fonts.css';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';

export default function LandingPage({ onLogin }) {
  return (
    <div
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <HeroSection onLogin={onLogin} />
      <FeaturesSection />
    </div>
  );
}
