import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StorageAdapter from '@/core/storage/StorageAdapter';
import AuthModal from '@/features/auth/AuthModal';

const storage = new StorageAdapter();

const OnboardingWalkthrough = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if onboarding already completed
  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await storage.get('onboarding_completed');
      if (completed) {
        setHasCompleted(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleSkip = async () => {
    await storage.set('onboarding_completed', true);
    if (onComplete) onComplete();
  };

  const handleAuthSuccess = async () => {
    await storage.set('onboarding_completed', true);
    if (onComplete) onComplete();
  };

  if (hasCompleted || showAuth) {
    return showAuth ? (
      <AuthModal onSuccess={handleAuthSuccess} />
    ) : null;
  }

  const slides = [
    {
      title: 'Welcome to LIFE',
      subtitle: 'Your Personal Productivity Hub',
      icon: '🎯',
      description: 'Everything you need to organize your life in one beautiful app',
      features: [
        { icon: '✓', text: 'Tasks & Goal Tracking' },
        { icon: '✓', text: 'Habit Building' },
        { icon: '✓', text: 'Smart Sync Across Devices' }
      ],
      buttons: [
        { label: 'Get Started', action: () => setCurrentSlide(1), primary: true },
        { label: 'Skip', action: handleSkip, secondary: true }
      ]
    },
    {
      title: 'Your Data, Always Synced',
      subtitle: 'Access everywhere, offline-first',
      icon: '☁️',
      description: 'All your data is encrypted and synced in real-time across your devices',
      features: [
        { icon: '🔒', text: 'End-to-end Encrypted' },
        { icon: '⚡', text: 'Instant Cross-Device Sync' },
        { icon: '📵', text: 'Works Offline' }
      ],
      buttons: [
        { label: 'Create Account', action: () => setShowAuth(true), primary: true },
        { label: 'Skip for Now', action: handleSkip, secondary: true }
      ]
    },
    {
      title: 'Smart Features',
      subtitle: 'Everything at your fingertips',
      icon: '⭐',
      description: 'Voice commands, OCR, habit tracking, and intelligent insights',
      features: [
        { icon: '🎤', text: 'Voice Commands' },
        { icon: '📸', text: 'OCR Text Recognition' },
        { icon: '📊', text: 'Smart Analytics' }
      ],
      buttons: [
        { label: 'Start Using LIFE', action: handleSkip, primary: true }
      ]
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-600 via-indigo-500 to-purple-600 z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header with Icon */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-12 text-center">
              <div className="text-6xl mb-4 animate-bounce">{slide.icon}</div>
              <h1 className="text-3xl font-bold text-white mb-2">{slide.title}</h1>
              <p className="text-indigo-100 text-lg">{slide.subtitle}</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8 space-y-6">
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed">
                {slide.description}
              </p>

              {/* Features List */}
              <div className="space-y-3">
                {slide.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 pt-4">
                {slides.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'bg-indigo-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 w-2'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                {slide.buttons.map((button, idx) => (
                  <motion.button
                    key={idx}
                    onClick={button.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      button.primary
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {button.label}
                  </motion.button>
                ))}
              </div>

              {/* Tips */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                {currentSlide === 1 && (
                  <p>💡 You can sign in later in Settings</p>
                )}
                {currentSlide === 2 && (
                  <p>✨ All features work offline and sync automatically</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingWalkthrough;
