import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';
import {
  AmazingMoodIcon,
  GoodMoodIcon,
  OkayMoodIcon,
  BadMoodIcon,
  TerribleMoodIcon,
  SunnyIcon,
  CloudyIcon,
  RainyIcon,
  HabitIcon
} from '@/components/icons/Icons';

const JournalEntry = ({ entry, date, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    content: '',
    mood: '',
    weather: '',
    gratitude: ['', '', ''],
    goals: ['', '', ''],
    tags: [],
    highlights: '',
    challenges: '',
    lessons: '',
    tomorrowFocus: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const moods = [
    { value: 'amazing', icon: AmazingMoodIcon, label: 'Amazing' },
    { value: 'good', icon: GoodMoodIcon, label: 'Good' },
    { value: 'okay', icon: OkayMoodIcon, label: 'Okay' },
    { value: 'bad', icon: BadMoodIcon, label: 'Bad' },
    { value: 'terrible', icon: TerribleMoodIcon, label: 'Terrible' }
  ];

  const weatherOptions = [
    { value: 'sunny', icon: SunnyIcon, label: 'Sunny' },
    { value: 'cloudy', icon: CloudyIcon, label: 'Cloudy' },
    { value: 'rainy', icon: RainyIcon, label: 'Rainy' },
    { value: 'snowy', icon: CloudyIcon, label: 'Snowy' },
    { value: 'stormy', icon: RainyIcon, label: 'Stormy' }
  ];

  const prompts = [
    "What made you smile today?",
    "What challenged you today?",
    "What did you learn today?",
    "How did you grow today?",
    "What are you grateful for?",
    "Describe your day in three words.",
    "What would you do differently?",
    "What moment do you want to remember?",
    "How did you take care of yourself today?",
    "What inspired you today?"
  ];

  useEffect(() => {
    if (entry) {
      setFormData({
        content: entry.content || '',
        mood: entry.mood || '',
        weather: entry.weather || '',
        gratitude: entry.gratitude || ['', '', ''],
        goals: entry.goals || ['', '', ''],
        tags: entry.tags || [],
        highlights: entry.highlights || '',
        challenges: entry.challenges || '',
        lessons: entry.lessons || '',
        tomorrowFocus: entry.tomorrowFocus || ''
      });
    }
  }, [entry]);

  // Auto-save after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.content || formData.mood || formData.gratitude.some(g => g)) {
        handleSave(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleSave = async (showMessage = true) => {
    const dataToSave = {
      ...formData,
      date,
      updatedAt: new Date().toISOString()
    };

    await onSave(dataToSave);
    
    if (showMessage) {
      setAutoSaveStatus('Saved!');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };

  const handleGratitudeChange = (index, value) => {
    const newGratitude = [...formData.gratitude];
    newGratitude[index] = value;
    setFormData({ ...formData, gratitude: newGratitude });
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getRandomPrompt = () => {
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setFormData({ ...formData, content: formData.content + (formData.content ? '\n\n' : '') + prompt + '\n' });
  };

  const getWordCount = () => {
    return formData.content ? formData.content.split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {moods.map(mood => (
            <button
              key={mood.value}
              onClick={() => setFormData({ ...formData, mood: mood.value })}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all flex flex-col items-center ${
                formData.mood === mood.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <mood.icon className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Weather */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Today's Weather</label>
          <div className="flex gap-2">
            {weatherOptions.map(weather => (
              <button
                key={weather.value}
                onClick={() => setFormData({ ...formData, weather: weather.value })}
                className={`p-2 rounded-lg border ${
                  formData.weather === weather.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                title={weather.label}
              >
                <weather.icon className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Journal Entry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Today's Journal</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {getWordCount()} words
            </span>
            {autoSaveStatus && (
              <span className="text-sm text-green-600">{autoSaveStatus}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <button
            onClick={getRandomPrompt}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Need inspiration? Get a prompt →
          </button>

          <VoiceButton
            onResult={(transcript) => setFormData({ ...formData, content: formData.content + ' ' + transcript })}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-500"
            title="Voice Input"
          />
        </div>

        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg
                     bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2
                     focus:ring-blue-500 resize-none"
          rows="12"
          placeholder="Start writing about your day..."
        />
      </motion.div>

      {/* Gratitude */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🙏</span>
          <h3 className="text-lg font-semibold">Three Things I'm Grateful For</h3>
        </div>
        {[0, 1, 2].map(index => (
          <div key={index} className="mb-3">
            <input
              type="text"
              value={formData.gratitude[index]}
              onChange={(e) => handleGratitudeChange(index, e.target.value)}
              className="input-field"
              placeholder={`${index + 1}. I'm grateful for...`}
            />
          </div>
        ))}
      </motion.div>

      {/* Goals for Tomorrow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <HabitIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Tomorrow's Top 3 Goals</h3>
        </div>
        {[0, 1, 2].map(index => (
          <div key={index} className="mb-3">
            <input
              type="text"
              value={formData.goals[index]}
              onChange={(e) => handleGoalChange(index, e.target.value)}
              className="input-field"
              placeholder={`${index + 1}. Tomorrow I will...`}
            />
          </div>
        ))}
      </motion.div>

      {/* Reflection Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4">Daily Reflection</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Today's Highlights</label>
            <textarea
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              className="input-field"
              rows="2"
              placeholder="What were the best moments of your day?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Challenges Faced</label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="input-field"
              rows="2"
              placeholder="What obstacles did you overcome?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lessons Learned</label>
            <textarea
              value={formData.lessons}
              onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
              className="input-field"
              rows="2"
              placeholder="What did today teach you?"
            />
          </div>
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4">Tags</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="input-field flex-1"
            placeholder="Add a tag..."
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 hover:text-red-700 ml-1 text-lg leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => handleSave(true)}
          className="flex-1 btn-primary"
        >
          Save Entry
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Entry
          </button>
        )}
      </div>
    </div>
  );
};

export default JournalEntry;