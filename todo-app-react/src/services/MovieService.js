class MovieService {
  constructor() {
    this.apiKey = '536889987amsh18b114e0595340cp1bece7jsn53ce4ae95a3b';

    // Primary API
    this.primaryApi = {
      host: 'ai-movie-recommender.p.rapidapi.com',
      baseUrl: 'https://ai-movie-recommender.p.rapidapi.com/api'
    };

    // Backup API
    this.backupApi = {
      host: 'list-movies-v3.p.rapidapi.com',
      baseUrl: 'https://list-movies-v3.p.rapidapi.com'
    };

    this.currentApi = 'primary';

    // Fallback movie database for when API is unavailable
    this.fallbackMovies = {
      'action': [
        {
          title: "Mad Max: Fury Road",
          year: 2015,
          genre: ["Action", "Adventure", "Sci-Fi"],
          rating: 8.1,
          description: "In a post-apocalyptic wasteland, Max teams up with Furiosa to flee from cult leader Immortan Joe and his army.",
          director: "George Miller",
          cast: ["Tom Hardy", "Charlize Theron"],
          poster: "https://via.placeholder.com/300x450?text=Mad+Max"
        },
        {
          title: "John Wick",
          year: 2014,
          genre: ["Action", "Crime", "Thriller"],
          rating: 7.4,
          description: "An ex-hit-man comes out of retirement to track down the gangsters that took everything from him.",
          director: "Chad Stahelski",
          cast: ["Keanu Reeves", "Michael Nyqvist"],
          poster: "https://via.placeholder.com/300x450?text=John+Wick"
        }
      ],
      'comedy': [
        {
          title: "The Grand Budapest Hotel",
          year: 2014,
          genre: ["Adventure", "Comedy", "Crime"],
          rating: 8.1,
          description: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy.",
          director: "Wes Anderson",
          cast: ["Ralph Fiennes", "F. Murray Abraham"],
          poster: "https://via.placeholder.com/300x450?text=Grand+Budapest"
        },
        {
          title: "Knives Out",
          year: 2019,
          genre: ["Comedy", "Crime", "Drama"],
          rating: 7.9,
          description: "A detective investigates the death of a patriarch of an eccentric, combative family.",
          director: "Rian Johnson",
          cast: ["Daniel Craig", "Chris Evans"],
          poster: "https://via.placeholder.com/300x450?text=Knives+Out"
        }
      ],
      'drama': [
        {
          title: "Parasite",
          year: 2019,
          genre: ["Comedy", "Drama", "Thriller"],
          rating: 8.6,
          description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
          director: "Bong Joon Ho",
          cast: ["Kang-ho Song", "Sun-kyun Lee"],
          poster: "https://via.placeholder.com/300x450?text=Parasite"
        },
        {
          title: "The Social Network",
          year: 2010,
          genre: ["Biography", "Drama"],
          rating: 7.7,
          description: "The story of how one of the most popular social media platforms was founded.",
          director: "David Fincher",
          cast: ["Jesse Eisenberg", "Andrew Garfield"],
          poster: "https://via.placeholder.com/300x450?text=Social+Network"
        }
      ],
      'horror': [
        {
          title: "Get Out",
          year: 2017,
          genre: ["Horror", "Mystery", "Thriller"],
          rating: 7.7,
          description: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness becomes a nightmare.",
          director: "Jordan Peele",
          cast: ["Daniel Kaluuya", "Allison Williams"],
          poster: "https://via.placeholder.com/300x450?text=Get+Out"
        },
        {
          title: "Hereditary",
          year: 2018,
          genre: ["Drama", "Horror", "Mystery"],
          rating: 7.3,
          description: "A grieving family is haunted by tragedy and disturbing secrets.",
          director: "Ari Aster",
          cast: ["Toni Collette", "Milly Shapiro"],
          poster: "https://via.placeholder.com/300x450?text=Hereditary"
        }
      ],
      'sci-fi': [
        {
          title: "Blade Runner 2049",
          year: 2017,
          genre: ["Action", "Drama", "Mystery"],
          rating: 8.0,
          description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.",
          director: "Denis Villeneuve",
          cast: ["Ryan Gosling", "Harrison Ford"],
          poster: "https://via.placeholder.com/300x450?text=Blade+Runner"
        },
        {
          title: "Arrival",
          year: 2016,
          genre: ["Drama", "Mystery", "Sci-Fi"],
          rating: 7.9,
          description: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
          director: "Denis Villeneuve",
          cast: ["Amy Adams", "Jeremy Renner"],
          poster: "https://via.placeholder.com/300x450?text=Arrival"
        }
      ]
    };

    this.moodCategories = {
      'happy': ['comedy', 'animation', 'musical'],
      'sad': ['drama', 'romance'],
      'excited': ['action', 'adventure', 'thriller'],
      'relaxed': ['comedy', 'romance', 'family'],
      'scared': ['horror', 'thriller'],
      'thoughtful': ['drama', 'documentary', 'sci-fi'],
      'nostalgic': ['classic', 'family', 'animation'],
      'romantic': ['romance', 'drama', 'comedy']
    };
  }

  // Main API call to get movie recommendations
  async getMovieRecommendations(query, options = {}) {
    try {
      // Try primary API first
      let result = await this.callPrimaryApi(query);

      if (!result.success) {
        console.log('Primary API failed, trying backup API...');
        result = await this.callBackupApi(query);
      }

      if (result.success) {
        return result;
      }

      throw new Error('Both APIs failed');

    } catch (error) {
      console.error('Movie API Error:', error);
      return this.getFallbackRecommendations(query, options);
    }
  }

  // Call primary API
  async callPrimaryApi(query) {
    try {
      const searchQuery = encodeURIComponent(query);
      const url = `${this.primaryApi.baseUrl}/search?q=${searchQuery}`;

      console.log('Fetching movies from primary API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.primaryApi.host,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Primary API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.results && Array.isArray(data.results)) {
        return {
          success: true,
          movies: this.formatApiMovies(data.results),
          source: 'primary_api'
        };
      }

      throw new Error('Invalid primary API response');

    } catch (error) {
      console.error('Primary API error:', error);
      return { success: false };
    }
  }

  // Call backup API
  async callBackupApi(query) {
    try {
      // The backup API has a different endpoint structure
      const url = `${this.backupApi.baseUrl}/movie_suggestions.json`;

      console.log('Fetching movies from backup API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.backupApi.host,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Backup API Error: ${response.status}`);
      }

      const data = await response.json();

      // The backup API returns data in a different format
      if (data && data.data && data.data.movies) {
        return {
          success: true,
          movies: this.formatBackupApiMovies(data.data.movies, query),
          source: 'backup_api'
        };
      }

      throw new Error('Invalid backup API response');

    } catch (error) {
      console.error('Backup API error:', error);
      return { success: false };
    }
  }

  // Format API response to consistent format
  formatApiMovies(apiMovies) {
    return apiMovies.map(movie => ({
      title: movie.title || movie.name || 'Unknown Title',
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : movie.year || 'Unknown',
      genre: movie.genre_ids ? this.getGenreNames(movie.genre_ids) : movie.genres || ['Unknown'],
      rating: movie.vote_average || movie.rating || 0,
      description: movie.overview || movie.description || 'No description available',
      director: movie.director || 'Unknown Director',
      cast: movie.cast || [],
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` :
              movie.poster || `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || 'Movie')}`,
      id: movie.id,
      popularity: movie.popularity || 0
    }));
  }

  // Format backup API movies
  formatBackupApiMovies(movies, query) {
    // Filter movies based on query if possible
    const filteredMovies = query ?
      movies.filter(movie => {
        const queryLower = query.toLowerCase();
        return (movie.title && movie.title.toLowerCase().includes(queryLower)) ||
               (movie.summary && movie.summary.toLowerCase().includes(queryLower)) ||
               (movie.genres && movie.genres.toLowerCase().includes(queryLower));
      }) : movies;

    // Take top 20 results
    return filteredMovies.slice(0, 20).map(movie => ({
      title: movie.title || movie.title_english || 'Unknown Title',
      year: movie.year || 'Unknown',
      genre: movie.genres ? movie.genres.split('/').map(g => g.trim()) : ['Unknown'],
      rating: movie.rating || 0,
      description: movie.summary || movie.description_full || 'No description available',
      director: movie.director || 'Unknown Director',
      cast: movie.cast ? movie.cast.split(',').map(c => c.trim()) : [],
      poster: movie.medium_cover_image || movie.large_cover_image ||
              `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || 'Movie')}`,
      id: movie.id || movie.imdb_code || Date.now().toString(),
      popularity: movie.download_count || 0
    }));
  }

  // Map genre IDs to names (common TMDB genre mapping)
  getGenreNames(genreIds) {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };

    return genreIds.map(id => genreMap[id] || 'Unknown').filter(genre => genre !== 'Unknown');
  }

  // Fallback recommendations when API fails
  getFallbackRecommendations(query, options = {}) {
    console.log('Using fallback movie recommendations');

    const queryLower = query.toLowerCase();
    let recommendations = [];

    // Try to match by genre or mood
    Object.keys(this.fallbackMovies).forEach(genre => {
      if (queryLower.includes(genre) || this.isQueryMatchingGenre(queryLower, genre)) {
        recommendations.push(...this.fallbackMovies[genre]);
      }
    });

    // If no genre match, try mood-based recommendations
    if (recommendations.length === 0) {
      const mood = this.detectMoodFromQuery(queryLower);
      if (mood) {
        const genres = this.moodCategories[mood] || [];
        genres.forEach(genre => {
          if (this.fallbackMovies[genre]) {
            recommendations.push(...this.fallbackMovies[genre]);
          }
        });
      }
    }

    // If still no matches, return a variety
    if (recommendations.length === 0) {
      Object.values(this.fallbackMovies).forEach(movies => {
        recommendations.push(...movies.slice(0, 1)); // Take one from each genre
      });
    }

    // Shuffle and limit results
    recommendations = this.shuffleArray(recommendations).slice(0, 10);

    return {
      success: true,
      movies: recommendations,
      source: 'fallback',
      note: 'Showing cached recommendations (API unavailable)'
    };
  }

  // Detect mood from search query
  detectMoodFromQuery(query) {
    const moodKeywords = {
      'happy': ['happy', 'cheerful', 'upbeat', 'fun', 'funny', 'lighthearted'],
      'sad': ['sad', 'emotional', 'tearjerker', 'heartbreaking', 'melancholy'],
      'excited': ['exciting', 'thrilling', 'adrenaline', 'intense', 'fast-paced'],
      'relaxed': ['calm', 'peaceful', 'relaxing', 'gentle', 'easy'],
      'scared': ['scary', 'frightening', 'terrifying', 'spooky', 'creepy'],
      'thoughtful': ['deep', 'meaningful', 'philosophical', 'thought-provoking'],
      'nostalgic': ['nostalgic', 'classic', 'old', 'vintage', 'retro'],
      'romantic': ['romantic', 'love', 'relationship', 'date night']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return mood;
      }
    }

    return null;
  }

  // Check if query matches a genre
  isQueryMatchingGenre(query, genre) {
    const genreKeywords = {
      'action': ['fight', 'battle', 'adventure', 'hero', 'superhero'],
      'comedy': ['funny', 'hilarious', 'laugh', 'humor', 'joke'],
      'drama': ['serious', 'emotional', 'real', 'life', 'character'],
      'horror': ['scary', 'ghost', 'monster', 'fear', 'dark'],
      'sci-fi': ['future', 'space', 'alien', 'technology', 'robot']
    };

    const keywords = genreKeywords[genre] || [];
    return keywords.some(keyword => query.includes(keyword));
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get recommendations by mood
  async getRecommendationsByMood(mood) {
    const moodQueries = {
      'happy': 'uplifting comedy movies',
      'sad': 'emotional drama movies',
      'excited': 'action packed thriller movies',
      'relaxed': 'feel good movies',
      'scared': 'horror thriller movies',
      'thoughtful': 'deep meaningful drama',
      'nostalgic': 'classic movies',
      'romantic': 'romantic love movies'
    };

    const query = moodQueries[mood] || 'popular movies';
    return this.getMovieRecommendations(query);
  }

  // Get trending movies
  async getTrendingMovies() {
    return this.getMovieRecommendations('trending popular movies 2024');
  }

  // Get recommendations by genre
  async getRecommendationsByGenre(genre) {
    return this.getMovieRecommendations(`${genre} movies`);
  }

  // Search movies by specific criteria
  async searchMovies(criteria) {
    const { genre, year, rating, director, actor } = criteria;
    let query = 'movies';

    if (genre) query += ` ${genre}`;
    if (year) query += ` ${year}`;
    if (director) query += ` directed by ${director}`;
    if (actor) query += ` starring ${actor}`;
    if (rating) query += ` highly rated`;

    return this.getMovieRecommendations(query);
  }

  // Get movie details (if API supports it)
  async getMovieDetails(movieId) {
    try {
      // This would be implemented if the API supports detailed movie info
      const response = await fetch(`${this.baseUrl}/movie/${movieId}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }

    // Fallback to basic info
    return null;
  }
}

export default new MovieService();