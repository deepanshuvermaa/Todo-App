import React, { useState, useRef, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const VisionBoard = () => {
  const {
    visionBoard,
    addVisionImage,
    updateVisionImage,
    deleteVisionImage,
    togglePinVisionImage
  } = useAppStore();

  const [viewMode, setViewMode] = useState('masonry'); // 'masonry' or 'grid'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const fileInputRef = useRef(null);

  // Frame templates
  const frameTemplates = [
    { id: 'none', name: 'No Frame', style: {} },
    { id: 'polaroid', name: 'Polaroid', style: { padding: '10px', paddingBottom: '60px', background: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' } },
    { id: 'vintage', name: 'Vintage', style: { border: '8px solid #8B4513', borderRadius: '4px', boxShadow: 'inset 0 0 20px rgba(139,69,19,0.2)' } },
    { id: 'golden', name: 'Golden', style: { border: '6px solid', borderImage: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700) 1', boxShadow: '0 0 20px rgba(255,215,0,0.3)' } },
    { id: 'neon', name: 'Neon Glow', style: { border: '2px solid #00ff00', boxShadow: '0 0 20px #00ff00, inset 0 0 10px rgba(0,255,0,0.1)' } },
    { id: 'film', name: 'Film Strip', style: { border: '15px solid black', borderLeft: '25px solid black', borderRight: '25px solid black', position: 'relative' } },
    { id: 'scrapbook', name: 'Scrapbook', style: { transform: 'rotate(-2deg)', background: 'linear-gradient(45deg, #f5f5dc 25%, transparent 25%), linear-gradient(-45deg, #f5f5dc 25%, transparent 25%)', backgroundSize: '20px 20px', padding: '15px' } },
    { id: 'dreamy', name: 'Dreamy', style: { borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(147,112,219,0.3)' } },
    { id: 'minimalist', name: 'Minimalist', style: { border: '1px solid #e0e0e0', padding: '20px', background: 'white' } },
    { id: 'magazine', name: 'Magazine', style: { clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)', background: 'white', padding: '10px' } }
  ];

  const categories = [
    { value: 'all', label: 'All', icon: '🎯' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'relationships', label: 'Relationships', icon: '💕' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '🏡' },
    { value: 'achievement', label: 'Achievement', icon: '🏆' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' },
    { value: 'finance', label: 'Finance', icon: '💰' },
    { value: 'personal', label: 'Personal', icon: '✨' }
  ];

  // Filter images based on category and search
  const filteredImages = useMemo(() => {
    let images = [...visionBoard];

    // Category filter
    if (selectedCategory !== 'all') {
      images = images.filter(img => img.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      images = images.filter(img =>
        img.title?.toLowerCase().includes(search) ||
        img.description?.toLowerCase().includes(search) ||
        img.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Sort pinned items first
    images.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return images;
  }, [visionBoard, selectedCategory, searchTerm]);

  // Image upload and compression
  const handleImageUpload = async (files) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const compressedImage = await compressImage(file);
      return {
        imageData: compressedImage,
        title: file.name.split('.')[0],
        category: 'personal',
        tags: [],
        description: '',
        frame: selectedFrame,
        isPinned: false
      };
    });

    const newImages = await Promise.all(uploadPromises);

    for (const image of newImages) {
      await addVisionImage(image);
    }

    setShowUploadModal(false);
  };

  // Compress image to base64 with size limit
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 800px width/height)
          const maxSize = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
      };
      reader.onerror = reject;
    });
  };

  // Handle image editing
  const handleSaveEdit = async (imageId, updates) => {
    await updateVisionImage(imageId, updates);
    setEditingImage(null);
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image from your vision board?')) {
      await deleteVisionImage(imageId);
      setSelectedImage(null);
    }
  };

  // Upload Modal Component
  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
      >
        <h3 className="text-xl font-bold mb-4">Add Images to Vision Board</h3>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary mb-2"
          >
            Select Images
          </button>

          <p className="text-sm text-gray-500">
            Or drag and drop images here
          </p>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Select Frame Style for New Images</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {frameTemplates.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`p-2 text-xs rounded border transition-all ${
                    selectedFrame === frame.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {frame.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(false)}
          className="mt-4 w-full btn-secondary"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );

  // Edit Modal Component
  const EditModal = ({ image }) => {
    const [formData, setFormData] = useState({
      title: image.title || '',
      description: image.description || '',
      category: image.category || 'personal',
      tags: image.tags?.join(', ') || '',
      frame: image.frame || 'none'
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
        >
          <h3 className="text-xl font-bold mb-4">Edit Image Details</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Give your vision a title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Describe your vision..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="goals, dreams, 2024..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Frame Style</label>
              <select
                value={formData.frame}
                onChange={(e) => setFormData({ ...formData, frame: e.target.value })}
                className="input-field"
              >
                {frameTemplates.map(frame => (
                  <option key={frame.id} value={frame.id}>
                    {frame.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                handleSaveEdit(image.id, {
                  ...formData,
                  tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                  frame: formData.frame
                });
              }}
              className="flex-1 btn-primary"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingImage(null)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Get frame style for an image
  const getFrameStyle = (frameId) => {
    const frame = frameTemplates.find(f => f.id === frameId);
    return frame ? frame.style : {};
  };

  // Image Card Component with frames
  const ImageCard = ({ image, index }) => {
    const frameStyle = getFrameStyle(image.frame || 'none');
    const isFilmStrip = image.frame === 'film';
    const isPolaroid = image.frame === 'polaroid';

    return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className={`relative group transition-all duration-300 cursor-pointer
                  ${viewMode === 'masonry' ? '' : 'aspect-square'}
                  ${image.frame === 'scrapbook' ? 'hover:rotate-0' : ''}`}
      style={frameStyle}
      onClick={() => setSelectedImage(image)}
    >
      {/* Film strip holes */}
      {isFilmStrip && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-evenly items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3 h-4 bg-gray-800 rounded-sm" />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-evenly items-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-3 h-4 bg-gray-800 rounded-sm" />
            ))}
          </div>
        </>
      )}
      <div className={`${isFilmStrip ? 'mx-8' : ''} ${isPolaroid ? 'bg-white' : ''} relative overflow-hidden rounded-lg`}>
        <img
          src={image.imageData}
          alt={image.title || 'Vision'}
          className={`w-full ${viewMode === 'grid' ? 'h-full object-cover' : ''}`}
          loading="lazy"
        />
        {/* Polaroid caption */}
        {isPolaroid && (
          <div className="text-center py-3 px-2 bg-white">
            <p className="font-handwriting text-gray-700 text-sm truncate">
              {image.title || new Date(image.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg mb-1">{image.title || 'Untitled'}</h3>
          {image.description && (
            <p className="text-white/80 text-sm line-clamp-2">{image.description}</p>
          )}
          {image.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {image.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pin indicator */}
      {image.isPinned && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 p-2 rounded-full shadow-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z" />
          </svg>
        </div>
      )}

      {/* Quick actions */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinVisionImage(image.id);
            }}
            className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-800"
            title={image.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className={`w-4 h-4 ${image.isPinned ? 'text-yellow-500' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingImage(image);
            }}
            className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-800"
            title="Edit"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
    );
  };

  // Full Image View Modal
  const ImageViewModal = ({ image }) => (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={() => setSelectedImage(null)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <img
            src={image.imageData}
            alt={image.title || 'Vision'}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">{image.title || 'Untitled'}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => togglePinVisionImage(image.id)}
                className={`p-2 rounded ${image.isPinned ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
                title={image.isPinned ? 'Unpin' : 'Pin'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setEditingImage(image);
                }}
                className="p-2 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="p-2 rounded text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {image.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-3">{image.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              {categories.find(c => c.value === image.category)?.icon}
              {categories.find(c => c.value === image.category)?.label}
            </span>
            {image.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {image.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setSelectedImage(null)}
          className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="vision-board">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Upload */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search your visions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 input-field"
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Images
          </button>
        </div>

        {/* Filters and View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1">
                  {cat.icon} {cat.label}
                  {cat.value === 'all' && visionBoard.length > 0 && (
                    <span className="ml-1 text-xs">({visionBoard.length})</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('masonry')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'masonry'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Masonry View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image count */}
        {filteredImages.length > 0 && (
          <p className="text-sm text-gray-500">
            {filteredImages.length} vision{filteredImages.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
          </p>
        )}
      </div>

      {/* Images Grid/Masonry */}
      {filteredImages.length > 0 ? (
        <div className={
          viewMode === 'masonry'
            ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
        }>
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <ImageCard key={image.id} image={image} index={index} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg text-gray-500 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'No visions found matching your criteria'
              : 'Your vision board is empty'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Add your first vision →
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showUploadModal && <UploadModal />}
        {editingImage && <EditModal image={editingImage} />}
        {selectedImage && <ImageViewModal image={selectedImage} />}
      </AnimatePresence>
    </div>
  );
};

export default VisionBoard;