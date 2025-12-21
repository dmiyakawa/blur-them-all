export type ToolType = 'select' | 'pen' | 'arrow' | 'resize';

export interface PenSettings {
  color: string;
  width: number;
}

export interface ArrowSettings {
  color: string;
  width: number;
  headSize: number;
}

export interface BlurSettings {
  strength: number;
}

export interface MosaicSettings {
  blockSize: number;
}

export interface ResizeSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface ToolState {
  activeTool: ToolType;
  penSettings: PenSettings;
  arrowSettings: ArrowSettings;
  blurSettings: BlurSettings;
  mosaicSettings: MosaicSettings;
  resizeSettings: ResizeSettings;
}

export interface Point {
  x: number;
  y: number;
}

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}
