import { FILE_CONFIG } from '@/constants';
import { ERROR_MESSAGES } from '@/constants';

/**
 * ファイルサイズを人間が読みやすい形式に変換
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * ファイルが有効な画像ファイルかどうかを検証
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // ファイルタイプのチェック
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `${ERROR_MESSAGES.INVALID_FILE_TYPE}\n（ファイル形式: ${file.type || '不明'}）`
    };
  }

  // ファイルサイズのチェック
  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
    const actualSize = formatFileSize(file.size);
    const maxSize = formatFileSize(FILE_CONFIG.MAX_FILE_SIZE);
    return {
      valid: false,
      error: `${ERROR_MESSAGES.FILE_TOO_LARGE}\n（ファイルサイズ: ${actualSize}、最大: ${maxSize}）`
    };
  }

  return { valid: true };
}

/**
 * ファイルを読み込んでImageオブジェクトを返す
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error(ERROR_MESSAGES.IMAGE_LOAD_FAILED));
    reader.readAsDataURL(file);
  });
}

/**
 * Canvasから画像をBlobとしてエクスポート
 */
export function exportCanvasAsBlob(
  canvas: HTMLCanvasElement,
  type: string = FILE_CONFIG.EXPORT_FORMAT,
  quality: number = FILE_CONFIG.EXPORT_QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(ERROR_MESSAGES.EXPORT_FAILED));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Blobをダウンロード
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * ファイル名から拡張子を変更
 */
export function changeFileExtension(filename: string, newExtension: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  const nameWithoutExtension = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
  return `${nameWithoutExtension}.${newExtension}`;
}
