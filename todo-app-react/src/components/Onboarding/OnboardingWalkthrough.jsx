import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const OnboardingWalkthrough = ({ onComplete }) => {
  const { signInToGoogle } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);

  useEffect(() => {
    // Check if user has seen walkthrough
    const seen = localStorage.getItem('onboarding_completed');
    if (seen) {
      setHasSeenWalkthrough(true);
      onComplete();
    }
  }, []);

  const slides = [
    {
      id: 1,
      title: "Your Life, Organized",
      subtitle: "One App for Everything",
      description: "Manage tasks, expenses, habits, meals, and more - all in one beautiful, voice-enabled app",
      features: [
        { icon: "🎯", text: "Smart Task Management" },
        { icon: "🎤", text: "Voice Commands Everything" },
        { icon: "📊", text: "Visual Analytics Dashboard" },
        { icon: "🔄", text: "Automatic Google Sheets Sync" }
      ],
      visual: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-3xl blur-3xl opacity-60"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-3 gap-4">
                {['✅', '💰', '📝', '🎯', '🍽️', '⏰'].map((emoji, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ),
      cta: {
        text: "Get Started",
        action: () => setCurrentSlide(1)
      }
    },
    {
      id: 2,
      title: "Your Data, Your Control",
      subtitle: "Privacy-First Design",
      description: "Connect your Google account for automatic backups or use locally - you're always in control",
      features: [
        { icon: "🔒", text: "End-to-end encryption" },
        { icon: "☁️", text: "Optional cloud sync" },
        { icon: "📱", text: "Works offline" },
        { icon: "🛡️", text: "Your data stays yours" }
      ],
      visual: (
        <div className="relative w-full h-64 flex items-center justify-center">
          <motion.div className="relative">
            {/* Google Sheets Integration Visual */}
            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-center space-x-8">
                {/* App Icon */}
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    LIFE
                  </div>
                </div>

                {/* Sync Animation */}
                <motion.div
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.div>

                {/* Google Sheets Icon */}
                <div className="relative">
                  <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M10,11H7V13H10V11M17,11H10V13H17V11M17,15H7V17H17V15Z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center justify-center space-x-2 text-green-600 dark:text-green-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Secure & Private</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      ),
      cta: {
        text: "Start Free",
        action: () => {
          localStorage.setItem('onboarding_completed', 'true');
          onComplete();
        }
      },
      secondaryCta: {
        text: "Connect Google",
        action: async () => {
          await signInToGoogle();
          localStorage.setItem('onboarding_completed', 'true');
          onComplete();
        }
      }
    }
  ];

  const currentSlideData = slides[currentSlide];

  if (hasSeenWalkthrough) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center p-4"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full opacity-5"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, Math.random() + 0.5],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative max-w-4xl w-full"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="p-8 md:p-12">
              {/* Skip Button */}
              <button
                onClick={() => {
                  localStorage.setItem('onboarding_completed', 'true');
                  onComplete();
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Skip
              </button>

              {/* Slide Number */}
              <div className="text-center mb-8">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {currentSlide + 1} of {slides.length}
                </span>
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                {currentSlideData.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-center text-gray-600 dark:text-gray-400 mb-4"
              >
                {currentSlideData.subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
              >
                {currentSlideData.description}
              </motion.p>

              {/* Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                {currentSlideData.visual}
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {currentSlideData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.text}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={currentSlideData.cta.action}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {currentSlideData.cta.text}
                </button>

                {currentSlideData.secondaryCta && (
                  <button
                    onClick={currentSlideData.secondaryCta.action}
                    className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {currentSlideData.secondaryCta.text}
                  </button>
                )}
              </motion.div>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-white'
                    : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingWalkthrough;