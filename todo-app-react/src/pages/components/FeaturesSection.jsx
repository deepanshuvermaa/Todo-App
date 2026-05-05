import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, Mic, Plus } from 'lucide-react';

function AnimatedCard({ children, index = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-neutral-200 text-[13px] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
          Why Life App?
        </div>
        <h2
          className="text-neutral-900"
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            lineHeight: 1.1,
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          Everything you need,
          <br />
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontWeight: 400,
            }}
          >
            nothing
          </span>{' '}
          you don't
        </h2>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Productivity Hub */}
        <AnimatedCard index={0} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-sm">Your Productivity Hub</h3>
            <button className="text-xs text-neutral-400 border border-neutral-200 rounded-lg px-2 py-1">
              Customize
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-[48px] font-bold text-[#ef4d23]">92%</div>
            <p className="text-xs text-neutral-500 mt-1">Efficiency Score</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <div className="text-sm font-semibold">15+</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Tools</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <div className="text-sm font-semibold">Offline</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">First</div>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3 text-center">
              <div className="text-sm font-semibold">Cloud</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Sync</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Middle Column - Feature Showcase */}
        <div className="flex flex-col gap-4">
          <AnimatedCard index={1} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-sm">Task Manager</h3>
              <span className="bg-[#ef4d23]/10 text-[#ef4d23] text-[10px] font-medium px-2 py-0.5 rounded-full">Session</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Priority levels</span>
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Due dates</span>
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Recurring</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Smart organization for everything in your life</p>
            <button className="text-[#ef4d23] text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Explore <ChevronRight size={12} />
            </button>
          </AnimatedCard>

          <AnimatedCard index={2} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex-1">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-sm">Expense Tracker</h3>
              <span className="bg-[#ef4d23]/10 text-[#ef4d23] text-[10px] font-medium px-2 py-0.5 rounded-full">Action</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Categories</span>
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Budget tracking</span>
              <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-lg">Analytics</span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">Financial clarity at your fingertips</p>
            <button className="text-[#ef4d23] text-xs font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Try it <ChevronRight size={12} />
            </button>
          </AnimatedCard>
        </div>

        {/* Right Column - Quick Actions */}
        <AnimatedCard index={3} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-sm">Quick Actions</h3>
            <button className="text-[#ef4d23] text-xs font-medium flex items-center gap-0.5">
              <Plus size={12} /> Add Feature
            </button>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {[
              'Track habits and build streaks daily',
              'Capture thoughts in your daily journal',
              'Extract text from images with OCR',
              'Set alarms and never miss a beat',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 rounded-xl text-xs text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                <span>{item}</span>
                <ChevronRight size={12} className="text-neutral-400 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Voice input */}
          <div className="bg-[#ef4d23]/5 rounded-xl p-4 border border-[#ef4d23]/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#ef4d23] flex items-center justify-center flex-shrink-0">
                <Mic size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-800">Speak to add tasks!</p>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[3, 5, 8, 4, 7, 5, 3, 6, 8, 5, 4, 6].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-[#ef4d23]/60"
                      style={{ height: `${h * 2}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </section>
  );
}
