// Premium Theme Configuration inspired by Notion, Todoist, Any.do, and Forest App

export const themes = {
  // Inspired by Notion's clean aesthetics
  notion: {
    name: 'Notion Clean',
    primary: '#000000',
    secondary: '#37352F',
    accent: '#2EAADC',
    background: '#FFFFFF',
    surface: '#F7F6F3',
    text: '#37352F',
    textSecondary: '#787774',
    success: '#0F7938',
    warning: '#D9730D',
    error: '#E03E3E',
    info: '#2E90FF',
    border: '#E9E9E7',
    hover: '#F1F1EF',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    cardShadow: '0 2px 4px rgba(0,0,0,0.05)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif'
  },

  // Inspired by Todoist's vibrant productivity theme
  todoist: {
    name: 'Todoist Vibrant',
    primary: '#DC4C3E',
    secondary: '#F9A825',
    accent: '#299438',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#202020',
    textSecondary: '#666666',
    success: '#299438',
    warning: '#F9A825',
    error: '#DC4C3E',
    info: '#4073FF',
    border: '#E0E0E0',
    hover: '#F5F5F5',
    gradient: 'linear-gradient(135deg, #DC4C3E 0%, #F9A825 100%)',
    shadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
    cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontFamily: '"Graphik", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  // Inspired by Any.do's minimalist approach
  anydo: {
    name: 'Any.do Minimal',
    primary: '#4A90E2',
    secondary: '#50E3C2',
    accent: '#F5A623',
    background: '#FFFFFF',
    surface: '#FAFBFC',
    text: '#2C3E50',
    textSecondary: '#7B8794',
    success: '#50E3C2',
    warning: '#F5A623',
    error: '#E85D75',
    info: '#4A90E2',
    border: '#E1E4E8',
    hover: '#F6F8FA',
    gradient: 'linear-gradient(135deg, #4A90E2 0%, #50E3C2 100%)',
    shadow: '0 2px 4px 0 rgba(0,0,0,0.08)',
    cardShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontFamily: '"San Francisco", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  // Inspired by Forest App's nature theme
  forest: {
    name: 'Forest Focus',
    primary: '#52C41A',
    secondary: '#8BC34A',
    accent: '#CDDC39',
    background: '#F0F4EC',
    surface: '#FFFFFF',
    text: '#1B3409',
    textSecondary: '#52734D',
    success: '#52C41A',
    warning: '#FFA726',
    error: '#F44336',
    info: '#03A9F4',
    border: '#D4E7C5',
    hover: '#E8F5E9',
    gradient: 'linear-gradient(135deg, #52C41A 0%, #8BC34A 100%)',
    shadow: '0 2px 8px 0 rgba(82,196,26,0.15)',
    cardShadow: '0 4px 16px rgba(82,196,26,0.1)',
    fontFamily: '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  // Premium Dark Mode inspired by Linear & Vercel
  linearDark: {
    name: 'Linear Dark',
    primary: '#5E6AD2',
    secondary: '#26C281',
    accent: '#F2B94F',
    background: '#0E0E10',
    surface: '#161618',
    text: '#FFFFFF',
    textSecondary: '#8A8F98',
    success: '#26C281',
    warning: '#F2B94F',
    error: '#EB5757',
    info: '#5E6AD2',
    border: '#232326',
    hover: '#1C1C1F',
    gradient: 'linear-gradient(135deg, #5E6AD2 0%, #26C281 100%)',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.4)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.4)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },

  // Soft Pastel Theme inspired by Bear App
  bear: {
    name: 'Bear Soft',
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
    background: '#FDF6F0',
    surface: '#FFFFFF',
    text: '#2D3436',
    textSecondary: '#636E72',
    success: '#4ECDC4',
    warning: '#FFE66D',
    error: '#FF6B6B',
    info: '#74B9FF',
    border: '#F5E6D8',
    hover: '#FFF5ED',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    shadow: '0 2px 8px 0 rgba(255,107,107,0.1)',
    cardShadow: '0 4px 16px rgba(255,107,107,0.15)',
    fontFamily: '"Avenir", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }
};

// Notes section color palettes (inspired by Apple Notes, Notion, and Roam)
export const noteThemes = {
  apple: [
    { name: 'Yellow', bg: '#FFFACD', text: '#333333', border: '#F0E68C' },
    { name: 'Pink', bg: '#FFE4E1', text: '#333333', border: '#FFB6C1' },
    { name: 'Blue', bg: '#E0F2FF', text: '#333333', border: '#87CEEB' },
    { name: 'Green', bg: '#F0FFF0', text: '#333333', border: '#90EE90' },
    { name: 'Purple', bg: '#F5F0FF', text: '#333333', border: '#DDA0DD' },
    { name: 'Orange', bg: '#FFF5EE', text: '#333333', border: '#FFDAB9' }
  ],

  notion: [
    { name: 'Default', bg: '#FFFFFF', text: '#37352F', border: '#E9E9E7' },
    { name: 'Gray', bg: '#F1F1EF', text: '#37352F', border: '#E9E9E7' },
    { name: 'Brown', bg: '#F4EEEE', text: '#37352F', border: '#E9D5D3' },
    { name: 'Red', bg: '#FDEBEC', text: '#37352F', border: '#FFD6D9' },
    { name: 'Yellow', bg: '#FBEECD', text: '#37352F', border: '#FADFB3' },
    { name: 'Blue', bg: '#E7F3F8', text: '#37352F', border: '#C9E4F0' },
    { name: 'Purple', bg: '#F6F3F9', text: '#37352F', border: '#E8DEEE' },
    { name: 'Green', bg: '#EDF3EC', text: '#37352F', border: '#D4E5D2' }
  ],

  gradient: [
    { name: 'Sunset', bg: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)', text: '#FFFFFF', border: 'none' },
    { name: 'Ocean', bg: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)', text: '#FFFFFF', border: 'none' },
    { name: 'Forest', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', text: '#FFFFFF', border: 'none' },
    { name: 'Lavender', bg: 'linear-gradient(135deg, #C471F5 0%, #FA71CD 100%)', text: '#FFFFFF', border: 'none' },
    { name: 'Warm', bg: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)', text: '#FFFFFF', border: 'none' },
    { name: 'Cool', bg: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', text: '#FFFFFF', border: 'none' }
  ]
};

// Component-specific theme mapping
export const componentThemes = {
  dashboard: {
    cards: 'surface',
    metrics: 'gradient',
    charts: 'primary'
  },
  tasks: {
    priority: {
      high: 'error',
      medium: 'warning',
      low: 'success'
    },
    completed: 'success',
    pending: 'textSecondary'
  },
  expenses: {
    income: 'success',
    expense: 'error',
    budget: 'warning'
  },
  habits: {
    streak: 'accent',
    completed: 'success',
    missed: 'error'
  },
  meals: {
    breakfast: '#FFB347',
    lunch: '#77DD77',
    dinner: '#AEC6CF',
    snack: '#FFD1DC'
  },
  alarms: {
    active: 'primary',
    snoozed: 'warning',
    disabled: 'textSecondary'
  },
  movies: {
    rating: {
      high: '#FFD700',
      medium: '#C0C0C0',
      low: '#CD7F32'
    }
  }
};

// Animation and transition presets
export const transitions = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  swift: 'all 0.2s ease-in-out',
  spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// Micro-interactions and hover effects
export const interactions = {
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
  },
  itemSelect: {
    transform: 'scale(0.98)',
    opacity: '0.8'
  },
  pulseAnimation: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }
};

// Neumorphism effects for modern depth
export const neumorphism = {
  flat: {
    background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
    boxShadow: '5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff'
  },
  pressed: {
    background: 'linear-gradient(145deg, #d1d1d1, #f5f5f5)',
    boxShadow: 'inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff'
  },
  elevated: {
    background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
    boxShadow: '20px 20px 60px #d1d1d1, -20px -20px 60px #ffffff'
  }
};

// Export default theme
export default themes.notion;