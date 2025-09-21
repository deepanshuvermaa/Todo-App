import React from 'react';

// Icon components with interactive hover effects
export const TaskIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

export const AddIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export const MoneyIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

export const NoteIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export const MealIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5L3 3m4 10l-2 9m0 0h5m-5 0l2-2.5M17 22l2-2.5M17 22h-5m5 0l-2-9" />
  </svg>
);

export const JournalIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export const HabitIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const CaloriesIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </svg>
);

export const ReminderIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM2 3h20v6H2V3zm3 8h10v2H5v-2zm0 4h8v2H5v-2z" />
  </svg>
);

export const DreamIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

export const CheckIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const GreetingIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

// Mood Icons
export const AmazingMoodIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} transition-all hover:scale-110 hover:rotate-12`} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#10B981" />
    <circle cx="9" cy="9" r="1.5" fill="white" />
    <circle cx="15" cy="9" r="1.5" fill="white" />
    <path d="M7 13.5c0 2.5 2.25 4.5 5 4.5s5-2 5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const GoodMoodIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} transition-all hover:scale-110 hover:rotate-6`} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#3B82F6" />
    <circle cx="9" cy="9" r="1.5" fill="white" />
    <circle cx="15" cy="9" r="1.5" fill="white" />
    <path d="M8 14c0 2 1.8 3 4 3s4-1 4-3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const OkayMoodIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} transition-all hover:scale-110`} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#6B7280" />
    <circle cx="9" cy="9" r="1.5" fill="white" />
    <circle cx="15" cy="9" r="1.5" fill="white" />
    <line x1="8" y1="15" x2="16" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const BadMoodIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} transition-all hover:scale-110 hover:rotate-3`} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#F59E0B" />
    <circle cx="9" cy="9" r="1.5" fill="white" />
    <circle cx="15" cy="9" r="1.5" fill="white" />
    <path d="M8 16c0-2 1.8-3 4-3s4 1 4 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

export const TerribleMoodIcon = ({ className = "w-8 h-8", color = "currentColor" }) => (
  <svg className={`${className} transition-all hover:scale-110 hover:rotate-6`} fill={color} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#EF4444" />
    <circle cx="9" cy="9" r="1.5" fill="white" />
    <circle cx="15" cy="9" r="1.5" fill="white" />
    <path d="M8 17c0-2.5 1.8-4 4-4s4 1.5 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// Weather Icons
export const SunnyIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110 hover:rotate-45`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <circle cx="12" cy="12" r="5" fill="#F59E0B" />
    <line x1="12" y1="1" x2="12" y2="3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CloudyIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" fill="#9CA3AF" />
  </svg>
);

export const RainyIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 19l-3-3h6l-3 3zM12 19l-3-3h6l-3 3zM16 19l-3-3h6l-3 3z" fill="#3B82F6" />
    <ellipse cx="12" cy="8" rx="6" ry="4" fill="#9CA3AF" />
  </svg>
);

// Special interactive icons
export const InteractiveTaskIcon = ({ className = "w-6 h-6", isCompleted = false }) => (
  <div className={`${className} cursor-pointer transition-all duration-300 hover:scale-125 ${isCompleted ? 'text-green-500 animate-pulse' : 'text-blue-500'}`}>
    {isCompleted ? <CheckIcon className={className} /> : <TaskIcon className={className} />}
  </div>
);

export const PulsingAddIcon = ({ className = "w-6 h-6" }) => (
  <div className={`${className} animate-pulse hover:animate-bounce transition-transform cursor-pointer`}>
    <AddIcon className={className} />
  </div>
);

export const RotatingMoodIcon = ({ mood, className = "w-8 h-8" }) => {
  const moodIcons = {
    amazing: AmazingMoodIcon,
    good: GoodMoodIcon,
    okay: OkayMoodIcon,
    bad: BadMoodIcon,
    terrible: TerribleMoodIcon
  };

  const IconComponent = moodIcons[mood] || OkayMoodIcon;
  return <IconComponent className={className} />;
};

// Additional icons for sidebar
export const DashboardIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v4" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
  </svg>
);

export const VoiceIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export const TextExtractIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const LinkIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

export const HistoryIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const AboutIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const SettingsIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110 hover:rotate-12`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const GoogleIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} viewBox="0 0 24 24" fill={color}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const SignOutIcon = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg className={`${className} transition-transform hover:scale-110`} fill="none" viewBox="0 0 24 24" stroke={color}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);