import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SmartMovieService from '@/services/SmartMovieService';

const SimpleMovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    language: ''
  });
  const [message, setMessage] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [searchCount, setSearchCount] = useState(0);

  // Language options
  const languages = [
    { value: '', label: 'Select Language' },
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'korean', label: 'Korean' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'other', label: 'Other' }
  ];

  // Genre options
  const genres = [
    { value: '', label: 'Select Genre' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'horror', label: 'Horror' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'animation', label: 'Animation' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'documentary', label: 'Documentary' }
  ];

  // Year options (decades)
  const years = [
    { value: '', label: 'Select Year Range' },
    { value: '2020', label: '2020s' },
    { value: '2010', label: '2010s' },
    { value: '2000', label: '2000s' },
    { value: '1990', label: '1990s' },
    { value: '1980', label: '1980s' },
    { value: '1970', label: '1970s' }
  ];

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  // Don't auto-load recommendations

  const searchMovies = async () => {
    // Check if all filters are selected
    if (!filters.genre || !filters.year || !filters.language) {
      alert('Please select all filters: Genre, Year Range, and Language');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Simulate curating delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const result = await SmartMovieService.getRecommendations({
        ...filters,
        limit: 6,
        offset: searchCount * 6 // For getting different results
      });
      if (result.success) {
        setMovies(result.movies.slice(0, 6)); // Ensure only 6 movies
        setMessage('We\'ve curated these recommendations specially for you');
        setSearchCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setMessage('Unable to load recommendations');
    }
    setLoading(false);
  };

  const searchAgain = async () => {
    await searchMovies();
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const result = await SmartMovieService.getRecommendations(filters);
      if (result.success) {
        setMovies(result.movies);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setMessage('Unable to load recommendations');
    }
    setLoading(false);
  };

  const loadFavorites = () => {
    const favs = SmartMovieService.getFavorites();
    setFavorites(favs.map(f => f.movieName));
  };

  const toggleFavorite = async (movie) => {
    const isFav = favorites.includes(movie.title);

    if (isFav) {
      await SmartMovieService.removeFavorite(movie.title);
      setFavorites(prev => prev.filter(f => f !== movie.title));
    } else {
      await SmartMovieService.saveFavorite(movie);
      setFavorites(prev => [...prev, movie.title]);
    }
  };

  const handleGenreSelect = (genre) => {
    setFilters(prev => ({ ...prev, genre }));
  };

  const handleYearSelect = (year) => {
    setFilters(prev => ({ ...prev, year }));
  };

  const handleLanguageSelect = (language) => {
    setFilters(prev => ({ ...prev, language }));
  };

  return (
    <div className="movie-recommendations">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎬 Movie Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {hasSearched ? message : "Select your preferences and we'll curate the perfect movies for you"}
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-8 p-6 ultra-card">
        <h3 className="text-lg font-semibold mb-4">Select Your Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Genre *</label>
            <select
              value={filters.genre}
              onChange={(e) => handleGenreSelect(e.target.value)}
              className="w-full px-4 py-2 input-ultra"
            >
              {genres.map(genre => (
                <option key={genre.value} value={genre.value}>{genre.label}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Year Range *</label>
            <select
              value={filters.year}
              onChange={(e) => handleYearSelect(e.target.value)}
              className="w-full px-4 py-2 input-ultra"
            >
              {years.map(year => (
                <option key={year.value} value={year.value}>{year.label}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Language *</label>
            <select
              value={filters.language}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="w-full px-4 py-2 input-ultra"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={searchMovies}
            disabled={loading}
            className="btn-ultra px-8 py-3 flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading ? 'Curating...' : 'Find Movies'}
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🎬</span>
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">
            Curating the best recommendations for you...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Analyzing thousands of movies to find your perfect match
          </p>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && hasSearched && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="ultra-card hover-ultra overflow-hidden group ultra-smooth transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover movie-poster transition-all duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/500x750/667eea/ffffff?text=${encodeURIComponent(movie.title)}`;
                  }}
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4">
                  <div className="w-full transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs mb-3 line-clamp-3">
                      {movie.overview}
                    </p>
                    <button
                      onClick={() => toggleFavorite(movie)}
                      className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
                    >
                      <span className={`text-2xl ${favorites.includes(movie.title) ? 'text-red-500' : 'text-white'}`}>
                        {favorites.includes(movie.title) ? '❤️' : '🤍'}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {favorites.includes(movie.title) ? 'Favorited' : 'Add to Favorites'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full font-bold text-sm ultra-smooth flex items-center gap-1 shadow-xl">
                  <span className="text-yellow-400 text-base">⭐</span>
                  <span>{movie.rating}</span>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <h4 className="font-bold text-base mb-2 line-clamp-2 text-ultra leading-tight hover:text-blue-600 transition-colors">
                  {movie.title}
                </h4>
                <div className="flex items-center gap-2 text-xs mb-3">
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    {movie.year}
                  </span>
                  <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-300 rounded-full font-medium">
                    {movie.runtime}
                  </span>
                </div>
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 2).map((genre, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search Again Button */}
      {!loading && hasSearched && movies.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Not satisfied with these recommendations?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={searchAgain}
            className="btn-ultra px-6 py-2 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Search Again
          </motion.button>
        </div>
      )}

      {/* No Results */}
      {!loading && hasSearched && movies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-lg text-gray-500">
            No movies found matching your criteria.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your filters and search again.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !hasSearched && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">🎞️</div>
          <p className="text-lg text-gray-500">
            Select your preferences above to discover amazing movies
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Choose Genre, Year Range, and Language to get started
          </p>
        </div>
      )}

      {/* Favorites Summary */}
      {hasSearched && favorites.length > 0 && (
        <div className="mt-8 p-4 ultra-card">
          <p className="text-sm text-ultra">
            ❤️ You have {favorites.length} favorite movie{favorites.length > 1 ? 's' : ''} saved
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleMovieRecommendations;