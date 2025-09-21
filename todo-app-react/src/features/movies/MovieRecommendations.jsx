import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieService from '@/services/MovieService';
import MovieCard from './MovieCard';
import MovieFilters from './MovieFilters';

const MovieRecommendations = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentView, setCurrentView] = useState('trending'); // trending, search, mood, genre
  const [favorites, setFavorites] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [error, setError] = useState('');

  const moods = [
    { id: 'happy', label: '😊 Happy', description: 'Feel-good movies' },
    { id: 'sad', label: '😢 Emotional', description: 'Meaningful dramas' },
    { id: 'excited', label: '🔥 Excited', description: 'Action & thrillers' },
    { id: 'relaxed', label: '😌 Relaxed', description: 'Easy watching' },
    { id: 'scared', label: '😱 Scared', description: 'Horror & suspense' },
    { id: 'thoughtful', label: '🤔 Thoughtful', description: 'Deep & meaningful' },
    { id: 'nostalgic', label: '🕰️ Nostalgic', description: 'Classic movies' },
    { id: 'romantic', label: '💕 Romantic', description: 'Love stories' }
  ];

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  useEffect(() => {
    loadTrendingMovies();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = () => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');
      const savedWatchLater = JSON.parse(localStorage.getItem('movieWatchLater') || '[]');
      setFavorites(savedFavorites);
      setWatchLater(savedWatchLater);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = (type, data) => {
    try {
      localStorage.setItem(`movie${type}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const loadTrendingMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await MovieService.getTrendingMovies();
      if (result.success) {
        setMovies(result.movies);
        setCurrentView('trending');
      } else {
        throw new Error('Failed to load trending movies');
      }
    } catch (error) {
      setError('Failed to load movies. Please try again.');
      console.error('Error loading trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      const result = await MovieService.getMovieRecommendations(searchQuery);
      if (result.success) {
        setMovies(result.movies);
        setCurrentView('search');
        setSelectedMood('');
        setSelectedGenre('');
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setSelectedGenre('');
    setLoading(true);
    setError('');

    try {
      const result = await MovieService.getRecommendationsByMood(mood);
      if (result.success) {
        setMovies(result.movies);
        setCurrentView('mood');
      } else {
        throw new Error('Failed to load mood-based recommendations');
      }
    } catch (error) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Mood selection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    setSelectedMood('');
    setLoading(true);
    setError('');

    try {
      const result = await MovieService.getRecommendationsByGenre(genre);
      if (result.success) {
        setMovies(result.movies);
        setCurrentView('genre');
      } else {
        throw new Error('Failed to load genre recommendations');
      }
    } catch (error) {
      setError('Failed to load recommendations. Please try again.');
      console.error('Genre selection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    const movieId = movie.id || movie.title;
    const newFavorites = favorites.some(fav => (fav.id || fav.title) === movieId)
      ? favorites.filter(fav => (fav.id || fav.title) !== movieId)
      : [...favorites, movie];

    setFavorites(newFavorites);
    saveUserPreferences('Favorites', newFavorites);
  };

  const toggleWatchLater = (movie) => {
    const movieId = movie.id || movie.title;
    const newWatchLater = watchLater.some(item => (item.id || item.title) === movieId)
      ? watchLater.filter(item => (item.id || item.title) !== movieId)
      : [...watchLater, movie];

    setWatchLater(newWatchLater);
    saveUserPreferences('WatchLater', newWatchLater);
  };

  const isFavorite = (movie) => {
    const movieId = movie.id || movie.title;
    return favorites.some(fav => (fav.id || fav.title) === movieId);
  };

  const isInWatchLater = (movie) => {
    const movieId = movie.id || movie.title;
    return watchLater.some(item => (item.id || item.title) === movieId);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'trending':
        return '🔥 Trending Movies';
      case 'search':
        return `🔍 Search Results: "${searchQuery}"`;
      case 'mood':
        const mood = moods.find(m => m.id === selectedMood);
        return `${mood?.label || ''} Movies`;
      case 'genre':
        return `🎬 ${selectedGenre} Movies`;
      default:
        return 'Movie Recommendations';
    }
  };

  return (
    <div className="movie-recommendations">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🎬 Movie Recommendations</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies, actors, directors..."
              className="flex-1 input-field"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                '🔍 Search'
              )}
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={loadTrendingMovies}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'trending'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setMovies(favorites)}
            className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            ❤️ Favorites ({favorites.length})
          </button>
          <button
            onClick={() => setMovies(watchLater)}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            📝 Watch Later ({watchLater.length})
          </button>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map((mood) => (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMoodSelect(mood.id)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedMood === mood.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="text-lg mb-1">{mood.label}</div>
              <div className="text-xs opacity-75">{mood.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Genre Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browse by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedGenre === genre
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{getViewTitle()}</h2>
          {movies.length > 0 && (
            <span className="text-gray-500 dark:text-gray-400">
              {movies.length} movie{movies.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Loading amazing movies for you...</span>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {movies.map((movie, index) => (
                <motion.div
                  key={movie.id || movie.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCard
                    movie={movie}
                    isFavorite={isFavorite(movie)}
                    isInWatchLater={isInWatchLater(movie)}
                    onToggleFavorite={() => toggleFavorite(movie)}
                    onToggleWatchLater={() => toggleWatchLater(movie)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try searching for something else or browse by mood/genre
            </p>
            <button
              onClick={loadTrendingMovies}
              className="btn-primary"
            >
              Browse Trending Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieRecommendations;