import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VoiceButton from '@/shared/components/VoiceButton';
import ScreenshotCapture from '@/shared/components/ScreenshotCapture';
import OCRCapture from '@/shared/components/OCRCapture';
import LinkEmbed, { LinkPreview } from '@/shared/components/LinkEmbed';

const NoteEditor = ({ note, folders, onSave, onClose }) => {
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    folder: 'Personal',
    tags: [],
    color: '#ffffff',
    isPinned: false,
    links: []
  });

  const [tagInput, setTagInput] = useState('');
  const contentRef = useRef(null);

  useEffect(() => {
    if (note) {
      setNoteData({
        title: note.title || '',
        content: note.content || '',
        folder: note.folder || 'Personal',
        tags: note.tags || [],
        color: note.color || '#ffffff',
        isPinned: note.isPinned || false,
        links: note.links || []
      });
    }
  }, [note]);

  const handleSave = () => {
    if (!noteData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    onSave({
      ...noteData,
      updatedAt: new Date().toISOString(),
      createdAt: note?.createdAt || new Date().toISOString()
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !noteData.tags.includes(tagInput.trim())) {
      setNoteData({
        ...noteData,
        tags: [...noteData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNoteData({
      ...noteData,
      tags: noteData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const insertFormatting = (format) => {
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let newText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'bullet':
        newText = `\n• ${selectedText || 'List item'}`;
        newCursorPos = start + 3;
        break;
      case 'number':
        newText = `\n1. ${selectedText || 'List item'}`;
        newCursorPos = start + 4;
        break;
      case 'checkbox':
        newText = `\n☐ ${selectedText || 'Task'}`;
        newCursorPos = start + 3;
        break;
      case 'heading':
        newText = `\n# ${selectedText || 'Heading'}`;
        newCursorPos = start + 3;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        newCursorPos = selectedText ? end + 3 : start + 1;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + newText + text.substring(end);
    setNoteData({ ...noteData, content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const noteColors = [
    '#ffffff', '#fef3c7', '#fce7f3', '#dbeafe',
    '#dcfce7', '#e9d5ff', '#fed7aa', '#fecaca'
  ];

  const handleVoiceResult = (transcript) => {
    setNoteData({
      ...noteData,
      content: noteData.content + ' ' + transcript
    });
  };

  const handleScreenshot = (url, blob) => {
    // Insert screenshot as markdown image
    const imageMarkdown = `\n![Screenshot](${url})\n`;
    setNoteData({
      ...noteData,
      content: noteData.content + imageMarkdown
    });
  };

  const handleOCRResult = (extractedText) => {
    setNoteData({
      ...noteData,
      content: noteData.content + '\n\n' + extractedText
    });
  };

  const handleLinkEmbed = (linkData) => {
    const linkMarkdown = `\n[${linkData.title}](${linkData.url})\n`;
    setNoteData({
      ...noteData,
      content: noteData.content + linkMarkdown,
      links: [...noteData.links, linkData]
    });
  };

  const removeLinkEmbed = (linkToRemove) => {
    setNoteData({
      ...noteData,
      links: noteData.links.filter(link => link.url !== linkToRemove.url)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] mx-4 md:mx-0 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: noteData.color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={noteData.title}
            onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
            placeholder="Note Title"
            className="text-xl font-bold bg-transparent outline-none flex-1"
          />

          <div className="flex items-center gap-2">
            {/* Pin Toggle */}
            <button
              onClick={() => setNoteData({ ...noteData, isPinned: !noteData.isPinned })}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                noteData.isPinned ? 'text-yellow-500' : 'text-gray-400'
              }`}
              title="Pin note"
            >
              <svg className="w-5 h-5" fill={noteData.isPinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto bg-gray-50 dark:bg-gray-750">
          <button onClick={() => insertFormatting('bold')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bold">
            <strong>B</strong>
          </button>
          <button onClick={() => insertFormatting('italic')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Italic">
            <em>I</em>
          </button>
          <button onClick={() => insertFormatting('heading')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Heading">
            H
          </button>
          <button onClick={() => insertFormatting('bullet')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bullet list">
            •
          </button>
          <button onClick={() => insertFormatting('number')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Numbered list">
            1.
          </button>
          <button onClick={() => insertFormatting('checkbox')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Checkbox">
            ☐
          </button>
          <button onClick={() => insertFormatting('link')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Link">
            🔗
          </button>
          <button onClick={() => insertFormatting('code')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Code">
            {'</>'}
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

          {/* Voice Input */}
          <VoiceButton
            onVoiceResult={handleVoiceResult}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Voice Input"
          />

          {/* Screenshot Capture */}
          <ScreenshotCapture
            onCapture={handleScreenshot}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Screenshot"
          />

          {/* OCR Text Extraction */}
          <OCRCapture
            onTextExtracted={handleOCRResult}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="OCR Text Extract"
          />

          {/* Link Embedding */}
          <LinkEmbed
            onLinkEmbed={handleLinkEmbed}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Embed Link"
          />

          <div className="ml-auto flex items-center gap-2">
            {/* Color Picker */}
            <div className="flex gap-1">
              {noteColors.map(color => (
                <button
                  key={color}
                  onClick={() => setNoteData({ ...noteData, color })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    noteData.color === color ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Folder Selection */}
            <select
              value={noteData.folder}
              onChange={(e) => setNoteData({ ...noteData, folder: e.target.value })}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Textarea */}
          <div>
            <textarea
              ref={contentRef}
              value={noteData.content}
              onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
              placeholder="Start typing your note..."
              className="w-full h-80 bg-transparent outline-none resize-none text-base leading-relaxed"
              style={{ minHeight: '320px' }}
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</h4>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tags..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                Add Tag
              </button>
            </div>

            {noteData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {noteData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-red-500 text-lg leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Link Previews */}
          {noteData.links.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Embedded Links
              </h4>
              <div className="space-y-3">
                {noteData.links.map((link, index) => (
                  <LinkPreview
                    key={index}
                    linkData={link}
                    onRemove={() => removeLinkEmbed(link)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="text-sm text-gray-500">
            {note ? `Last updated: ${new Date(note.updatedAt).toLocaleString()}` : 'New Note'}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              {note ? 'Update' : 'Save'} Note
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoteEditor;