import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ChevronRight, Mic, Plus, CheckCircle2, Wallet, BookOpen,
  Target, UtensilsCrossed, Clock, Film, Phone, MapPin,
  Camera, Link2, BarChart3, Shield, Wifi, WifiOff, Zap,
  Star, Users, Globe, Sparkles
} from 'lucide-react';

function AnimatedCard({ children, index = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={className}
    >{children}</motion.div>
  );
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className={className}
    >{children}</motion.div>
  );
}

const allTools = [
  { icon: CheckCircle2, name: 'Task Manager', desc: 'Organize tasks with priorities, due dates & recurring schedules', color: '#ef4d23' },
  { icon: Wallet, name: 'Expense Tracker', desc: 'Track spending with categories, budgets & date range analytics', color: '#3b82f6' },
  { icon: BookOpen, name: 'Notes', desc: 'Rich text notes with blocks \u2014 paragraphs, headings, lists & more', color: '#8b5cf6' },
  { icon: Target, name: 'Habit Tracker', desc: 'Build daily streaks and visualize your consistency over time', color: '#10b981' },
  { icon: UtensilsCrossed, name: 'Meal Tracker', desc: 'Log meals with calories and nutrition tracking', color: '#f59e0b' },
  { icon: Clock, name: 'Alarms', desc: 'Set alarms and timers right from your productivity hub', color: '#ef4444' },
  { icon: Film, name: 'Movie List', desc: 'Track movies to watch and get smart recommendations', color: '#ec4899' },
  { icon: Phone, name: 'Call Reminders', desc: 'Never forget to call someone important again', color: '#06b6d4' },
  { icon: BookOpen, name: 'Daily Journal', desc: 'Capture your thoughts, reflections & daily wins', color: '#84cc16' },
  { icon: Star, name: 'Bucket List', desc: 'Dream big \u2014 track life goals and mark them complete', color: '#f97316' },
  { icon: Mic, name: 'Voice Commands', desc: 'Add tasks, expenses & notes just by speaking', color: '#6366f1' },
  { icon: Camera, name: 'OCR Extract', desc: 'Extract text from images using Tesseract.js', color: '#14b8a6' },
  { icon: Link2, name: 'Link Manager', desc: 'Save, organize and access important links', color: '#a855f7' },
  { icon: BarChart3, name: 'Dashboard', desc: 'See everything at a glance \u2014 stats, streaks & progress', color: '#0ea5e9' },
  { icon: MapPin, name: 'Location Reminders', desc: 'Get reminded based on where you are', color: '#e11d48' },
];

const stats = [
  { number: '15+', label: 'Productivity Tools' },
  { number: '100%', label: 'Free to Use' },
  { number: '50MB+', label: 'Offline Storage' },
  { number: '0', label: 'Ads Ever' },
];

