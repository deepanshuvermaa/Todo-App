import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const GlobalVoiceButton = () => {
  const navigate = useNavigate();
  const { addTask, addNote, addJournalEntry } = useAppStore();

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const recognition = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      // Setup speech recognition
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onstart = () => setIsListening(true);
      recognition.current.onend = () => setIsListening(false);

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processQuickCommand(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showQuickFeedback(`Error: ${event.error}`);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const processQuickCommand = async (text) => {
    const lowerText = text.toLowerCase();
    let response = '';

    try {
      // Quick task commands
      if (lowerText.includes('add task') || lowerText.includes('create task') || lowerText.includes('new task')) {
        const taskText = text.replace(/(add task|create task|new task)/i, '').trim();
        if (taskText) {
          await addTask(taskText);
          response = `✅ Task added: "${taskText}"`;
        } else {
          response = '❌ Please specify what task to add';
        }
      }

      // Quick note commands
      else if (lowerText.includes('add note') || lowerText.includes('create note') || lowerText.includes('new note')) {
        const noteText = text.replace(/(add note|create note|new note)/i, '').trim();
        if (noteText) {
          await addNote({
            title: noteText.split(' ').slice(0, 5).join(' '),
            content: noteText,
            folder: 'Voice Notes',
            tags: ['voice', 'quick']
          });
          response = `📝 Note created successfully`;
        } else {
          response = '❌ Please specify the note content';
        }
      }

      // Quick journal commands
      else if (lowerText.includes('journal') || lowerText.includes('diary')) {
        const journalText = text.replace(/(add to journal|create journal|journal|diary)/i, '').trim();
        if (journalText) {
          await addJournalEntry({
            date: new Date().toISOString().split('T')[0],
            content: journalText,
            mood: 'good',
            tags: ['voice', 'quick']
          });
          response = `📖 Journal entry added`;
        } else {
          response = '❌ Please specify the journal content';
        }
      }

      // Navigation commands
      else if (lowerText.includes('go to') || lowerText.includes('open') || lowerText.includes('show')) {
        if (lowerText.includes('task')) {
          navigate('/tasks');
          response = '📋 Opening tasks page';
        } else if (lowerText.includes('note')) {
          navigate('/notes');
          response = '📝 Opening notes page';
        } else if (lowerText.includes('journal')) {
          navigate('/journal');
          response = '📖 Opening journal page';
        } else if (lowerText.includes('dashboard')) {
          navigate('/');
          response = '📊 Opening dashboard';
        } else if (lowerText.includes('voice')) {
          navigate('/voice');
          response = '🎤 Opening voice commands';
        } else {
          response = '❌ Unknown page. Try "go to tasks" or "open notes"';
        }
      }

      // Help command
      else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
        navigate('/voice');
        response = '🎤 Opening voice commands help';
      }

      // Unknown command
      else {
        response = `🤔 Try "add task [text]", "create note [text]", or "go to [page]"`;
      }

    } catch (error) {
      response = `❌ Error: ${error.message}`;
    }

    showQuickFeedback(response);
  };

  const showQuickFeedback = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  };

  const startListening = () => {
    if (recognition.current && !isListening && isSupported) {
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <>
      <motion.button
        onClick={isListening ? stopListening : startListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-2 rounded-full transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg'
            : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
        }`}
        title={isListening ? 'Stop voice command' : 'Quick voice command'}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}

        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -inset-1 bg-red-400 rounded-full opacity-75"
          />
        )}
      </motion.button>

      {/* Quick Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-3 border border-gray-200 dark:border-gray-700 max-w-sm"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {feedbackMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalVoiceButton;