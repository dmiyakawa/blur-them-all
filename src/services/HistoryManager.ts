import type { ImageState } from '@/types/image';
import type { HistoryEntry, HistoryState } from '@/types/history';
import { UI_CONFIG } from '@/constants';

export class HistoryManager {
  private history: HistoryState = {
    entries: [],
    currentIndex: -1,
    maxSize: UI_CONFIG.HISTORY_MAX_SIZE,
  };

  /**
   * 新しい編集を履歴に追加
   */
  push(state: ImageState, description: string = 'Edit'): void {
    // 現在の位置より後ろの履歴を削除（Redoできなくなる）
    if (this.history.currentIndex < this.history.entries.length - 1) {
      this.history.entries = this.history.entries.slice(0, this.history.currentIndex + 1);
    }

    // 新しいエントリを作成
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      state: this.cloneImageState(state),
      description,
    };

    // 履歴に追加
    this.history.entries.push(entry);
    this.history.currentIndex++;

    // 履歴サイズの制限
    if (this.history.entries.length > this.history.maxSize) {
      this.history.entries.shift();
      this.history.currentIndex--;
    }
  }

  /**
   * Undo
   */
  undo(): ImageState | null {
    if (!this.canUndo()) {
      return null;
    }

    this.history.currentIndex--;
    return this.cloneImageState(this.history.entries[this.history.currentIndex].state);
  }

  /**
   * Redo
   */
  redo(): ImageState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.history.currentIndex++;
    return this.cloneImageState(this.history.entries[this.history.currentIndex].state);
  }

  /**
   * Undoが可能かどうか
   */
  canUndo(): boolean {
    return this.history.currentIndex > 0;
  }

  /**
   * Redoが可能かどうか
   */
  canRedo(): boolean {
    return this.history.currentIndex < this.history.entries.length - 1;
  }

  /**
   * 現在の状態を取得
   */
  getCurrentState(): ImageState | null {
    if (this.history.currentIndex >= 0 && this.history.currentIndex < this.history.entries.length) {
      return this.cloneImageState(this.history.entries[this.history.currentIndex].state);
    }
    return null;
  }

  /**
   * 履歴をクリア
   */
  clear(): void {
    this.history = {
      entries: [],
      currentIndex: -1,
      maxSize: this.history.maxSize,
    };
  }

  /**
   * 履歴の情報を取得
   */
  getHistoryInfo(): {
    canUndo: boolean;
    canRedo: boolean;
    currentIndex: number;
    totalEntries: number;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.history.currentIndex,
      totalEntries: this.history.entries.length,
    };
  }

  /**
   * ImageStateのディープコピー
   */
  private cloneImageState(state: ImageState): ImageState {
    return {
      ...state,
      imageData: state.imageData
        ? new ImageData(
            new Uint8ClampedArray(state.imageData.data),
            state.imageData.width,
            state.imageData.height
          )
        : null,
      layers: state.layers.map((layer) => ({
        ...layer,
        data: JSON.parse(JSON.stringify(layer.data)),
      })),
      lastModified: new Date(state.lastModified),
    };
  }
}

export const historyManager = new HistoryManager();
