import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BucketListForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    deadline: '',
    estimatedCost: '',
    location: '',
    steps: [],
    resources: [],
    motivation: '',
    imageUrl: '',
    status: 'not-started',
    progress: 0
  });

  const [stepInput, setStepInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');

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

  const priorities = [
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'low', label: 'Low Priority', color: 'text-green-600' }
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        steps: item.steps || [],
        resources: item.resources || []
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title for your bucket list item');
      return;
    }

    onSave(formData);
  };

  const handleAddStep = () => {
    if (stepInput.trim()) {
      setFormData({
        ...formData,
        steps: [...formData.steps, { id: Date.now(), text: stepInput.trim(), completed: false }]
      });
      setStepInput('');
    }
  };

  const handleToggleStep = (stepId) => {
    setFormData({
      ...formData,
      steps: formData.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    });
  };

  const handleRemoveStep = (stepId) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter(step => step.id !== stepId)
    });
  };

  const handleAddResource = () => {
    if (resourceInput.trim()) {
      setFormData({
        ...formData,
        resources: [...formData.resources, resourceInput.trim()]
      });
      setResourceInput('');
    }
  };

  const handleRemoveResource = (index) => {
    setFormData({
      ...formData,
      resources: formData.resources.filter((_, i) => i !== index)
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">
        {item ? 'Edit Dream' : 'Add New Dream'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Dream Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="e.g., Visit all 7 continents"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows="3"
            placeholder="Describe your dream in detail..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-field"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="input-field"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Target Date <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Estimated Cost */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Estimated Cost <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.estimatedCost}
            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            className="input-field"
            placeholder="e.g., $5000"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Location <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input-field"
            placeholder="e.g., Paris, France"
          />
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Inspiration Image URL <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="input-field"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Motivation */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Why This Matters <span className="text-xs text-gray-500">(motivation)</span>
          </label>
          <textarea
            value={formData.motivation}
            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
            className="input-field"
            rows="2"
            placeholder="Why is this important to you?"
          />
        </div>
      </div>

      {/* Action Steps */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Action Steps</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddStep();
              }
            }}
            className="input-field flex-1"
            placeholder="Add a step to achieve this dream..."
          />
          <button
            type="button"
            onClick={handleAddStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        
        {formData.steps.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {formData.steps.map(step => (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded"
              >
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => handleToggleStep(step.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className={`flex-1 ${step.completed ? 'line-through text-gray-500' : ''}`}>
                  {step.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Resources & Links</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={resourceInput}
            onChange={(e) => setResourceInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddResource();
              }
            }}
            className="input-field flex-1"
            placeholder="Add a helpful resource or link..."
          />
          <button
            type="button"
            onClick={handleAddResource}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Add
          </button>
        </div>
        
        {formData.resources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.resources.map((resource, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm flex items-center gap-1"
              >
                {resource}
                <button
                  type="button"
                  onClick={() => handleRemoveResource(index)}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress (only for editing) */}
      {item && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">
            Progress: {formData.progress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          {item ? 'Update Dream' : 'Add Dream'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
};

export default BucketListForm;