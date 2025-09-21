import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MovieCard = ({
  movie,
  isFavorite = false,
  isInWatchLater = false,
  onToggleFavorite,
  onToggleWatchLater
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'bg-green-500';
    if (rating >= 7) return 'bg-yellow-500';
    if (rating >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatGenres = (genres) => {
    if (!Array.isArray(genres)) return '';
    return genres.slice(0, 3).join(', ');
  };

  const formatCast = (cast) => {
    if (!Array.isArray(cast)) return '';
    return cast.slice(0, 3).join(', ');
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      layout
      className="movie-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* Movie Poster */}
      <div className="relative">
        {!imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            onError={handleImageError}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {movie.title}
              </div>
            </div>
          </div>
        )}

        {/* Rating Badge */}
        {movie.rating > 0 && (
          <div className={`absolute top-3 left-3 ${getRatingColor(movie.rating)} text-white px-2 py-1 rounded-full text-sm font-bold`}>
            ⭐ {movie.rating.toFixed(1)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white bg-opacity-80 text-gray-700 hover:bg-red-100'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleWatchLater}
            className={`p-2 rounded-full transition-colors ${
              isInWatchLater
                ? 'bg-yellow-500 text-white'
                : 'bg-white bg-opacity-80 text-gray-700 hover:bg-yellow-100'
            }`}
            title={isInWatchLater ? 'Remove from watch later' : 'Add to watch later'}
          >
            <svg className="w-5 h-5" fill={isInWatchLater ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>
        </div>

        {/* Year Badge */}
        {movie.year && movie.year !== 'Unknown' && (
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            {movie.year}
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
          {movie.title}
        </h3>

        {/* Genres */}
        {movie.genre && movie.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genre.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
          {truncateText(movie.description)}
        </p>

        {/* Director & Cast */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
          {movie.director && movie.director !== 'Unknown Director' && (
            <div>
              <span className="font-medium">Director:</span> {movie.director}
            </div>
          )}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <span className="font-medium">Cast:</span> {formatCast(movie.cast)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDetails(true)}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            View Details
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Open IMDb or search in Google
              const searchQuery = encodeURIComponent(`${movie.title} ${movie.year} movie`);
              window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
            }}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Search
          </motion.button>
        </div>
      </div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{movie.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Poster */}
                  <div className="md:w-1/3">
                    {!imageError ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        onError={handleImageError}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎬</div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {movie.title}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:w-2/3">
                    <div className="space-y-4">
                      {/* Year & Rating */}
                      <div className="flex items-center gap-4">
                        {movie.year && movie.year !== 'Unknown' && (
                          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                            {movie.year}
                          </span>
                        )}
                        {movie.rating > 0 && (
                          <span className={`${getRatingColor(movie.rating)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                            ⭐ {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Genres */}
                      {movie.genre && movie.genre.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {movie.genre.map((genre, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-sm"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold mb-2">Plot</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {movie.description || 'No description available.'}
                        </p>
                      </div>

                      {/* Director */}
                      {movie.director && movie.director !== 'Unknown Director' && (
                        <div>
                          <h3 className="font-semibold mb-1">Director</h3>
                          <p className="text-gray-600 dark:text-gray-300">{movie.director}</p>
                        </div>
                      )}

                      {/* Cast */}
                      {movie.cast && movie.cast.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-1">Cast</h3>
                          <p className="text-gray-600 dark:text-gray-300">{movie.cast.join(', ')}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={onToggleFavorite}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isFavorite
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>

                        <button
                          onClick={onToggleWatchLater}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isInWatchLater
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={isInWatchLater ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          {isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MovieCard;