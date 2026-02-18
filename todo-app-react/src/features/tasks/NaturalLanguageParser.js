// Natural Language Processing for Task Input
export class NaturalLanguageParser {
  constructor() {
    this.timePatterns = [
      // Time patterns
      { pattern: /at (\d{1,2}):?(\d{0,2})\s*(am|pm|AM|PM)?/gi, type: 'time' },
      { pattern: /(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?/gi, type: 'time' },
      { pattern: /(morning|afternoon|evening|night)/gi, type: 'timeOfDay' },

      // Date patterns
      { pattern: /(today|tomorrow|yesterday)/gi, type: 'relativeDate' },
      { pattern: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, type: 'weekday' },
      { pattern: /(next week|this week|next month|this month)/gi, type: 'relativePeriod' },
      { pattern: /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/g, type: 'date' },
      { pattern: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/gi, type: 'monthDay' },

      // Priority patterns
      { pattern: /(urgent|important|high priority|asap|!!)/gi, type: 'highPriority' },
      { pattern: /(low priority|later|when possible)/gi, type: 'lowPriority' },

      // Duration patterns
      { pattern: /(for|takes?|duration)\s+(\d+)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)/gi, type: 'duration' },

      // Location patterns — negative lookahead prevents matching pure time tokens like "at 3pm" / "at 14:00"
      // Only matches locations that start with a letter (not a digit), e.g. "at the gym", "in office"
      { pattern: /(at|in|@)\s+(?!\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b)([a-zA-Z][a-zA-Z0-9\s]{1,30}?)(?=\s|$)/gi, type: 'location' },

      // Category patterns
      { pattern: /#(\w+)/g, type: 'tag' },
      { pattern: /\b(meeting|call|email|review|research|buy|read|write|plan|study|exercise|workout|appointment|deadline)\b/gi, type: 'category' }
    ];

    this.priorityMap = {
      'urgent': 'high',
      'important': 'high',
      'high priority': 'high',
      'asap': 'high',
      '!!': 'high',
      'low priority': 'low',
      'later': 'low',
      'when possible': 'low'
    };

    this.timeOfDayMap = {
      'morning': '09:00',
      'afternoon': '14:00',
      'evening': '18:00',
      'night': '20:00'
    };

    this.weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    this.months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
  }

  parse(input) {
    const originalText = input.trim();
    let cleanText = originalText;
    const extracted = {
      text: '',
      time: null,
      date: null,
      priority: 'medium',
      duration: null,
      location: null,
      tags: [],
      category: null,
      reminder: null
    };

    // Extract patterns
    this.timePatterns.forEach(({ pattern, type }) => {
      const matches = [...originalText.matchAll(pattern)];
      matches.forEach(match => {
        this.processMatch(match, type, extracted);
        // Remove matched text from clean version
        cleanText = cleanText.replace(match[0], ' ').replace(/\s+/g, ' ');
      });
    });

    // Clean up the text
    extracted.text = cleanText.trim() || originalText;

    // Set default date if none specified
    if (!extracted.date) {
      extracted.date = new Date().toISOString().split('T')[0];
    }

    // Generate suggestions for ambiguous input
    const suggestions = this.generateSuggestions(originalText, extracted);

    return {
      ...extracted,
      suggestions,
      confidence: this.calculateConfidence(originalText, extracted)
    };
  }

  processMatch(match, type, extracted) {
    const matchText = match[0].toLowerCase();

    switch (type) {
      case 'time':
        extracted.time = this.parseTime(match);
        break;

      case 'timeOfDay':
        extracted.time = this.timeOfDayMap[matchText];
        break;

      case 'relativeDate':
        extracted.date = this.parseRelativeDate(matchText);
        break;

      case 'weekday':
        extracted.date = this.parseWeekday(matchText);
        break;

      case 'relativePeriod':
        extracted.date = this.parseRelativePeriod(matchText);
        break;

      case 'date':
        extracted.date = this.parseDate(match);
        break;

      case 'monthDay':
        extracted.date = this.parseMonthDay(match);
        break;

      case 'highPriority':
        extracted.priority = 'high';
        break;

      case 'lowPriority':
        extracted.priority = 'low';
        break;

      case 'duration':
        extracted.duration = this.parseDuration(match);
        break;

      case 'location':
        extracted.location = match[2].trim();
        break;

      case 'tag':
        extracted.tags.push(match[1]);
        break;

      case 'category':
        extracted.category = matchText;
        break;
    }
  }

  parseTime(match) {
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const period = match[3]?.toLowerCase();

    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  parseRelativeDate(text) {
    const today = new Date();
    const date = new Date(today);

    switch (text.toLowerCase()) {
      case 'today':
        break;
      case 'tomorrow':
        date.setDate(today.getDate() + 1);
        break;
      case 'yesterday':
        date.setDate(today.getDate() - 1);
        break;
    }

    return date.toISOString().split('T')[0];
  }

  parseWeekday(weekdayName) {
    const today = new Date();
    const targetDay = this.weekdays.indexOf(weekdayName.toLowerCase());
    const currentDay = today.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    return targetDate.toISOString().split('T')[0];
  }

  parseRelativePeriod(text) {
    const today = new Date();
    const date = new Date(today);

    switch (text.toLowerCase()) {
      case 'next week':
        date.setDate(today.getDate() + 7);
        break;
      case 'this week':
        // Find next Monday
        const daysToMonday = (1 - today.getDay() + 7) % 7 || 7;
        date.setDate(today.getDate() + daysToMonday);
        break;
      case 'next month':
        date.setMonth(today.getMonth() + 1, 1);
        break;
      case 'this month':
        date.setDate(today.getDate() + 1);
        break;
    }

    return date.toISOString().split('T')[0];
  }

  parseDate(match) {
    const month = parseInt(match[1]) - 1; // JS months are 0-indexed
    const day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  }

  parseMonthDay(match) {
    const monthName = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const monthIndex = this.months.indexOf(monthName);

    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, monthIndex, day);

    // If the date is in the past, assume next year
    if (date < new Date()) {
      date.setFullYear(currentYear + 1);
    }

    return date.toISOString().split('T')[0];
  }

  parseDuration(match) {
    const amount = parseInt(match[2]);
    const unit = match[3].toLowerCase();

    let minutes = amount;
    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      minutes = amount * 60;
    }

    return minutes;
  }

