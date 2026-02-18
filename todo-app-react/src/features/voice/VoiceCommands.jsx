import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAppStore from '@/store/useAppStore';

const VoiceCommands = () => {
  const navigate = useNavigate();
  const { addTask, addNote, addJournalEntry } = useAppStore();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [command, setCommand] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);

  const recognition = useRef(null);
  const synth = useRef(null);
  // Keep a stable ref to processCommand so the onresult handler always calls the latest version
  const processCommandRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);

      // Setup speech recognition
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onstart = () => setIsListening(true);
      recognition.current.onend = () => setIsListening(false);

      recognition.current.onresult = (event) => {
        const heard = event.results[0][0].transcript;
        setTranscript(heard);
        // Use the ref so we always call the latest processCommand (avoids stale closure)
        if (processCommandRef.current) processCommandRef.current(heard);
      };

      recognition.current.onerror = (event) => {
        if (event.error === 'no-speech') return; // not a real error — user just didn't speak
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResult(`Error: ${event.error}`);
      };

      synth.current = SpeechSynthesis;
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const speak = (text) => {
    if (synth.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      synth.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition.current && !isListening) {
      recognition.current.start();
      setTranscript('');
      setResult('');
    }
  };

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
  };

  const processCommand = useCallback(async (text) => {
    const lowerText = text.toLowerCase();
    let response = '';
    let action = '';

    try {
      // Task commands
      if (lowerText.includes('add task') || lowerText.includes('create task') || lowerText.includes('new task')) {
        const taskText = text.replace(/(add task|create task|new task)/i, '').trim();
        if (taskText) {
          await addTask(taskText);
          response = `Task "${taskText}" added successfully!`;
          action = 'Task Added';
        } else {
          response = 'Please specify what task to add.';
        }
      }

      // Note commands
      else if (lowerText.includes('add note') || lowerText.includes('create note') || lowerText.includes('new note')) {
        const noteText = text.replace(/(add note|create note|new note)/i, '').trim();
        if (noteText) {
          await addNote({
            title: noteText.split(' ').slice(0, 5).join(' '),
            content: noteText,
            folder: 'Voice Notes',
            tags: ['voice']
          });
          response = `Note created successfully!`;
          action = 'Note Added';
        } else {
          response = 'Please specify the note content.';
        }
      }

      // Journal commands
      else if (lowerText.includes('journal') || lowerText.includes('diary')) {
        const journalText = text.replace(/(add to journal|create journal|journal|diary)/i, '').trim();
        if (journalText) {
          await addJournalEntry({
            date: new Date().toISOString().split('T')[0],
            content: journalText,
            mood: 'good',
            tags: ['voice']
          });
          response = `Journal entry added successfully!`;
          action = 'Journal Added';
        } else {
          response = 'Please specify the journal content.';
        }
      }

      // Navigation commands
      else if (lowerText.includes('go to') || lowerText.includes('open') || lowerText.includes('show')) {
        if (lowerText.includes('task')) {
          navigate('/tasks');
          response = 'Opening tasks page.';
          action = 'Navigation';
        } else if (lowerText.includes('note')) {
          navigate('/notes');
          response = 'Opening notes page.';
          action = 'Navigation';
        } else if (lowerText.includes('journal')) {
          navigate('/journal');
          response = 'Opening journal page.';
          action = 'Navigation';
        } else if (lowerText.includes('dashboard')) {
          navigate('/');
          response = 'Opening dashboard.';
          action = 'Navigation';
        } else if (lowerText.includes('settings')) {
          navigate('/settings');
          response = 'Opening settings.';
          action = 'Navigation';
        }
      }

      // Help command
      else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
        response = 'I can help you add tasks, create notes, write journal entries, and navigate the app. Try saying "add task call mom" or "create note meeting notes".';
        action = 'Help';
      }

      // Unknown command
      else {
        response = `I heard "${text}" but I'm not sure what to do with that. Try "add task", "create note", "journal", or "help".`;
        action = 'Unknown';
      }

    } catch (error) {
      response = `Error processing command: ${error.message}`;
      action = 'Error';
    }

    setResult(response);
    speak(response);

    // Add to history
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      command: text,
      action,
      response
    };

    setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTask, addNote, addJournalEntry, navigate]);

  // Keep the ref in sync so the speech recognition onresult always uses the latest version
  processCommandRef.current = processCommand;

  const processTextCommand = () => {
    if (command.trim()) {
      processCommand(command);
      setCommand('');
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const commands = [
    { text: 'Add task buy groceries', description: 'Creates a new task' },
    { text: 'Create note meeting summary', description: 'Creates a new note' },
    { text: 'Journal had a great day today', description: 'Adds journal entry' },
    { text: 'Go to tasks', description: 'Navigate to tasks page' },
    { text: 'Open notes', description: 'Navigate to notes page' },
    { text: 'Show dashboard', description: 'Navigate to dashboard' },
    { text: 'Help', description: 'Shows available commands' }
  ];

  if (!isSupported) {
    return (
      <div className="voice-commands max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">Voice Commands Not Supported</h2>
          <p className="text-red-700">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-commands max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎤 Voice Commands
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control your app with voice commands. Add tasks, create notes, and navigate hands-free.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Input Section */}
        <div className="space-y-6">
          {/* Voice Recorder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Voice Input</h2>

            <div className="text-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isListening ? '🔴' : '🎤'}
              </motion.button>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {isListening ? 'Listening... Click to stop' : 'Click to start voice input'}
              </p>
            </div>

            {transcript && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">You said:</p>
                <p className="font-medium">{transcript}</p>
              </div>
            )}

            {result && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Response:</p>
                <p className="font-medium">{result}</p>
              </div>
            )}
          </div>

          {/* Text Input Alternative */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Or Type a Command</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processTextCommand()}
                placeholder="Type a command..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
              <button
                onClick={processTextCommand}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Commands & History Section */}
        <div className="space-y-6">
          {/* Available Commands */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Available Commands</h3>
            <div className="space-y-3">
              {commands.map((cmd, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    "{cmd.text}"
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {cmd.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Command History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Command History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No commands yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.action === 'Error' ? 'bg-red-100 text-red-700' :
                        item.action === 'Task Added' ? 'bg-green-100 text-green-700' :
                        item.action === 'Note Added' ? 'bg-blue-100 text-blue-700' :
                        item.action === 'Journal Added' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.action}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{item.command}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.response}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommands;