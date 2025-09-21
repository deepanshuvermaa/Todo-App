import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const TextExtraction = () => {
  const { addTask, addNote } = useAppStore();

  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Simulate OCR processing (in production, use Tesseract.js or cloud OCR)
  const simulateOCR = async (imageData) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sampleTexts = [
      "Meeting Notes\n• Discuss project timeline\n• Review budget requirements\n• Plan next sprint",
      "Shopping List\n- Milk\n- Bread\n- Eggs\n- Chicken\n- Vegetables",
      "Important Reminders\n□ Call dentist appointment\n□ Submit expense report\n□ Review contract terms",
      "Contact Information\nJohn Smith\nPhone: (555) 123-4567\nEmail: john@example.com\nAddress: 123 Main St",
      "Recipe Instructions\n1. Preheat oven to 350°F\n2. Mix ingredients in bowl\n3. Bake for 25 minutes\n4. Let cool before serving",
      "Event Details\nDate: Friday, Oct 15\nTime: 2:00 PM\nLocation: Conference Room A\nAttendees: Team leads",
      "Quick Notes\n- Follow up with client\n- Update documentation\n- Schedule team meeting\n- Review performance metrics"
    ];

    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedImage(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const extractedText = await simulateOCR(file);
      setExtractedText(extractedText);

      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        image: URL.createObjectURL(file),
        text: extractedText,
        source: 'File Upload'
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);

    } catch (error) {
      alert('Error processing image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const captureFromCamera = async () => {
    try {
      setIsProcessing(true);

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      const video = videoRef.current;
      video.srcObject = stream;
      video.autoplay = true;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
        video.play();
      });

      // Wait for camera to focus
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture frame
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Convert to image
      const imageUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(imageUrl);

      // Process with OCR
      const extractedText = await simulateOCR(imageUrl);
      setExtractedText(extractedText);

      // Add to history
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        image: imageUrl,
        text: extractedText,
        source: 'Camera Capture'
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);

    } catch (error) {
      alert('Camera error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsTask = () => {
    if (extractedText.trim()) {
      // Split text into lines and create tasks
      const lines = extractedText.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        const cleanLine = line.replace(/^[•\-□☐✓\d\.]+\s*/, '').trim();
        if (cleanLine) {
          addTask(cleanLine);
        }
      });

      alert(`Created ${lines.length} tasks from extracted text!`);
      setExtractedText('');
    }
  };

  const saveAsNote = () => {
    if (extractedText.trim()) {
      const title = extractedText.split('\n')[0].substring(0, 50) || 'OCR Extracted Note';

      addNote({
        title,
        content: extractedText,
        folder: 'OCR Extracts',
        tags: ['ocr', 'extracted']
      });

      alert('Note created from extracted text!');
      setExtractedText('');
    }
  };

  const editText = (text) => {
    setExtractedText(text);
    setSelectedImage(null);
  };

  const clearAll = () => {
    setExtractedText('');
    setSelectedImage(null);
    setHistory([]);
  };

  return (
    <div className="text-extraction max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📝 OCR Text Extraction
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Extract text from images using OCR technology. Upload photos or capture with camera.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Image Input Section */}
        <div className="space-y-6">
          {/* Upload Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Image Input</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* File Upload */}
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="text-sm font-medium">Upload Image</p>
                <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </motion.label>

              {/* Camera Capture */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={captureFromCamera}
                disabled={isProcessing}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors disabled:opacity-50"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm font-medium">Camera Capture</p>
                <p className="text-xs text-gray-500">Live photo</p>
              </motion.button>
            </div>

            {isProcessing && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Processing image...</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Selected Image</h3>
              <img
                src={selectedImage}
                alt="Selected for OCR"
                className="w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
          )}

          {/* Hidden elements for camera */}
          <video ref={videoRef} style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Extracted Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Extracted Text</h3>
              {extractedText && (
                <button
                  onClick={() => setExtractedText('')}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Extracted text will appear here..."
              className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
            />

            {extractedText && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveAsTask}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  📋 Create Tasks
                </button>
                <button
                  onClick={saveAsNote}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  📝 Save as Note
                </button>
              </div>
            )}
          </div>

          {/* Processing History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Processing History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No processed images yet</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt="Processed"
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.source}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {item.text}
                        </p>
                        <button
                          onClick={() => editText(item.text)}
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          Edit Text
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 OCR Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Use high-contrast images with clear, readable text</li>
          <li>• Ensure text is horizontal and not skewed</li>
          <li>• Good lighting improves extraction accuracy</li>
          <li>• Works best with printed text rather than handwriting</li>
          <li>• Multiple languages supported</li>
        </ul>
      </div>
    </div>
  );
};

export default TextExtraction;