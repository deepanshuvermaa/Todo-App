import React, { useState } from 'react';
import { supabaseService } from '../../services/SupabaseService';
import '@/styles/fonts.css';

export default function AuthModal({ onSuccess, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !passwordConfirm) {
      setError('Please fill all fields');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { user, error: signUpError } = await supabaseService.signUpWithEmail(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess('Account created! You can now sign in.');
    setTimeout(() => {
      setMode('login');
      setPassword('');
      setPasswordConfirm('');
      setSuccess('');
    }, 1500);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    const { user, error: signInError } = await supabaseService.signInWithEmail(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
      return;
    }

    if (user) {
      onSuccess(user);
    }
  };

  return (
    <div
      className="fixed inset-0 min-h-screen w-full flex items-center justify-center z-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Full-screen video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Back button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-20 text-white/80 hover:text-white flex items-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Centered login card */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20">
          {/* Logo */}
          <h1 className="text-4xl font-bold text-center mb-1 text-indigo-600">LIFE</h1>
          <p className="text-center text-gray-500 text-sm mb-8">Personal Productivity Suite</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 text-center font-semibold transition ${
                mode === 'login'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 pb-3 text-center font-semibold transition ${
                mode === 'signup'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition pr-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition pr-12"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswordConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm space-y-2 border border-red-100">
                <div className="font-semibold">{error}</div>
                {error.toLowerCase().includes('email') && (
                  <div className="text-xs opacity-90">
                    <strong>Tip:</strong> Check your email for confirmation link, or{' '}
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-red-600"
                    >
                      disable email confirmation
                    </a>{' '}
                    in Supabase settings
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Bottom secure text */}
        <p className="text-center text-sm text-white/70 mt-6">
          Your data is encrypted and synced securely
        </p>
      </div>
    </div>
  );
}
