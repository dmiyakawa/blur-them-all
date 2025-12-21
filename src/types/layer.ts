import type { Point, Region } from './tool';

export type LayerType = 'pen' | 'arrow' | 'blur' | 'mosaic';

export interface Path {
  points: Point[];
  color: string;
  width: number;
}

export interface Arrow {
  id: string;
  start: Point;
  end: Point;
  color: string;
  width: number;
  headSize: number;
}

export interface EffectRegion {
  id: string;
  region: Region;
  strength: number;
}

export interface PenLayerData {
  paths: Path[];
}

export interface ArrowLayerData {
  arrows: Arrow[];
}

export interface BlurLayerData {
  regions: EffectRegion[];
}

export interface MosaicLayerData {
  regions: EffectRegion[];
}

export type LayerData = PenLayerData | ArrowLayerData | BlurLayerData | MosaicLayerData;

export interface Layer {
  id: string;
  type: LayerType;
  data: LayerData;
  visible: boolean;
  locked: boolean;
}
