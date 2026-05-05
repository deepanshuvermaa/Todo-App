import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

const OCRCapture = ({ onTextExtracted, className = '' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('eng');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const languages = {
    eng: 'English',
    fra: 'French',
    deu: 'German',
    spa: 'Spanish',
    ita: 'Italian',
    por: 'Portuguese',
    rus: 'Russian',
    jpn: 'Japanese',
    kor: 'Korean',
    ara: 'Arabic',
    hin: 'Hindi',
    zho: 'Chinese'
  };

  // Process image with real Tesseract.js
  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedText('');

    try {
      const worker = await Tesseract.createWorker();

      // Set up progress callback
      await worker.load();
      await worker.loadLanguage(selectedLanguage);
      await worker.initialize(selectedLanguage);

      const result = await worker.recognize(imageSrc, selectedLanguage, {
        logger: (m) => {
          if (m.status === 'recognizing') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      const conf = result.data.confidence;

      setExtractedText(text);
      setConfidence(conf);
      setProgress(100);

      // Call parent callback
      if (onTextExtracted) {
        onTextExtracted(text, conf);
      }

      await worker.terminate();
    } catch (error) {
      console.error('OCR processing error:', error);
      setExtractedText(`Error: ${error.message}`);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target?.result;
      setPreviewImage(imageSrc);
      setShowPreview(true);
      processImage(imageSrc);
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Create video element for preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      video.play();

      // Wait for video to load, then capture
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg');

        // Stop camera stream
        stream.getTracks().forEach((track) => track.stop());

        setPreviewImage(imageSrc);
        setShowPreview(true);
        processImage(imageSrc);
      }, 1000);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Language Selection - Compact on mobile */}
      <div className="hidden md:block">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          OCR Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={isProcessing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Language Selector */}
      <div className="md:hidden">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          disabled={isProcessing}
          className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-xs dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Options - Stack on mobile */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
        >
          📤 Upload
        </button>
        <button
          onClick={handleCameraCapture}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
        >
          📷 Photo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Progress Bar */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Processing: {progress}%
          </p>
        </div>
      )}

      {/* Image Preview - Responsive height */}
      {previewImage && showPreview && (
        <div className="space-y-2">
          <img
            src={previewImage}
            alt="Preview"
            className="w-full max-h-40 sm:max-h-64 object-cover rounded-lg border border-gray-300 dark:border-slate-600"
          />
          <button
            onClick={() => setShowPreview(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Hide Preview
          </button>
        </div>
      )}

      {/* Extracted Text - Responsive rows */}
      {extractedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
              Extracted Text ({confidence.toFixed(0)}%)
            </label>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 whitespace-nowrap"
            >
              Copy
            </button>
          </div>
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            style={{ minHeight: '80px' }}
          />
          {onTextExtracted && extractedText && (
            <button
              onClick={() => onTextExtracted(extractedText, confidence)}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              ✓ Use Text
            </button>
          )}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        💡 Tip: For best results, use clear, well-lit images with readable text.
      </p>
    </div>
  );
};

export default OCRCapture;
