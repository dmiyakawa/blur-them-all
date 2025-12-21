// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'bta_settings',
  LAST_SESSION_ID: 'bta_last_session_id',
} as const;

// IndexedDB configuration
export const DB_CONFIG = {
  NAME: 'BlurThemAllDB',
  VERSION: 1,
  STORES: {
    IMAGES: 'images',
    THUMBNAILS: 'thumbnails',
  },
} as const;

// File configuration
export const FILE_CONFIG = {
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  EXPORT_FORMAT: 'image/png',
  EXPORT_QUALITY: 0.95,
} as const;

// Canvas configuration
export const CANVAS_CONFIG = {
  MAX_WIDTH: 4096,
  MAX_HEIGHT: 4096,
  BACKGROUND_COLOR: '#ffffff',
} as const;

// Tool configuration
export const TOOL_CONFIG = {
  PEN: {
    MIN_WIDTH: 1,
    MAX_WIDTH: 20,
    DEFAULT_WIDTH: 3,
    DEFAULT_COLOR: '#ff0000',
  },
  ARROW: {
    MIN_WIDTH: 1,
    MAX_WIDTH: 10,
    DEFAULT_WIDTH: 3,
    MIN_HEAD_SIZE: 5,
    MAX_HEAD_SIZE: 30,
    DEFAULT_HEAD_SIZE: 10,
    DEFAULT_COLOR: '#ff0000',
  },
  BLUR: {
    MIN_STRENGTH: 1,
    MAX_STRENGTH: 20,
    DEFAULT_STRENGTH: 10,
  },
  MOSAIC: {
    MIN_BLOCK_SIZE: 4,
    MAX_BLOCK_SIZE: 32,
    DEFAULT_BLOCK_SIZE: 10,
  },
} as const;

// UI configuration
export const UI_CONFIG = {
  AUTO_SAVE_DEBOUNCE: 30000, // 30 seconds
  HISTORY_MAX_SIZE: 30,
  TOAST_DURATION: 3000, // 3 seconds
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'ファイルサイズが大きすぎます（最大10MB）',
  INVALID_FILE_TYPE: '対応していないファイル形式です',
  IMAGE_LOAD_FAILED: '画像の読み込みに失敗しました',
  STORAGE_FAILED: 'データの保存に失敗しました',
  EXPORT_FAILED: '画像のエクスポートに失敗しました',
  INDEXEDDB_NOT_SUPPORTED: 'ブラウザがIndexedDBに対応していません',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  IMAGE_LOADED: '画像を読み込みました',
  IMAGE_SAVED: '画像を保存しました',
  IMAGE_EXPORTED: '画像をエクスポートしました',
  EFFECT_APPLIED: 'エフェクトを適用しました',
} as const;
