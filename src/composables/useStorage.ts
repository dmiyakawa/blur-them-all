import { ref, onMounted } from 'vue';
import type { ImageState, AppSettings } from '@/types/image';
import { storageService } from '@/services/StorageService';
import { DEFAULT_SETTINGS } from '@/types/image';

export function useStorage() {
  const isInitialized = ref(false);
  const settings = ref<AppSettings>(DEFAULT_SETTINGS);

  /**
   * ストレージを初期化
   */
  async function initStorage(): Promise<void> {
    try {
      await storageService.initDB();
      settings.value = storageService.loadSettings();
      isInitialized.value = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  /**
   * 画像状態を保存
   */
  async function saveImageState(imageState: ImageState): Promise<void> {
    try {
      await storageService.saveImageState(imageState);
    } catch (error) {
      console.error('Failed to save image state:', error);
      throw error;
    }
  }

  /**
   * 画像状態を読み込み
   */
  async function loadImageState(id: string): Promise<ImageState | null> {
    try {
      return await storageService.loadImageState(id);
    } catch (error) {
      console.error('Failed to load image state:', error);
      return null;
    }
  }

  /**
   * 最新のセッションを復元
   */
  async function restoreLatestSession(): Promise<ImageState | null> {
    try {
      return await storageService.getLatestSession();
    } catch (error) {
      console.error('Failed to restore latest session:', error);
      return null;
    }
  }

  /**
   * 設定を保存
   */
  function saveSettings(newSettings: AppSettings): void {
    settings.value = newSettings;
    storageService.saveSettings(newSettings);
  }

  /**
   * ストレージをクリア
   */
  async function clearStorage(): Promise<void> {
    try {
      await storageService.clearStorage();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // 初期化を自動実行
  onMounted(() => {
    initStorage();
  });

  return {
    isInitialized,
    settings,
    initStorage,
    saveImageState,
    loadImageState,
    restoreLatestSession,
    saveSettings,
    clearStorage,
  };
}
