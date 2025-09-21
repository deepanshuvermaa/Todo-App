import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const VoiceButton = ({ onResult, placeholder = "Click to speak...", className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognition.current = new SpeechRecognition();

      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onstart = () => {
        setIsListening(true);
      };

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [onResult]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleListening}
      disabled={!isSupported}
      className={`voice-button ${isListening ? 'listening' : ''} ${className}`}
      title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
    >
      <motion.div
        animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </motion.div>

      {isListening && (
        <span className="ml-2 text-sm">Listening...</span>
      )}
    </motion.button>
  );
};

export default VoiceButton;