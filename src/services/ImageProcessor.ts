import type { ImageState } from '@/types/image';
import type { Region } from '@/types/tool';
import { loadImageFromFile, validateImageFile } from '@/utils/file';
import { createCanvas, drawImageToCanvas } from '@/utils/canvas';
import { ERROR_MESSAGES } from '@/constants';

export class ImageProcessor {
  /**
   * ファイルから画像を読み込んでImageStateを生成
   */
  async loadImage(file: File): Promise<ImageState> {
    console.log('ImageProcessor.loadImage called', file.name);

    // ファイルの検証
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      throw new Error(validation.error);
    }

    // 画像の読み込み
    console.log('Loading image from file...');
    const img = await loadImageFromFile(file);
    console.log('Image loaded:', { width: img.width, height: img.height });

    // Canvasに描画してImageDataを取得
    const canvas = createCanvas(img.width, img.height);
    const ctx = drawImageToCanvas(canvas, img);

    if (!ctx) {
      console.error('Failed to get canvas context');
      throw new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED);
    }

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    console.log('ImageData created:', {
      width: imageData.width,
      height: imageData.height,
      dataLength: imageData.data.length
    });

    // ImageStateを生成
    const imageState: ImageState = {
      id: crypto.randomUUID(),
      originalFileName: file.name,
      width: img.width,
      height: img.height,
      imageData,
      layers: [],
      lastModified: new Date(),
    };

    console.log('ImageState created:', imageState.id);
    return imageState;
  }

  /**
   * 画像をリサイズ
   */
  async resize(
    imageState: ImageState,
    newWidth: number,
    newHeight: number
  ): Promise<ImageState> {
    if (!imageState.imageData) {
      throw new Error('No image data to resize');
    }

    // 元の画像をCanvasに描画
    const sourceCanvas = createCanvas(imageState.width, imageState.height);
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) {
      throw new Error('Failed to get canvas context');
    }
    sourceCtx.putImageData(imageState.imageData, 0, 0);

    // リサイズ後のCanvas
    const targetCanvas = createCanvas(newWidth, newHeight);
    const targetCtx = targetCanvas.getContext('2d');
    if (!targetCtx) {
      throw new Error('Failed to get canvas context');
    }

    // 高品質なリサイズを適用
    targetCtx.imageSmoothingEnabled = true;
    targetCtx.imageSmoothingQuality = 'high';
    targetCtx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);

    const newImageData = targetCtx.getImageData(0, 0, newWidth, newHeight);

    return {
      ...imageState,
      width: newWidth,
      height: newHeight,
      imageData: newImageData,
      lastModified: new Date(),
    };
  }

  /**
   * モザイク処理を適用
   */
  applyMosaic(imageData: ImageData, region: Region, blockSize: number): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    const startX = Math.max(0, Math.floor(region.x));
    const startY = Math.max(0, Math.floor(region.y));
    const endX = Math.min(imageData.width, Math.ceil(region.x + region.width));
    const endY = Math.min(imageData.height, Math.ceil(region.y + region.height));

    // ブロックごとに処理
    for (let y = startY; y < endY; y += blockSize) {
      for (let x = startX; x < endX; x += blockSize) {
        // ブロックの平均色を計算
        const blockWidth = Math.min(blockSize, endX - x);
        const blockHeight = Math.min(blockSize, endY - y);

        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let count = 0;

        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const px = x + bx;
            const py = y + by;
            const index = (py * imageData.width + px) * 4;

            r += result.data[index];
            g += result.data[index + 1];
            b += result.data[index + 2];
            a += result.data[index + 3];
            count++;
          }
        }

        // 平均色を計算
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        a = Math.floor(a / count);

        // ブロック全体を平均色で塗りつぶす
        for (let by = 0; by < blockHeight; by++) {
          for (let bx = 0; bx < blockWidth; bx++) {
            const px = x + bx;
            const py = y + by;
            const index = (py * imageData.width + px) * 4;

            result.data[index] = r;
            result.data[index + 1] = g;
            result.data[index + 2] = b;
            result.data[index + 3] = a;
          }
        }
      }
    }

    return result;
  }

  /**
   * 塗りつぶし処理を適用
   */
  applyFill(imageData: ImageData, region: Region, color: string): ImageData {
    const result = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    const startX = Math.max(0, Math.floor(region.x));
    const startY = Math.max(0, Math.floor(region.y));
    const endX = Math.min(imageData.width, Math.ceil(region.x + region.width));
    const endY = Math.min(imageData.height, Math.ceil(region.y + region.height));

    // 色をRGBAに変換
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return result;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const colorData = ctx.getImageData(0, 0, 1, 1).data;

    const r = colorData[0];
    const g = colorData[1];
    const b = colorData[2];
    const a = 255; // 完全に不透明

    // 領域を塗りつぶす
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = (y * imageData.width + x) * 4;
        result.data[index] = r;
        result.data[index + 1] = g;
        result.data[index + 2] = b;
        result.data[index + 3] = a;
      }
    }

    return result;
  }

  /**
   * ブラー処理を適用
   */
  applyBlur(imageData: ImageData, region: Region, strength: number): ImageData {
    // Canvasのfilterプロパティを使用してブラーを適用
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // 元の画像を描画
    ctx.putImageData(imageData, 0, 0);

    // 一時Canvasを作成
    const tempCanvas = createCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      throw new Error('Failed to get canvas context');
    }

    // 元の画像をコピー
    tempCtx.drawImage(canvas, 0, 0);

    // ブラー領域を切り取り
    const startX = Math.max(0, Math.floor(region.x));
    const startY = Math.max(0, Math.floor(region.y));
    const width = Math.min(imageData.width - startX, Math.ceil(region.width));
    const height = Math.min(imageData.height - startY, Math.ceil(region.height));

    // ブラーCanvas
    const blurCanvas = createCanvas(width, height);
    const blurCtx = blurCanvas.getContext('2d');

    if (!blurCtx) {
      throw new Error('Failed to get canvas context');
    }

    // 領域を切り取って描画
    blurCtx.drawImage(
      tempCanvas,
      startX,
      startY,
      width,
      height,
      0,
      0,
      width,
      height
    );

    // ブラーフィルターを適用
    blurCtx.filter = `blur(${strength}px)`;
    blurCtx.drawImage(blurCanvas, 0, 0);

    // ブラー領域を元の画像に合成
    ctx.drawImage(blurCanvas, 0, 0, width, height, startX, startY, width, height);

    return ctx.getImageData(0, 0, imageData.width, imageData.height);
  }

  /**
   * ImageDataをCanvasに描画してBlobを生成
   */
  async exportToPNG(imageData: ImageData): Promise<Blob> {
    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(ERROR_MESSAGES.EXPORT_FAILED));
          }
        },
        'image/png',
        1.0
      );
    });
  }
}

export const imageProcessor = new ImageProcessor();
