import Papa from 'papaparse';

class SmartMovieService {
  constructor() {
    this.movies = [];
    this.isLoaded = false;
    this.loadingPromise = null;
    this.csvPath = '/imdb_top_1000.csv'; // CSV file is in public folder

    // Smart recommendation messages
    this.recommendationMessages = [
      "Our AI picked these just for you",
      "Based on your mood",
      "Specially curated recommendations",
      "Handpicked by our algorithm",
      "Perfect matches for you",
      "Discovered these gems",
      "You might enjoy these"
    ];

    // Mood to genre mapping
    this.moodGenreMap = {
      'happy': ['Comedy', 'Animation', 'Musical', 'Family'],
      'sad': ['Drama', 'Romance', 'Biography'],
      'excited': ['Action', 'Adventure', 'Thriller', 'Sci-Fi'],
      'relaxed': ['Comedy', 'Romance', 'Family', 'Animation'],
      'scared': ['Horror', 'Thriller', 'Mystery'],
      'thoughtful': ['Drama', 'Documentary', 'Biography', 'History'],
      'romantic': ['Romance', 'Drama'],
      'adventurous': ['Adventure', 'Action', 'Fantasy']
    };
  }

  // Load CSV data
  async loadMoviesData() {
    if (this.isLoaded) return this.movies;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(this.csvPath);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            this.movies = results.data
              .filter(movie => movie.Series_Title) // Filter out empty rows
              .map((movie, index) => this.transformMovieData(movie, index));
            this.isLoaded = true;
            resolve(this.movies);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Error loading movie data:', error);
        this.loadingPromise = null;
        reject(error);
      }
    });

    return this.loadingPromise;
  }

  // Transform CSV data to our simplified format
  transformMovieData(csvMovie, index) {
    return {
      id: `movie-${index}`,
      title: csvMovie.Series_Title || 'Unknown',
      year: parseInt(csvMovie.Released_Year) || 2000,
      runtime: csvMovie.Runtime || 'N/A',
      genres: csvMovie.Genre ? csvMovie.Genre.split(',').map(g => g.trim()) : [],
      rating: parseFloat(csvMovie.IMDB_Rating) || 0,
      overview: csvMovie.Overview || 'No description available',
      poster: csvMovie.Poster_Link || 'https://via.placeholder.com/300x450?text=No+Poster'
    };
  }

  // Get random recommendation message
  getRandomMessage() {
    return this.recommendationMessages[
      Math.floor(Math.random() * this.recommendationMessages.length)
    ];
  }

  // Main recommendation function - simplified
  async getRecommendations(filters = {}) {
    await this.loadMoviesData();

    let recommendations = [...this.movies];
    const { genre, year, language, limit = 6, offset = 0 } = filters;

    // Filter by genre
    if (genre && genre !== '') {
      recommendations = recommendations.filter(movie =>
        movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    // Filter by year
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        // Filter by decade
        const startYear = Math.floor(yearNum / 10) * 10;
        const endYear = startYear + 9;
        recommendations = recommendations.filter(movie =>
          movie.year >= startYear && movie.year <= endYear
        );
      }
    }

    // Note: Language filtering would require language data in CSV
    // For now, we'll use it to add variety by shuffling differently
    if (language) {
      // Use language as seed for different shuffling
      const seed = language.charCodeAt(0) + (offset || 0);
      recommendations = this.shuffleArrayWithSeed(recommendations, seed);
    } else {
      recommendations = this.shuffleArray(recommendations);
    }

    // Sort by rating (best first) before shuffling
    recommendations.sort((a, b) => b.rating - a.rating);

    // Apply offset for pagination/variety
    const startIdx = Math.min(offset, recommendations.length);
    const endIdx = Math.min(startIdx + limit, recommendations.length);

    return {
      success: true,
      movies: recommendations.slice(startIdx, endIdx),
      message: this.getRandomMessage(),
      totalResults: recommendations.length
    };
  }

  // Shuffle with seed for consistent but different results
  shuffleArrayWithSeed(array, seed) {
    const shuffled = [...array];
    let currentSeed = seed;

    const random = () => {
      const x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Shuffle array for variety
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get trending (high-rated recent movies)
  async getTrending() {
    await this.loadMoviesData();

    const recentMovies = this.movies
      .filter(movie => movie.year >= 2010)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);

    return {
      success: true,
      movies: recentMovies,
      message: 'Trending movies everyone\'s watching'
    };
  }

  // Save favorite movie to tracking
  async saveFavorite(movie) {
    try {
      // Get existing favorites
      const favorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');

      // Add new favorite with date
      const favoriteEntry = {
        movieName: movie.title,
        date: new Date().toISOString().split('T')[0],
        rating: movie.rating,
        year: movie.year
      };

      // Check if already favorited
      const exists = favorites.some(f => f.movieName === movie.title);
      if (!exists) {
        favorites.push(favoriteEntry);
        localStorage.setItem('movieFavorites', JSON.stringify(favorites));

        // Also save to Google Sheets if connected
        if (window.googleSheetsService && window.googleSheetsService.isInitialized) {
          await window.googleSheetsService.appendData('MovieFavorites', [
            [favoriteEntry.date, favoriteEntry.movieName, favoriteEntry.year, favoriteEntry.rating]
          ]);
        }
      }

      return { success: true, message: 'Added to favorites!' };
    } catch (error) {
      console.error('Error saving favorite:', error);
      return { success: false, message: 'Failed to save favorite' };
    }
  }

  // Remove favorite
  async removeFavorite(movieTitle) {
    try {
      const favorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');
      const filtered = favorites.filter(f => f.movieName !== movieTitle);
      localStorage.setItem('movieFavorites', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { success: false };
    }
  }

  // Check if movie is favorited
  isFavorited(movieTitle) {
    const favorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');
    return favorites.some(f => f.movieName === movieTitle);
  }

  // Get all favorites
  getFavorites() {
    return JSON.parse(localStorage.getItem('movieFavorites') || '[]');
  }
}

export default new SmartMovieService();