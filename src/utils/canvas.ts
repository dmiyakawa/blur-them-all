import type { Point, Region } from '@/types/tool';

/**
 * 新しいCanvasを作成
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * CanvasのコンテキストをクリアCanvas上の指定された領域をクリア
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width?: number, height?: number): void {
  if (width !== undefined && height !== undefined) {
    ctx.clearRect(0, 0, width, height);
  } else {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * ImageをCanvasに描画
 */
export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  return ctx;
}

/**
 * ImageDataをCanvasに描画
 */
export function drawImageDataToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  return ctx;
}

/**
 * 2点間の距離を計算
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 2点間の角度を計算（ラジアン）
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 領域が有効かどうかをチェック
 */
export function isValidRegion(region: Region): boolean {
  return region.width > 0 && region.height > 0;
}

/**
 * 領域を正規化（負の幅・高さを正に変換）
 */
export function normalizeRegion(region: Region): Region {
  const normalized = { ...region };

  if (normalized.width < 0) {
    normalized.x += normalized.width;
    normalized.width = -normalized.width;
  }

  if (normalized.height < 0) {
    normalized.y += normalized.height;
    normalized.height = -normalized.height;
  }

  return normalized;
}

/**
 * Canvas座標をクライアント座標に変換
 */
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();

  // 表示サイズと実際のCanvas内部サイズの比率を計算
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

/**
 * Canvasから指定領域のImageDataを取得
 */
export function getRegionImageData(
  ctx: CanvasRenderingContext2D,
  region: Region
): ImageData | null {
  try {
    const normalized = normalizeRegion(region);
    return ctx.getImageData(
      Math.floor(normalized.x),
      Math.floor(normalized.y),
      Math.floor(normalized.width),
      Math.floor(normalized.height)
    );
  } catch (error) {
    console.error('Failed to get image data:', error);
    return null;
  }
}

/**
 * ImageDataを指定位置に配置
 */
export function putRegionImageData(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  x: number,
  y: number
): void {
  try {
    ctx.putImageData(imageData, Math.floor(x), Math.floor(y));
  } catch (error) {
    console.error('Failed to put image data:', error);
  }
}
