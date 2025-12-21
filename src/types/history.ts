import type { ImageState } from './image';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  state: ImageState;
  description: string;
}

export interface HistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize: number;
}
