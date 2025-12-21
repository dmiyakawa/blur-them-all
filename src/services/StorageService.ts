import type { ImageState, AppSettings } from '@/types/image';
import { DEFAULT_SETTINGS } from '@/types/image';
import { DB_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '@/constants';

export class StorageService {
  private db: IDBDatabase | null = null;

  /**
   * IndexedDBを初期化
   */
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn(ERROR_MESSAGES.INDEXEDDB_NOT_SUPPORTED);
        resolve(); // IndexedDBが使えない場合はスキップ
        return;
      }

      const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // imagesストアを作成
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.IMAGES)) {
          db.createObjectStore(DB_CONFIG.STORES.IMAGES, { keyPath: 'id' });
        }

        // thumbnailsストアを作成（将来の拡張用）
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.THUMBNAILS)) {
          db.createObjectStore(DB_CONFIG.STORES.THUMBNAILS, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 画像状態を保存
   */
  async saveImageState(imageState: ImageState): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB is not initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.IMAGES);

      // ImageDataは直接保存できないため、シリアライズ可能な形式に変換
      const serializable = {
        ...imageState,
        imageData: imageState.imageData
          ? {
              data: Array.from(imageState.imageData.data),
              width: imageState.imageData.width,
              height: imageState.imageData.height,
            }
          : null,
        lastModified: imageState.lastModified.toISOString(),
      };

      const request = store.put(serializable);

      request.onsuccess = () => {
        // 最後のセッションIDを保存
        this.saveLastSessionId(imageState.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save image state');
        reject(new Error(ERROR_MESSAGES.STORAGE_FAILED));
      };
    });
  }

  /**
   * 画像状態を読み込み
   */
  async loadImageState(id: string): Promise<ImageState | null> {
    if (!this.db) {
      console.warn('IndexedDB is not initialized');
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.STORES.IMAGES], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.STORES.IMAGES);
      const request = store.get(id);

      request.onsuccess = () => {
        const data = request.result;
        if (!data) {
          resolve(null);
          return;
        }

        // ImageDataを復元
        const imageState: ImageState = {
          ...data,
          imageData: data.imageData
            ? new ImageData(
                new Uint8ClampedArray(data.imageData.data),
                data.imageData.width,
                data.imageData.height
              )
            : null,
          lastModified: new Date(data.lastModified),
        };

        resolve(imageState);
      };

      request.onerror = () => {
        console.error('Failed to load image state');
        reject(new Error('Failed to load image state'));
      };
    });
  }

  /**
   * 最新のセッションを取得
   */
  async getLatestSession(): Promise<ImageState | null> {
    const lastSessionId = this.loadLastSessionId();
    if (!lastSessionId) {
      return null;
    }

    return this.loadImageState(lastSessionId);
  }

  /**
   * 画像状態を削除
   */
  async deleteImageState(id: string): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB is not initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DB_CONFIG.STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.IMAGES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete image state'));
    });
  }

  /**
   * 設定を保存
   */
  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * 設定を読み込み
   */
  loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return DEFAULT_SETTINGS;
  }

  /**
   * 最後のセッションIDを保存
   */
  private saveLastSessionId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SESSION_ID, id);
    } catch (error) {
      console.error('Failed to save last session ID:', error);
    }
  }

  /**
   * 最後のセッションIDを読み込み
   */
  private loadLastSessionId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SESSION_ID);
    } catch (error) {
      console.error('Failed to load last session ID:', error);
      return null;
    }
  }

  /**
   * ストレージをクリア
   */
  async clearStorage(): Promise<void> {
    // IndexedDBをクリア
    if (this.db) {
      const transaction = this.db.transaction([DB_CONFIG.STORES.IMAGES], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.STORES.IMAGES);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to clear IndexedDB'));
      });
    }

    // LocalStorageをクリア
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_SESSION_ID);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

export const storageService = new StorageService();
