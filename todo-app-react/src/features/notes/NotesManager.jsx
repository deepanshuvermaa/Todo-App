import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import NoteEditor from './NoteEditor';
import NotionStyleEditor from './NotionStyleEditor';
import NoteCard from './NoteCard';
import NoteSidebar from './NoteSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const NotesManager = () => {
  const { notes, addNote, updateNote, deleteNote } = useAppStore();
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('updated'); // updated, created, title
  const [showEditor, setShowEditor] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editorMode, setEditorMode] = useState('notion'); // 'classic' or 'notion'

  // Extract all unique tags from notes
  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Extract all unique folders
  const allFolders = useMemo(() => {
    const folders = new Set(['Personal', 'Work', 'Ideas', 'Archive']);
    notes.forEach(note => {
      if (note.folder) folders.add(note.folder);
    });
    return Array.from(folders).sort();
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Folder filter
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(note => note.folder === selectedFolder);
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(note =>
        note.tags && note.tags.includes(selectedTag)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedFolder, selectedTag, sortBy]);

  const handleCreateNote = (mode = 'notion') => {
    setSelectedNote(null);
    setEditorMode(mode);
    setShowEditor(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    // Check if note has blocks (Notion-style) or just content (classic)
    setEditorMode(note.blocks ? 'notion' : 'classic');
    setShowEditor(true);
  };

  const handleSaveNote = async (noteData) => {
    if (selectedNote) {
      await updateNote(selectedNote.id, {
        ...noteData,
        updatedAt: new Date().toISOString()
      });
    } else {
      await addNote(noteData);
    }
    setShowEditor(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    }
  };

  return (
    <div className="notes-manager flex flex-col md:flex-row h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        showSidebar
          ? 'fixed left-0 top-0 h-full w-80 z-50 transform translate-x-0'
          : 'fixed left-0 top-0 h-full w-80 z-50 transform -translate-x-full'
        } md:relative md:transform-none md:translate-x-0 md:w-80 transition-transform duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
        {/* Mobile Close Button */}
        <button
          onClick={() => setShowSidebar(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <NoteSidebar
          folders={allFolders}
          tags={allTags}
          selectedFolder={selectedFolder}
          selectedTag={selectedTag}
          onFolderSelect={(folder) => {
            setSelectedFolder(folder);
            setShowSidebar(false); // Close sidebar on mobile after selection
          }}
          onTagSelect={(tag) => {
            setSelectedTag(tag);
            setShowSidebar(false); // Close sidebar on mobile after selection
          }}
          notesCount={filteredNotes.length}
          onCreateNote={() => {
            handleCreateNote('notion');
            setShowSidebar(false); // Close sidebar on mobile after creating note
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedFolder === 'all' ? 'All Notes' : selectedFolder}
                {selectedTag && ` • #${selectedTag}`}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600' : ''}`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600' : ''}`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 sm:px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200"
              >
                <option value="updated">Last Modified</option>
                <option value="created">Date Created</option>
                <option value="title">Title</option>
              </select>

              {/* Create Button */}
              <button
                onClick={handleCreateNote}
                className="btn-ultra px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Note</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Notes Grid/List */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 dark:bg-gray-900">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300">No notes found</p>
              <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Create your first note to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'
              : 'space-y-3'
            }>
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NoteCard
                      note={note}
                      viewMode={viewMode}
                      onEdit={() => handleEditNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            >
              {editorMode === 'notion' ? (
                <NotionStyleEditor
                  note={selectedNote}
                  onSave={handleSaveNote}
                  onCancel={() => {
                    setShowEditor(false);
                    setSelectedNote(null);
                  }}
                />
              ) : (
                <NoteEditor
                  note={selectedNote}
                  folders={allFolders}
                  onSave={handleSaveNote}
                  onClose={() => {
                    setShowEditor(false);
                    setSelectedNote(null);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesManager;