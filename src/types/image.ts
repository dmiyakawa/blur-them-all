import type { Layer } from './layer';

export interface ImageState {
  id: string;
  originalFileName: string;
  width: number;
  height: number;
  imageData: ImageData | null;
  layers: Layer[];
  lastModified: Date;
}

export interface AppSettings {
  autoSaveInterval: number; // milliseconds
  maxHistorySize: number;
  defaultPenColor: string;
  defaultPenWidth: number;
  defaultArrowColor: string;
  defaultArrowWidth: number;
  defaultArrowHeadSize: number;
  defaultBlurStrength: number;
  defaultMosaicBlockSize: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoSaveInterval: 30000, // 30 seconds
  maxHistorySize: 30,
  defaultPenColor: '#ff0000',
  defaultPenWidth: 3,
  defaultArrowColor: '#ff0000',
  defaultArrowWidth: 3,
  defaultArrowHeadSize: 10,
  defaultBlurStrength: 10,
  defaultMosaicBlockSize: 10,
};
