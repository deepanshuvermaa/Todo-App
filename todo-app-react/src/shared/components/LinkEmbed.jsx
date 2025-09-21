import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LinkEmbed = ({ onLinkEmbed, className = "" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');

  // Simulate link metadata extraction
  const extractLinkMetadata = async (url) => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // In production, you'd fetch actual metadata using:
        // 1. A backend service that fetches og:tags
        // 2. A service like Iframely, Embedly, or LinkPreview
        // 3. Or a custom scraper

        const domain = new URL(url).hostname;
        const samples = {
          'github.com': {
            title: 'GitHub Repository',
            description: 'A place where developers build software together',
            image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            favicon: '🐙'
          },
          'youtube.com': {
            title: 'YouTube Video',
            description: 'Watch this amazing video content',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            favicon: '📺'
          },
          'medium.com': {
            title: 'Medium Article',
            description: 'An insightful article about technology and development',
            image: 'https://miro.medium.com/max/1200/1*jfdwtvU6V6g99q3G7gq7dQ.png',
            favicon: '📰'
          },
          'stackoverflow.com': {
            title: 'Stack Overflow Question',
            description: 'A programming question with detailed answers',
            image: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
            favicon: '❓'
          },
          'docs.google.com': {
            title: 'Google Docs',
            description: 'Shared document for collaboration',
            image: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
            favicon: '📄'
          }
        };

        // Find matching domain or use default
        const metadata = Object.keys(samples).find(key => domain.includes(key))
          ? samples[Object.keys(samples).find(key => domain.includes(key))]
          : {
              title: domain,
              description: 'External link',
              image: null,
              favicon: '🔗'
            };

        resolve({
          ...metadata,
          url,
          domain
        });
      }, 1000);
    });
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      new URL(url); // Validate URL
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setIsProcessing(true);

    try {
      const metadata = await extractLinkMetadata(url);
      onLinkEmbed(metadata);
      setUrl('');
      setShowUrlInput(false);
    } catch (error) {
      console.error('Link processing error:', error);
      alert('Error processing link');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        alert('Clipboard access not supported');
        return;
      }

      const clipboardText = await navigator.clipboard.readText();

      // Check if clipboard contains a URL
      try {
        new URL(clipboardText);
        setUrl(clipboardText);
        setShowUrlInput(true);
      } catch {
        alert('Clipboard does not contain a valid URL');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Error accessing clipboard');
    }
  };

  return (
    <div className={`link-embed ${className}`}>
      {!showUrlInput ? (
        <div className="flex items-center gap-2">
          {/* Manual URL Input */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUrlInput(true)}
            className="link-embed-button"
            title="Add link"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </motion.button>

          {/* Paste URL */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePaste}
            className="link-embed-button"
            title="Paste URL from clipboard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.button>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          onSubmit={handleUrlSubmit}
          className="flex items-center gap-2 min-w-0"
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL..."
            className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
            autoFocus
          />

          <button
            type="submit"
            disabled={!url.trim() || isProcessing}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              'Add'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrl('');
            }}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </motion.form>
      )}
    </div>
  );
};

// Link Preview Component
export const LinkPreview = ({ linkData, onRemove, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`link-preview bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        {linkData.image ? (
          <img
            src={linkData.image}
            alt=""
            className="w-16 h-16 object-cover rounded flex-shrink-0"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{linkData.favicon}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {linkData.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {linkData.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <a
              href={linkData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline truncate"
            >
              {linkData.domain}
            </a>
            {onRemove && (
              <button
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 ml-2"
                title="Remove link"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LinkEmbed;