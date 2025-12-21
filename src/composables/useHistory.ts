import { ref, computed } from 'vue';
import type { ImageState } from '@/types/image';
import { historyManager } from '@/services/HistoryManager';

// モジュールレベルでstateを定義（すべてのコンポーネントで共有）
const canUndo = ref(false);
const canRedo = ref(false);
const historyInfo = ref(historyManager.getHistoryInfo());

export function useHistory() {

  /**
   * 履歴情報を更新
   */
  function updateHistoryInfo(): void {
    historyInfo.value = historyManager.getHistoryInfo();
    canUndo.value = historyInfo.value.canUndo;
    canRedo.value = historyInfo.value.canRedo;
  }

  /**
   * 新しい状態を履歴に追加
   */
  function pushHistory(state: ImageState, description: string = 'Edit'): void {
    historyManager.push(state, description);
    updateHistoryInfo();
  }

  /**
   * Undo
   */
  function undo(): ImageState | null {
    const state = historyManager.undo();
    updateHistoryInfo();
    return state;
  }

  /**
   * Redo
   */
  function redo(): ImageState | null {
    const state = historyManager.redo();
    updateHistoryInfo();
    return state;
  }

  /**
   * 履歴をクリア
   */
  function clearHistory(): void {
    historyManager.clear();
    updateHistoryInfo();
  }

  return {
    canUndo,
    canRedo,
    historyInfo,
    pushHistory,
    undo,
    redo,
    clearHistory,
    updateHistoryInfo,
  };
}
