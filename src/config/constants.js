// Application constants and configuration

export const APP_NAME = 'Premium AI Catalog';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Interactive catalog of AI components';

// Component types
export const COMPONENT_TYPES = {
  MODEL: 'model',
  DATASET: 'dataset',
  PROMPT: 'prompt'
};

// Sort options
export const SORT_OPTIONS = {
  NAME: 'name',
  TYPE: 'type',
  RECENT: 'recent'
};

// View modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Local storage keys
export const STORAGE_KEYS = {
  FAVORITES: 'ai-catalog-favorites',
  DARK_MODE: 'ai-catalog-dark-mode',
  VIEW_MODE: 'ai-catalog-view-mode',
  SORT_BY: 'ai-catalog-sort-by'
};

// API endpoints (if backend is implemented)
export const API_ENDPOINTS = {
  COMPONENTS: '/api/components',
  SEARCH: '/api/search',
  FAVORITES: '/api/favorites'
};

// Feature flags
export const FEATURES = {
  ENABLE_EXPORT: true,
  ENABLE_FAVORITES: true,
  ENABLE_DARK_MODE: true,
  ENABLE_ADVANCED_SEARCH: true
};

// UI Constants
export const ITEMS_PER_PAGE = 12;
export const ANIMATION_DURATION = 300;
export const TOAST_DURATION = 3000;

// Export formats
export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  MARKDOWN: 'markdown'
};