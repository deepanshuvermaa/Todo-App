import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ScreenshotCapture = ({ onCapture, className = "" }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const captureScreen = async () => {
    try {
      setIsCapturing(true);

      // Check if screen capture is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Screen capture is not supported in your browser');
        setIsSupported(false);
        setIsCapturing(false);
        return;
      }

      // Get screen stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false
      });

      // Create video element to capture frame
      const video = videoRef.current;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
        video.play();
      });

      // Wait a moment for video to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture frame to canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onCapture(url, blob);
        }
      }, 'image/png');

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

    } catch (error) {
      console.error('Screen capture error:', error);
      if (error.name === 'NotAllowedError') {
        alert('Screen capture permission denied');
      } else {
        alert('Failed to capture screen');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`screenshot-capture ${className}`}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={captureScreen}
        disabled={isCapturing}
        className={`screenshot-button ${isCapturing ? 'capturing' : ''}`}
        title="Capture screenshot"
      >
        <motion.div
          animate={isCapturing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1, repeat: isCapturing ? Infinity : 0, ease: "linear" }}
        >
          {isCapturing ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </motion.div>

        {isCapturing && (
          <span className="ml-2 text-sm">Capturing...</span>
        )}
      </motion.button>

      {/* Hidden video and canvas elements for capture */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        muted
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ScreenshotCapture;