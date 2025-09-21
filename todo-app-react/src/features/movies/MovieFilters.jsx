import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MovieFilters = ({ onFiltersChange, currentFilters = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
    director: '',
    actor: '',
    ...currentFilters
  });

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  const ratingRanges = [
    { label: 'Any Rating', value: '' },
    { label: '9.0+ (Masterpiece)', value: '9.0' },
    { label: '8.0+ (Excellent)', value: '8.0' },
    { label: '7.0+ (Good)', value: '7.0' },
    { label: '6.0+ (Decent)', value: '6.0' },
    { label: '5.0+ (Below Average)', value: '5.0' }
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 1950; i--) {
    years.push(i);
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      genre: '',
      year: '',
      rating: '',
      director: '',
      actor: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="movie-filters bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">🎛️ Filters</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </motion.button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showAdvanced ? 'Basic' : 'Advanced'} Filters
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full input-field"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Year</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full input-field"
          >
            <option value="">Any Year</option>
            <optgroup label="Recent">
              {years.slice(0, 10).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </optgroup>
            <optgroup label="2010s">
              {years.slice(10, 20).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </optgroup>
            <optgroup label="2000s">
              {years.slice(20, 30).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </optgroup>
            <optgroup label="Classics">
              {years.slice(30, 50).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Rating</label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full input-field"
          >
            {ratingRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Director Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Director</label>
                  <input
                    type="text"
                    value={filters.director}
                    onChange={(e) => handleFilterChange('director', e.target.value)}
                    placeholder="e.g., Christopher Nolan"
                    className="w-full input-field"
                  />
                </div>

                {/* Actor Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Actor/Actress</label>
                  <input
                    type="text"
                    value={filters.actor}
                    onChange={(e) => handleFilterChange('actor', e.target.value)}
                    placeholder="e.g., Leonardo DiCaprio"
                    className="w-full input-field"
                  />
                </div>
              </div>

              {/* Popular Director Shortcuts */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Popular Directors</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Christopher Nolan', 'Quentin Tarantino', 'Martin Scorsese',
                    'Steven Spielberg', 'Denis Villeneuve', 'Jordan Peele',
                    'Greta Gerwig', 'Rian Johnson', 'Wes Anderson'
                  ].map(director => (
                    <button
                      key={director}
                      onClick={() => handleFilterChange('director', director)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.director === director
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {director}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Actor Shortcuts */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Popular Actors</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Leonardo DiCaprio', 'Tom Hanks', 'Meryl Streep',
                    'Robert Downey Jr.', 'Scarlett Johansson', 'Ryan Gosling',
                    'Emma Stone', 'Christian Bale', 'Margot Robbie'
                  ].map(actor => (
                    <button
                      key={actor}
                      onClick={() => handleFilterChange('actor', actor)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.actor === actor
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {actor}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
        >
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            Active Filters:
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-sm"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                  <button
                    onClick={() => handleFilterChange(key, '')}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MovieFilters;