export default function FeaturesSection() {
  const [activeToolIndex, setActiveToolIndex] = useState(null);

  return (
    <div className="relative">
      {/* Gradient background that continues the hero feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f4f8] via-[#f0f7fa] to-white" />

      <div className="relative">
        {/* ===== SECTION A: FEATURES ===== */}
        <section id="features" className="w-full max-w-7xl mx-auto pt-20 sm:pt-28 pb-16 px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-neutral-200 text-[13px] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
              Why Life App?
            </div>
            <h2 className="text-neutral-900" style={{
              fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.02em'
            }}>
              Everything you need,<br />
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>nothing</span>{' '}you don't
            </h2>
            <p className="mt-4 text-neutral-500 max-w-lg mx-auto" style={{ fontSize: 'clamp(13px, 3vw, 16px)' }}>
              One app to replace ten. Stop switching between apps — manage your entire life from a single, beautiful dashboard.
            </p>
          </AnimatedSection>

          {/* 3-column feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left - Productivity Hub */}
            <AnimatedCard index={0} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm">Your Productivity Hub</h3>
                <span className="text-xs text-neutral-400 border border-neutral-200 rounded-lg px-2 py-1">Customize</span>
              </div>
              <div className="text-center mb-6">
                <div className="text-[48px] font-bold text-[#ef4d23]">92%</div>
                <p className="text-xs text-neutral-500 mt-1">Efficiency Score</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{n:'15+',l:'Tools'},{n:'Offline',l:'First'},{n:'Cloud',l:'Sync'}].map(({n,l}) => (
                  <div key={l} className="bg-neutral-50 rounded-xl p-3 text-center">
                    <div className="text-sm font-semibold">{n}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Middle - Feature cards */}
            <div className="flex flex-col gap-4">
              <AnimatedCard index={1} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-sm">Task Manager</h3>
                  <span className="bg-[#ef4d23]/10 text-[#ef4d23] text-[10px] font-medium px-2 py-0.5 rounded-full">Session</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Priority levels', 'Due dates', 'Recurring'].map(t => (
                    <span key={t} className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mb-4">Smart organization for everything in your life</p>
                <span className="text-[#ef4d23] text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={12} />
                </span>
              </AnimatedCard>

              <AnimatedCard index={2} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-sm">Expense Tracker</h3>
                  <span className="bg-[#ef4d23]/10 text-[#ef4d23] text-[10px] font-medium px-2 py-0.5 rounded-full">Action</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Categories', 'Budget tracking', 'Analytics'].map(t => (
                    <span key={t} className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mb-4">Financial clarity at your fingertips</p>
                <span className="text-[#ef4d23] text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Try it <ChevronRight size={12} />
                </span>
              </AnimatedCard>
            </div>

            {/* Right - Quick Actions */}
            <AnimatedCard index={3} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-sm">Quick Actions</h3>
                <span className="text-[#ef4d23] text-xs font-medium flex items-center gap-0.5"><Plus size={12} /> Add Feature</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {['Track habits and build streaks daily','Capture thoughts in your daily journal','Extract text from images with OCR','Set alarms and never miss a beat'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-700 hover:bg-neutral-100 transition cursor-pointer group">
                    <span>{item}</span>
                    <ChevronRight size={12} className="text-neutral-400 group-hover:text-[#ef4d23] transition flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div className="bg-[#ef4d23]/5 rounded-xl p-4 border border-[#ef4d23]/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ef4d23] flex items-center justify-center flex-shrink-0">
                    <Mic size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-800">Speak to add tasks!</p>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[3,5,8,4,7,5,3,6,8,5,4,6].map((h,i) => (
                        <div key={i} className="w-1 rounded-full bg-[#ef4d23]/60" style={{height:`${h*2}px`}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </section>

        {/* ===== STATS BAR ===== */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <AnimatedSection>
            <div className="bg-[#0b0f1a] rounded-2xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{s.number}</div>
                  <div className="text-xs sm:text-sm text-neutral-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* ===== SECTION B: ALL TOOLS GRID ===== */}
        <section className="w-full max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-neutral-200 text-[13px] mb-6">
              <Sparkles size={14} className="text-[#ef4d23]" />
              All-in-One Suite
            </div>
            <h2 className="text-neutral-900" style={{
              fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.02em'
            }}>
              15+ tools,{' '}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>one</span> app
            </h2>
            <p className="mt-4 text-neutral-500 max-w-md mx-auto text-sm">
              Every tool you need to manage your personal and professional life, beautifully integrated.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {allTools.map((tool, i) => (
              <AnimatedCard key={tool.name} index={i} className="group">
                <div
                  className={`bg-white rounded-xl border border-neutral-200 p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer ${activeToolIndex === i ? 'ring-2 ring-[#ef4d23]/30 border-[#ef4d23]/30' : ''}`}
                  onClick={() => setActiveToolIndex(activeToolIndex === i ? null : i)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tool.color}15` }}>
                      <tool.icon size={20} style={{ color: tool.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-neutral-900">{tool.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{tool.desc}</p>
                    </div>
                    <ChevronRight size={14} className="text-neutral-300 group-hover:text-[#ef4d23] transition mt-0.5 flex-shrink-0" />
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ===== SECTION C: ABOUT ===== */}
        <section id="about" className="w-full max-w-5xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-[#0b0f1a] to-[#1e293b] rounded-2xl p-8 sm:p-12 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-[13px] text-white/80 mb-6">
                <Globe size={14} />
                About Life App
              </div>
              <h2 className="text-white mb-4" style={{
                fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1.15, fontWeight: 500, letterSpacing: '-0.02em'
              }}>
                Built for people who want to{' '}
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>do more</span>
              </h2>
              <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                Life App was born from a simple frustration: too many apps for too many things.
                We built one beautiful, offline-first PWA that handles tasks, expenses, habits, journal,
                notes, and 10+ more tools — all synced to the cloud, all in your pocket.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: WifiOff, title: 'Offline First', desc: 'Works without internet. Syncs when you\'re back online.' },
                  { icon: Shield, title: 'Privacy Focused', desc: 'Your data is encrypted and only accessible by you.' },
                  { icon: Zap, title: 'Lightning Fast', desc: 'PWA technology means instant load times, every time.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <item.icon size={20} className="text-[#ef4d23] mb-2" />
                    <h4 className="text-white text-sm font-medium mb-1">{item.title}</h4>
                    <p className="text-neutral-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== SECTION D: PRICING ===== */}
        <section id="pricing" className="w-full max-w-4xl mx-auto py-16 sm:py-20 px-4 sm:px-6">
          <AnimatedSection className="text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-neutral-200 text-[13px] mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Pricing
            </div>
            <h2 className="text-neutral-900 mb-4" style={{
              fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.02em'
            }}>
              Free.{' '}
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>Seriously.</span>
            </h2>
            <p className="text-neutral-500 max-w-md mx-auto text-sm sm:text-base mb-8">
              Life App is completely free to use right now. All 15+ tools, unlimited data, cloud sync — no credit card, no trial, no catch.
            </p>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 max-w-md mx-auto">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl sm:text-5xl font-bold text-[#ef4d23]">{'\u20B9'}0</span>
                <span className="text-neutral-400 text-sm">/forever</span>
              </div>
              <p className="text-neutral-500 text-sm mb-6">All features included. No limits.</p>
              <div className="space-y-3 text-left mb-6">
                {[
                  '15+ productivity tools',
                  'Unlimited tasks, expenses & notes',
                  'Cloud sync across devices',
                  'Offline-first PWA',
                  'Voice commands & OCR',
                  'Daily journal & habit tracking',
                  'Export your data anytime',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400 pt-4 border-t border-neutral-100">
                Premium plans with team features & advanced analytics coming soon. Early users get locked-in benefits.
              </p>
            </div>
          </AnimatedSection>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">&copy; 2026 Life App. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="hover:text-neutral-700 cursor-pointer">Privacy</span>
              <span className="hover:text-neutral-700 cursor-pointer">Terms</span>
              <span className="hover:text-neutral-700 cursor-pointer">Contact</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
