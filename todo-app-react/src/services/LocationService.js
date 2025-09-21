// Location-based Reminder Service
// Provides geofencing, location tracking, and proximity-based notifications

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.locationReminders = [];
    this.geofences = new Map();
    this.isTracking = false;

    // Configuration
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      geofenceRadius: 100, // meters
      notificationCooldown: 300000 // 5 minutes between repeat notifications
    };

    // Track last notification times to prevent spam
    this.lastNotificationTime = new Map();

    // Initialize service
    this.init();
  }

  async init() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }

    // Request permission
    const permission = await this.requestLocationPermission();
    if (!permission) {
      console.log('Location permission denied');
      return false;
    }

    // Load saved location reminders
    this.loadLocationReminders();

    return true;
  }

  async requestLocationPermission() {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });

      if (result.state === 'granted') {
        return true;
      } else if (result.state === 'prompt') {
        // Will prompt user when we actually request location
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  // Start tracking user location
  startTracking(callback) {
    if (this.isTracking) {
      console.log('Already tracking location');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // Check geofences
        this.checkGeofences();

        // Call callback if provided
        if (callback) {
          callback(this.currentLocation);
        }
      },
      (error) => {
        console.error('Location error:', error);
        this.handleLocationError(error);
      },
      this.config
    );

    this.isTracking = true;
  }

  // Stop tracking
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  // Get current location once
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        this.config
      );
    });
  }

  // Add location-based reminder
  addLocationReminder(reminder) {
    const locationReminder = {
      id: Date.now().toString(),
      ...reminder,
      createdAt: new Date().toISOString(),
      triggered: false,
      active: true
    };

    this.locationReminders.push(locationReminder);
    this.createGeofence(locationReminder);
    this.saveLocationReminders();

    return locationReminder;
  }

  // Create geofence for a reminder
  createGeofence(reminder) {
    const geofence = {
      id: reminder.id,
      center: {
        latitude: reminder.location.latitude,
        longitude: reminder.location.longitude
      },
      radius: reminder.radius || this.config.geofenceRadius,
      reminder: reminder
    };

    this.geofences.set(reminder.id, geofence);
  }

  // Check if user entered/exited any geofences
  checkGeofences() {
    if (!this.currentLocation) return;

    this.geofences.forEach((geofence) => {
      const distance = this.calculateDistance(
        this.currentLocation.latitude,
        this.currentLocation.longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );

      const isInside = distance <= geofence.radius;
      const reminder = geofence.reminder;

      // Check if we should trigger the reminder
      if (reminder.active && !reminder.triggered) {
        if (reminder.trigger === 'enter' && isInside) {
          this.triggerLocationReminder(reminder);
        } else if (reminder.trigger === 'exit' && !isInside && reminder.wasInside) {
          this.triggerLocationReminder(reminder);
        }
      }

      // Update state
      reminder.wasInside = isInside;
    });
  }

  // Trigger location reminder
  triggerLocationReminder(reminder) {
    // Check cooldown
    const lastTime = this.lastNotificationTime.get(reminder.id);
    const now = Date.now();

    if (lastTime && (now - lastTime) < this.config.notificationCooldown) {
      return; // Skip if within cooldown period
    }

    // Mark as triggered
    reminder.triggered = true;
    this.lastNotificationTime.set(reminder.id, now);

    // Show notification
    this.showNotification(reminder);

    // Handle repeat reminders
    if (reminder.repeat) {
      setTimeout(() => {
        reminder.triggered = false;
      }, this.config.notificationCooldown);
    } else {
      reminder.active = false;
    }

    this.saveLocationReminders();
  }

  // Show notification
  showNotification(reminder) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(reminder.title || 'Location Reminder', {
        body: reminder.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true,
        actions: reminder.actions || []
      });

      notification.onclick = () => {
        // Handle notification click
        if (reminder.onClick) {
          reminder.onClick();
        }
        notification.close();
      };
    }

    // Also trigger in-app notification
    if (reminder.callback) {
      reminder.callback(reminder);
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Get nearby places using reverse geocoding
  async getNearbyPlaces(latitude, longitude) {
    try {
      // Using OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (response.ok) {
        const data = await response.json();
        return this.parseNearbyPlaces(data);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }

    return [];
  }

  // Parse nearby places from API response
  parseNearbyPlaces(data) {
    const places = [];

    if (data.address) {
      // Common place types
      const placeTypes = [
        { key: 'shop', label: 'Store', icon: '🏪' },
        { key: 'supermarket', label: 'Supermarket', icon: '🛒' },
        { key: 'restaurant', label: 'Restaurant', icon: '🍽️' },
        { key: 'cafe', label: 'Cafe', icon: '☕' },
        { key: 'bank', label: 'Bank', icon: '🏦' },
        { key: 'hospital', label: 'Hospital', icon: '🏥' },
        { key: 'school', label: 'School', icon: '🏫' },
        { key: 'university', label: 'University', icon: '🎓' },
        { key: 'gym', label: 'Gym', icon: '💪' },
        { key: 'park', label: 'Park', icon: '🌳' },
        { key: 'pharmacy', label: 'Pharmacy', icon: '💊' },
        { key: 'gas_station', label: 'Gas Station', icon: '⛽' }
      ];

      placeTypes.forEach(type => {
        if (data.address[type.key]) {
          places.push({
            name: data.address[type.key],
            type: type.label,
            icon: type.icon,
            address: data.display_name,
            location: {
              latitude: parseFloat(data.lat),
              longitude: parseFloat(data.lon)
            }
          });
        }
      });

      // Add general location if no specific place found
      if (places.length === 0 && data.display_name) {
        places.push({
          name: data.display_name.split(',')[0],
          type: 'Location',
          icon: '📍',
          address: data.display_name,
          location: {
            latitude: parseFloat(data.lat),
            longitude: parseFloat(data.lon)
          }
        });
      }
    }

    return places;
  }

  // Smart location suggestions based on user patterns
  async getSmartSuggestions() {
    const suggestions = [];

    // Time-based suggestions
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 9) {
      suggestions.push({
        title: 'Morning Routine',
        places: ['Gym', 'Coffee Shop', 'Office'],
        reminders: [
          { title: 'Morning workout', message: 'Time for your morning exercise!' },
          { title: 'Grab coffee', message: 'Get your morning coffee' }
        ]
      });
    } else if (hour >= 11 && hour < 14) {
      suggestions.push({
        title: 'Lunch Time',
        places: ['Restaurant', 'Cafe', 'Food Court'],
        reminders: [
          { title: 'Lunch break', message: 'Time to grab lunch!' },
          { title: 'Pick up food', message: 'Don\'t forget to pick up your order' }
        ]
      });
    } else if (hour >= 17 && hour < 20) {
      suggestions.push({
        title: 'Evening Errands',
        places: ['Grocery Store', 'Pharmacy', 'Gas Station'],
        reminders: [
          { title: 'Grocery shopping', message: 'Pick up items from your shopping list' },
          { title: 'Pharmacy', message: 'Pick up prescription' }
        ]
      });
    }

    // Frequent locations
    if (this.currentLocation) {
      const nearby = await this.getNearbyPlaces(
        this.currentLocation.latitude,
        this.currentLocation.longitude
      );

      if (nearby.length > 0) {
        suggestions.push({
          title: 'Nearby Places',
          places: nearby.map(p => p.name),
          reminders: nearby.map(p => ({
            title: `At ${p.name}`,
            message: `Remember to check your tasks for ${p.type}`,
            location: p.location
          }))
        });
      }
    }

    return suggestions;
  }

  // Save reminders to localStorage
  saveLocationReminders() {
    try {
      localStorage.setItem('locationReminders', JSON.stringify(this.locationReminders));
    } catch (error) {
      console.error('Error saving location reminders:', error);
    }
  }

  // Load reminders from localStorage
  loadLocationReminders() {
    try {
      const saved = localStorage.getItem('locationReminders');
      if (saved) {
        this.locationReminders = JSON.parse(saved);

        // Recreate geofences
        this.locationReminders.forEach(reminder => {
          if (reminder.active) {
            this.createGeofence(reminder);
          }
        });
      }
    } catch (error) {
      console.error('Error loading location reminders:', error);
    }
  }

  // Get all location reminders
  getLocationReminders() {
    return this.locationReminders;
  }

  // Update location reminder
  updateLocationReminder(id, updates) {
    const index = this.locationReminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.locationReminders[index] = {
        ...this.locationReminders[index],
        ...updates
      };

      // Update geofence
      if (updates.location || updates.radius) {
        this.geofences.delete(id);
        this.createGeofence(this.locationReminders[index]);
      }

      this.saveLocationReminders();
      return true;
    }
    return false;
  }

  // Delete location reminder
  deleteLocationReminder(id) {
    this.locationReminders = this.locationReminders.filter(r => r.id !== id);
    this.geofences.delete(id);
    this.lastNotificationTime.delete(id);
    this.saveLocationReminders();
  }

  // Handle location errors
  handleLocationError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.error("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.error("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.error("The request to get user location timed out.");
        break;
      default:
        console.error("An unknown error occurred.");
        break;
    }
  }
}

export default new LocationService();