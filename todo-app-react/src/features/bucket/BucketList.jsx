import React, { useState, useMemo } from 'react';
import useAppStore from '@/store/useAppStore';
import BucketListForm from './BucketListForm';
import BucketListCard from './BucketListCard';
import VisionBoard from './VisionBoard';
import { motion, AnimatePresence } from 'framer-motion';

const BucketList = () => {
  const { bucketList, addBucketItem, updateBucketItem, deleteBucketItem } = useAppStore();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'vision'
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // priority, deadline, progress

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...bucketList];

    // Category filter
    if (filterCategory !== 'all') {
      items = items.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      items = items.filter(item => item.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.steps?.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    return items;
  }, [bucketList, filterCategory, filterStatus, searchTerm, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = bucketList.length;
    const completed = bucketList.filter(item => item.status === 'completed').length;
    const inProgress = bucketList.filter(item => item.status === 'in-progress').length;
    const notStarted = bucketList.filter(item => item.status === 'not-started').length;

    const categoryCounts = {};
    bucketList.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const avgProgress = bucketList.length > 0
      ? Math.round(bucketList.reduce((sum, item) => sum + (item.progress || 0), 0) / bucketList.length)
      : 0;

    const upcomingDeadlines = bucketList.filter(item => {
      if (!item.deadline || item.status === 'completed') return false;
      const daysUntil = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil > 0;
    }).length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      categoryCounts,
      avgProgress,
      upcomingDeadlines,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [bucketList]);

  const handleSaveItem = async (itemData) => {
    if (editingItem) {
      await updateBucketItem(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      await addBucketItem(itemData);
    }
    setShowForm(false);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this bucket list item?')) {
      await deleteBucketItem(id);
    }
  };

  const handleUpdateProgress = async (id, progress) => {
    const item = bucketList.find(i => i.id === id);
    if (!item) return;

    const updates = { progress };
    
    // Auto-update status based on progress
    if (progress === 0) {
      updates.status = 'not-started';
    } else if (progress === 100) {
      updates.status = 'completed';
      updates.completedDate = new Date().toISOString();
    } else {
      updates.status = 'in-progress';
    }

    await updateBucketItem(id, updates);
  };

  const categories = [
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'adventure', label: 'Adventure', icon: '🎢' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'creative', label: 'Creative', icon: '🎨' },
    { value: 'financial', label: 'Financial', icon: '💰' },
    { value: 'personal', label: 'Personal', icon: '✨' },
    { value: 'other', label: 'Other', icon: '🎯' }
  ];

  return (
    <div className="bucket-list">
      {/* Header */}
      <div className="mb-6">
        {/* Centered Title */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-4">Bucket List</h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Dreams List
              </span>
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'vision'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Vision Board
              </span>
            </button>
          </div>
        </div>

        {/* Controls Row - Only show for list tab */}
        {activeTab === 'list' && (
          <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm sm:text-base">Add Dream</span>
          </button>
          </div>
        )}

        {/* Search Bar - Only show for list tab */}
        {activeTab === 'list' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search your dreams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          </div>
        )}

        {/* Filters - Only show for list tab */}
        {activeTab === 'list' && (
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg
                       bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="priority">Sort by Priority</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="progress">Sort by Progress</option>
          </select>
          </div>
        )}

        {/* Statistics - Only show for list tab */}
        {activeTab === 'list' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Total Dreams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500">{stats.completionRate}%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-500">Avg {stats.avgProgress}%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</p>
            <p className="text-xs text-gray-500">Next 30 days</p>
          </motion.div>
        </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <>
          {/* Add/Edit Form */}
          <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <BucketListForm
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bucket List Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <BucketListCard
                  item={item}
                  onEdit={() => {
                    setEditingItem(item);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteItem(item.id)}
                  onUpdateProgress={(progress) => handleUpdateProgress(item.id, progress)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-lg text-gray-500">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'No items found matching your filters'
                  : 'Your bucket list is empty'}
              </p>
              {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Add your first dream →
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Motivational Quote */}
      {stats.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-blue-600 rounded-lg text-white text-center"
        >
          <p className="text-lg font-medium mb-2">
            🎆 You've completed {stats.completed} dream{stats.completed !== 1 ? 's' : ''}!
          </p>
          <p className="text-sm opacity-90">
            "The only impossible journey is the one you never begin." - Tony Robbins
          </p>
        </motion.div>
      )}
        </>
      ) : (
        <VisionBoard />
      )}
    </div>
  );
};

export default BucketList;