  generateSuggestions(originalText, extracted) {
    const suggestions = [];

    // Time suggestions
    if (!extracted.time && (originalText.includes('meet') || originalText.includes('call'))) {
      suggestions.push({
        type: 'time',
        text: 'Add a time?',
        options: ['9:00 AM', '2:00 PM', '5:00 PM']
      });
    }

    // Date suggestions
    if (extracted.date === new Date().toISOString().split('T')[0] &&
        !originalText.match(/(today|tonight|this)/i)) {
      suggestions.push({
        type: 'date',
        text: 'When?',
        options: ['Today', 'Tomorrow', 'This Week']
      });
    }

    // Priority suggestions
    if (originalText.match(/(deadline|due|urgent|important)/i) && extracted.priority === 'medium') {
      suggestions.push({
        type: 'priority',
        text: 'Set priority?',
        options: ['High Priority', 'Normal']
      });
    }

    return suggestions;
  }

  calculateConfidence(originalText, extracted) {
    let score = 0.5; // Base confidence

    // Increase confidence for recognized patterns
    if (extracted.time) score += 0.2;
    if (extracted.date !== new Date().toISOString().split('T')[0]) score += 0.1;
    if (extracted.priority !== 'medium') score += 0.1;
    if (extracted.category) score += 0.1;
    if (extracted.tags.length > 0) score += 0.1;

    return Math.min(score, 1.0);
  }

  // Helper method to get quick suggestions for common tasks
  getQuickSuggestions() {
    return [
      'Call John at 2pm tomorrow',
      'Meeting with team this Friday at 10am',
      'Buy groceries today',
      'Review project deadline next week',
      'Workout at gym 6pm #fitness',
      'Email client urgent response needed',
      'Read book for 30 minutes',
      'Plan vacation next month'
    ];
  }
}

export default new NaturalLanguageParser();