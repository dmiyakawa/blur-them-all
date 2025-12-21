import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue';
import type { ImageState } from '@/types/image';
import type { Point } from '@/types/tool';
import { getCanvasCoordinates } from '@/utils/canvas';

export function useCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
  const imageState = ref<ImageState | null>(null);
  const isDrawing = ref(false);
  const currentPoint = ref<Point | null>(null);

  const ctx = computed(() => canvasRef.value?.getContext('2d') ?? null);

  /**
   * Canvasを初期化
   */
  function initCanvas(width: number, height: number): void {
    if (!canvasRef.value) return;

    canvasRef.value.width = width;
    canvasRef.value.height = height;

    if (ctx.value) {
      ctx.value.fillStyle = '#ffffff';
      ctx.value.fillRect(0, 0, width, height);
    }
  }

  /**
   * 画像をCanvasに描画
   */
  function drawImage(state: ImageState): void {
    console.log('drawImage called', {
      hasCanvasRef: !!canvasRef.value,
      hasImageData: !!state.imageData,
      width: state.width,
      height: state.height
    });

    if (!canvasRef.value || !state.imageData) {
      console.error('drawImage failed: missing canvasRef or imageData');
      return;
    }

    canvasRef.value.width = state.width;
    canvasRef.value.height = state.height;

    // Canvasサイズ変更後に新しいコンテキストを取得
    const context = canvasRef.value.getContext('2d');
    if (!context) {
      console.error('drawImage failed: could not get context');
      return;
    }

    console.log('Drawing image data to canvas');
    context.putImageData(state.imageData, 0, 0);

    imageState.value = state;
    console.log('imageState updated, hasImage should be true');
  }

  /**
   * Canvasをクリア
   */
  function clearCanvas(): void {
    if (!ctx.value || !canvasRef.value) return;

    ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.value.fillStyle = '#ffffff';
    ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }

  /**
   * マウス/タッチ座標をCanvas座標に変換
   */
  function getCanvasPoint(clientX: number, clientY: number): Point | null {
    if (!canvasRef.value) return null;
    return getCanvasCoordinates(canvasRef.value, clientX, clientY);
  }

  /**
   * Canvas全体のImageDataを取得
   */
  function getImageData(): ImageData | null {
    if (!ctx.value || !canvasRef.value) return null;
    return ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height);
  }

  /**
   * ImageDataをCanvasに適用
   */
  function putImageData(imageData: ImageData): void {
    if (!ctx.value) return;
    ctx.value.putImageData(imageData, 0, 0);
  }

  /**
   * Canvas上に一時的なオーバーレイを描画（プレビュー用）
   */
  function drawOverlay(drawFn: (ctx: CanvasRenderingContext2D) => void): void {
    if (!ctx.value || !imageState.value?.imageData) return;

    // 元の画像を再描画
    ctx.value.putImageData(imageState.value.imageData, 0, 0);

    // オーバーレイを描画
    drawFn(ctx.value);
  }

  return {
    imageState,
    isDrawing,
    currentPoint,
    ctx,
    initCanvas,
    drawImage,
    clearCanvas,
    getCanvasPoint,
    getImageData,
    putImageData,
    drawOverlay,
  };
}
