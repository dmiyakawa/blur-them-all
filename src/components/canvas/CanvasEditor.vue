<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { ImageState } from '@/types/image';
import type { Point } from '@/types/tool';
import { useCanvas } from '@/composables/useCanvas';
import { useTools } from '@/composables/useTools';
import { useHistory } from '@/composables/useHistory';
import { imageProcessor } from '@/services/ImageProcessor';
import { toolManager } from '@/services/ToolManager';
import { downloadBlob, changeFileExtension } from '@/utils/file';
import { getArrowHeadPoints } from '@/utils/geometry';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const {
  imageState,
  isDrawing,
  drawImage,
  clearCanvas,
  getCanvasPoint,
  getImageData,
  putImageData,
  drawOverlay,
} = useCanvas(canvasRef);

const { activeTool, toolState } = useTools();
const { pushHistory, undo, redo, canUndo, canRedo } = useHistory();

const hasImage = computed(() => imageState.value !== null);
const isDragging = ref(false);
const zoom = ref(1.0);
const containerRef = ref<HTMLDivElement | null>(null);
const selectedRegion = ref<{ x: number; y: number; width: number; height: number } | null>(null);
const fillColor = ref('#000000');

// 選択範囲の操作モード
type SelectionMode = 'none' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';
const selectionMode = ref<SelectionMode>('none');
const selectionDragStart = ref<Point | null>(null);
const originalRegion = ref<{ x: number; y: number; width: number; height: number } | null>(null);
const currentCursor = ref<string>('default');

// ハンドルのサイズ（ピクセル）
const HANDLE_SIZE = 8;

// カーソルスタイルの計算
const canvasCursorStyle = computed(() => {
  if (activeTool.value === 'select' && selectedRegion.value && !isDrawing.value) {
    return currentCursor.value;
  }
  // その他のツールはCSSクラスで制御
  return 'default';
});

// 選択モードに対応するカーソルスタイルを取得
function getCursorForMode(mode: SelectionMode): string {
  switch (mode) {
    case 'move': return 'move';
    case 'resize-nw': return 'nw-resize';
    case 'resize-ne': return 'ne-resize';
    case 'resize-sw': return 'sw-resize';
    case 'resize-se': return 'se-resize';
    default: return 'default';
  }
}

// クリック位置が選択範囲のどこに該当するかを判定
function getSelectionHitTest(point: Point): SelectionMode {
  if (!selectedRegion.value) return 'none';

  const region = selectedRegion.value;
  const handleSize = HANDLE_SIZE;

  // 各隅のハンドル領域を定義
  const handles = {
    nw: { x: region.x - handleSize, y: region.y - handleSize, width: handleSize * 2, height: handleSize * 2 },
    ne: { x: region.x + region.width - handleSize, y: region.y - handleSize, width: handleSize * 2, height: handleSize * 2 },
    sw: { x: region.x - handleSize, y: region.y + region.height - handleSize, width: handleSize * 2, height: handleSize * 2 },
    se: { x: region.x + region.width - handleSize, y: region.y + region.height - handleSize, width: handleSize * 2, height: handleSize * 2 },
  };

  // ハンドルとの当たり判定（優先順位高）
  if (isPointInRect(point, handles.nw)) return 'resize-nw';
  if (isPointInRect(point, handles.ne)) return 'resize-ne';
  if (isPointInRect(point, handles.sw)) return 'resize-sw';
  if (isPointInRect(point, handles.se)) return 'resize-se';

  // 選択範囲内部との当たり判定
  if (isPointInRect(point, region)) return 'move';

  return 'none';
}

// 点が矩形内にあるかチェック
function isPointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x &&
         point.x <= rect.x + rect.width &&
         point.y >= rect.y &&
         point.y <= rect.y + rect.height;
}

// ズーム機能
function calculateFitZoom(): number {
  if (!containerRef.value || !imageState.value) return 1.0;

  const container = containerRef.value;
  const containerWidth = container.clientWidth - 40; // padding考慮
  const containerHeight = container.clientHeight - 40;

  const scaleX = containerWidth / imageState.value.width;
  const scaleY = containerHeight / imageState.value.height;

  // 画像が画面に収まる最大のズームレベル
  return Math.min(scaleX, scaleY, 1.0); // 1.0を超えないように
}

function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 5.0); // 最大5倍
  console.log('Zoom in:', zoom.value);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.1); // 最小0.1倍
  console.log('Zoom out:', zoom.value);
}

function fitToScreen() {
  zoom.value = calculateFitZoom();
  console.log('Fit to screen, zoom:', zoom.value);
}

function resetZoom() {
  zoom.value = 1.0;
  console.log('Reset zoom to 1.0');
}

// ズーム後のCanvas表示サイズ
const canvasStyle = computed(() => {
  if (!imageState.value) return {};
  return {
    width: `${imageState.value.width * zoom.value}px`,
    height: `${imageState.value.height * zoom.value}px`,
  };
});

// Undo/Redo処理
async function handleUndo() {
  console.log('handleUndo called');
  const state = undo();
  if (state) {
    console.log('Undo state retrieved, updating canvas');
    imageState.value = state;
    await nextTick();
    drawImage(state);
  }
}

async function handleRedo() {
  console.log('handleRedo called');
  const state = redo();
  if (state) {
    console.log('Redo state retrieved, updating canvas');
    imageState.value = state;
    await nextTick();
    drawImage(state);
  }
}

// キーボードショートカット
function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    handleUndo();
  } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault();
    handleRedo();
  }
}

// ツール切り替え時に選択範囲をクリア
watch(activeTool, (newTool, oldTool) => {
  if (oldTool === 'select' && newTool !== 'select' && selectedRegion.value) {
    console.log('Tool changed from select, clearing selection');
    clearSelection();
  }
});

// キーボードイベントリスナーの追加/削除
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// ファイル選択
function handleFileSelect() {
  fileInputRef.value?.click();
}

// ファイル読み込み
async function handleFileChange(event: Event) {
  console.log('handleFileChange called');
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    console.log('No file selected');
    return;
  }

  console.log('File selected:', file.name);

  try {
    const state = await imageProcessor.loadImage(file);
    console.log('Image loaded, state:', state);

    // imageStateを先に更新してv-ifでcanvasをDOMに追加
    imageState.value = state;
    console.log('imageState updated, hasImage:', hasImage.value);

    // nextTickを待ってcanvasがDOMに追加されてから描画
    await nextTick();

    console.log('After nextTick, canvasRef:', canvasRef.value);
    drawImage(state);

    // 画像を画面に収める
    await nextTick();
    fitToScreen();

    console.log('drawImage completed, pushing to history');
    pushHistory(state, 'Load image');
    console.log('Image load complete');
  } catch (error) {
    console.error('Failed to load image:', error);
    alert('画像の読み込みに失敗しました');
  }

  // ファイル入力をリセット
  target.value = '';
}

// ドラッグ&ドロップ
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const file = event.dataTransfer?.files[0];
  if (!file) return;

  console.log('File dropped:', file.name);

  try {
    const state = await imageProcessor.loadImage(file);
    console.log('Image loaded from drop');

    // imageStateを先に更新してv-ifでcanvasをDOMに追加
    imageState.value = state;

    // nextTickを待ってcanvasがDOMに追加されてから描画
    await nextTick();

    console.log('After nextTick (drop), canvasRef:', canvasRef.value);
    drawImage(state);

    // 画像を画面に収める
    await nextTick();
    fitToScreen();

    pushHistory(state, 'Load image');
    console.log('Drop complete');
  } catch (error) {
    console.error('Failed to load image:', error);
    alert('画像の読み込みに失敗しました');
  }
}

// Canvas操作
function handleMouseDown(event: MouseEvent) {
  console.log('handleMouseDown called', { hasImage: hasImage.value, activeTool: activeTool.value });

  if (!hasImage.value) {
    console.log('No image loaded, ignoring mouse down');
    return;
  }

  const point = getCanvasPoint(event.clientX, event.clientY);
  if (!point) {
    console.log('Could not get canvas point (clicked outside image)');
    // 画像外をクリックした場合、選択範囲をクリア
    if (selectedRegion.value) {
      clearSelection();
    }
    return;
  }

  console.log('Mouse down at point:', point);
  isDrawing.value = true;

  switch (activeTool.value) {
    case 'pen':
      console.log('Starting pen stroke');
      toolManager.startPenStroke(point);
      break;
    case 'arrow':
      console.log('Starting arrow');
      toolManager.startArrow(point);
      break;
    case 'select':
      // 既存の選択範囲がある場合は、移動/リサイズモードをチェック
      if (selectedRegion.value) {
        const mode = getSelectionHitTest(point);
        if (mode !== 'none') {
          console.log('Selection manipulation mode:', mode);
          selectionMode.value = mode;
          selectionDragStart.value = point;
          originalRegion.value = { ...selectedRegion.value };
          break;
        } else {
          // 選択範囲外をクリックした場合は選択をクリア
          console.log('Clicked outside selection, clearing');
          clearSelection();
        }
      }
      // 新規選択を開始
      console.log('Starting new selection');
      selectionMode.value = 'none';
      toolManager.startSelection(point);
      break;
    default:
      console.log('No action for tool:', activeTool.value);
  }
}

function handleMouseMove(event: MouseEvent) {
  if (!hasImage.value) return;

  const point = getCanvasPoint(event.clientX, event.clientY);
  if (!point) return;

  // カーソルの更新（選択ツールで選択範囲がある場合）
  if (activeTool.value === 'select' && selectedRegion.value && !isDrawing.value) {
    const mode = getSelectionHitTest(point);
    currentCursor.value = getCursorForMode(mode);
  }

  // ドラッグ中の処理
  if (!isDrawing.value) return;

  switch (activeTool.value) {
    case 'pen':
      toolManager.continuePenStroke(point);
      drawPenPreview();
      break;
    case 'arrow':
      toolManager.updateArrow(point);
      drawArrowPreview();
      break;
    case 'select':
      // 選択範囲の移動またはリサイズ中
      if (selectionMode.value !== 'none' && selectionDragStart.value && originalRegion.value) {
        const dx = point.x - selectionDragStart.value.x;
        const dy = point.y - selectionDragStart.value.y;

        if (selectionMode.value === 'move') {
          // 移動
          selectedRegion.value = {
            x: originalRegion.value.x + dx,
            y: originalRegion.value.y + dy,
            width: originalRegion.value.width,
            height: originalRegion.value.height,
          };
        } else {
          // リサイズ
          const newRegion = { ...originalRegion.value };

          switch (selectionMode.value) {
            case 'resize-nw':
              newRegion.x = originalRegion.value.x + dx;
              newRegion.y = originalRegion.value.y + dy;
              newRegion.width = originalRegion.value.width - dx;
              newRegion.height = originalRegion.value.height - dy;
              break;
            case 'resize-ne':
              newRegion.y = originalRegion.value.y + dy;
              newRegion.width = originalRegion.value.width + dx;
              newRegion.height = originalRegion.value.height - dy;
              break;
            case 'resize-sw':
              newRegion.x = originalRegion.value.x + dx;
              newRegion.width = originalRegion.value.width - dx;
              newRegion.height = originalRegion.value.height + dy;
              break;
            case 'resize-se':
              newRegion.width = originalRegion.value.width + dx;
              newRegion.height = originalRegion.value.height + dy;
              break;
          }

          // 最小サイズを維持
          if (newRegion.width >= 10 && newRegion.height >= 10) {
            selectedRegion.value = newRegion;
          }
        }

        // 選択範囲を再描画
        drawSelectionBorder();
      } else {
        // 通常の選択描画
        toolManager.updateSelection(point);
        drawSelectionPreview();
      }
      break;
  }
}

function handleMouseUp() {
  if (!hasImage.value || !isDrawing.value) return;

  isDrawing.value = false;

  switch (activeTool.value) {
    case 'pen':
      finalizePen();
      break;
    case 'arrow':
      finalizeArrow();
      break;
    case 'select':
      // 移動/リサイズモードの場合はモードをリセット
      if (selectionMode.value !== 'none') {
        selectionMode.value = 'none';
        selectionDragStart.value = null;
        originalRegion.value = null;
      } else {
        // 通常の選択確定
        finalizeSelection();
      }
      break;
  }
}

// 選択を確定
function finalizeSelection() {
  const region = toolManager.finalizeSelection();
  if (region && region.width >= 10 && region.height >= 10) {
    selectedRegion.value = region;
    console.log('Selection finalized:', region);
    // 選択領域を表示し続ける
    drawSelectionBorder();
  } else {
    selectedRegion.value = null;
  }
}

// 選択範囲の枠線を描画（永続的）
function drawSelectionBorder() {
  if (!selectedRegion.value || !imageState.value?.imageData) return;

  drawOverlay((ctx) => {
    const region = selectedRegion.value!;
    // 明るい黄色で枠線を描画
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(region.x, region.y, region.width, region.height);
    ctx.setLineDash([]);

    // 半透明の黄色で背景を塗りつぶし
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
    ctx.fillRect(region.x, region.y, region.width, region.height);

    // リサイズハンドルを描画
    const handleSize = HANDLE_SIZE;
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const handles = [
      { x: region.x, y: region.y }, // nw
      { x: region.x + region.width, y: region.y }, // ne
      { x: region.x, y: region.y + region.height }, // sw
      { x: region.x + region.width, y: region.y + region.height }, // se
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  });
}

// 選択をクリア
function clearSelection() {
  selectedRegion.value = null;
  if (imageState.value) {
    drawImage(imageState.value);
  }
}

// ペン描画
function drawPenPreview() {
  const path = toolManager.getCurrentPath();
  if (!path || path.points.length < 2) return;

  drawOverlay((ctx) => {
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }

    ctx.stroke();
  });
}

function finalizePen() {
  const path = toolManager.endPenStroke();
  if (!path || path.points.length < 2 || !imageState.value?.imageData) return;

  // 新しいCanvasにペンを描画
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageState.value.width;
  tempCanvas.height = imageState.value.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // 元の画像を描画
  tempCtx.putImageData(imageState.value.imageData, 0, 0);

  // ペンを描画
  tempCtx.strokeStyle = path.color;
  tempCtx.lineWidth = path.width;
  tempCtx.lineCap = 'round';
  tempCtx.lineJoin = 'round';

  tempCtx.beginPath();
  tempCtx.moveTo(path.points[0].x, path.points[0].y);

  for (let i = 1; i < path.points.length; i++) {
    tempCtx.lineTo(path.points[i].x, path.points[i].y);
  }

  tempCtx.stroke();

  // ImageDataを取得して更新
  const newImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const newState = {
    ...imageState.value,
    imageData: newImageData,
    lastModified: new Date(),
  };

  drawImage(newState);
  pushHistory(newState, 'Draw pen');
}

// 矢印描画
function drawArrowPreview() {
  const arrow = toolManager.getCurrentArrow();
  if (!arrow) return;

  drawOverlay((ctx) => {
    ctx.strokeStyle = arrow.color;
    ctx.fillStyle = arrow.color;
    ctx.lineWidth = arrow.width;
    ctx.lineCap = 'round';

    // 矢印の線
    ctx.beginPath();
    ctx.moveTo(arrow.start.x, arrow.start.y);
    ctx.lineTo(arrow.end.x, arrow.end.y);
    ctx.stroke();

    // 矢印ヘッド
    const headPoints = getArrowHeadPoints(arrow.start, arrow.end, arrow.headSize);
    ctx.beginPath();
    ctx.moveTo(headPoints[0].x, headPoints[0].y);
    ctx.lineTo(headPoints[1].x, headPoints[1].y);
    ctx.lineTo(headPoints[2].x, headPoints[2].y);
    ctx.closePath();
    ctx.fill();
  });
}

function finalizeArrow() {
  const arrow = toolManager.finalizeArrow();
  if (!arrow || !imageState.value?.imageData) return;

  // 矢印が短すぎる場合はスキップ
  const dx = arrow.end.x - arrow.start.x;
  const dy = arrow.end.y - arrow.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 10) return;

  // 新しいCanvasに矢印を描画
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageState.value.width;
  tempCanvas.height = imageState.value.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  // 元の画像を描画
  tempCtx.putImageData(imageState.value.imageData, 0, 0);

  // 矢印を描画
  tempCtx.strokeStyle = arrow.color;
  tempCtx.fillStyle = arrow.color;
  tempCtx.lineWidth = arrow.width;
  tempCtx.lineCap = 'round';

  tempCtx.beginPath();
  tempCtx.moveTo(arrow.start.x, arrow.start.y);
  tempCtx.lineTo(arrow.end.x, arrow.end.y);
  tempCtx.stroke();

  const headPoints = getArrowHeadPoints(arrow.start, arrow.end, arrow.headSize);
  tempCtx.beginPath();
  tempCtx.moveTo(headPoints[0].x, headPoints[0].y);
  tempCtx.lineTo(headPoints[1].x, headPoints[1].y);
  tempCtx.lineTo(headPoints[2].x, headPoints[2].y);
  tempCtx.closePath();
  tempCtx.fill();

  // ImageDataを取得して更新
  const newImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  const newState = {
    ...imageState.value,
    imageData: newImageData,
    lastModified: new Date(),
  };

  drawImage(newState);
  pushHistory(newState, 'Draw arrow');
}

// 選択領域プレビュー
function drawSelectionPreview() {
  const selection = toolManager.getCurrentSelection();
  if (!selection) return;

  drawOverlay((ctx) => {
    // 明るい黄色で枠線を描画
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    ctx.setLineDash([]);

    // 半透明の黄色で背景を塗りつぶし
    ctx.fillStyle = 'rgba(251, 191, 36, 0.1)';
    ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
  });
}

// ブラー適用
async function applyBlur() {
  if (!selectedRegion.value || !imageState.value?.imageData) {
    console.log('No selection or image data');
    return;
  }

  try {
    const newImageData = imageProcessor.applyBlur(
      imageState.value.imageData,
      selectedRegion.value,
      toolState.value.blurSettings.strength
    );

    const newState = {
      ...imageState.value,
      imageData: newImageData,
      lastModified: new Date(),
    };

    imageState.value = newState;
    await nextTick();
    drawImage(newState);
    pushHistory(newState, 'Apply blur');

    // 選択をクリア
    selectedRegion.value = null;
  } catch (error) {
    console.error('Failed to apply blur:', error);
    alert('ブラー処理に失敗しました');
  }
}

// モザイク適用
async function applyMosaic() {
  if (!selectedRegion.value || !imageState.value?.imageData) {
    console.log('No selection or image data');
    return;
  }

  try {
    const newImageData = imageProcessor.applyMosaic(
      imageState.value.imageData,
      selectedRegion.value,
      toolState.value.mosaicSettings.blockSize
    );

    const newState = {
      ...imageState.value,
      imageData: newImageData,
      lastModified: new Date(),
    };

    imageState.value = newState;
    await nextTick();
    drawImage(newState);
    pushHistory(newState, 'Apply mosaic');

    // 選択をクリア
    selectedRegion.value = null;
  } catch (error) {
    console.error('Failed to apply mosaic:', error);
    alert('モザイク処理に失敗しました');
  }
}

// 塗りつぶし適用
async function applyFill() {
  if (!selectedRegion.value || !imageState.value?.imageData) {
    console.log('No selection or image data');
    return;
  }

  try {
    const newImageData = imageProcessor.applyFill(
      imageState.value.imageData,
      selectedRegion.value,
      fillColor.value
    );

    const newState = {
      ...imageState.value,
      imageData: newImageData,
      lastModified: new Date(),
    };

    imageState.value = newState;
    await nextTick();
    drawImage(newState);
    pushHistory(newState, 'Apply fill');

    // 選択をクリア
    selectedRegion.value = null;
  } catch (error) {
    console.error('Failed to apply fill:', error);
    alert('塗りつぶし処理に失敗しました');
  }
}

// エクスポート
async function handleExport() {
  if (!imageState.value?.imageData) {
    alert('画像が読み込まれていません');
    return;
  }

  try {
    const blob = await imageProcessor.exportToPNG(imageState.value.imageData);
    const filename = changeFileExtension(imageState.value.originalFileName, 'png');
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Failed to export image:', error);
    alert('画像のエクスポートに失敗しました');
  }
}

// エクスポート、Undo/Redo、エフェクト適用をexposeする
defineExpose({
  handleExport,
  handleUndo,
  handleRedo,
  applyBlur,
  applyMosaic,
  applyFill,
  clearSelection,
  selectedRegion,
  fillColor,
});
</script>

<template>
  <div class="flex-1 flex flex-col bg-gray-100 relative">
    <!-- ファイル入力 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Canvas領域 -->
    <div
      v-if="hasImage"
      ref="containerRef"
      class="flex-1 overflow-auto bg-gray-100 p-4 relative"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="max-w-screen-2xl mx-auto relative">
        <div class="inline-block">
          <canvas
            ref="canvasRef"
            :style="{ ...canvasStyle, cursor: canvasCursorStyle }"
            class="shadow-lg"
            :class="{
              'select-tool': activeTool === 'select' && !selectedRegion,
              'pen-tool': activeTool === 'pen',
              'arrow-tool': activeTool === 'arrow',
            }"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          />
        </div>

        <!-- ズームコントロール -->
        <div class="absolute bottom-4 right-0 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 z-10">
      <button
        class="btn-icon"
        @click="zoomOut"
        title="ズームアウト"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <span class="text-sm font-mono w-16 text-center">{{ Math.round(zoom * 100) }}%</span>
      <button
        class="btn-icon"
        @click="zoomIn"
        title="ズームイン"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
      <button
        class="btn-icon"
        @click="fitToScreen"
        title="画面に合わせる"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      <button
        class="btn-icon"
        @click="resetZoom"
        title="100%表示"
      >
        <span class="text-xs font-semibold">1:1</span>
      </button>
        </div>
      </div>
    </div>

    <!-- 画像未読み込み時 -->
    <div
      v-else
      class="flex-1 flex items-center justify-center"
      :class="{ 'bg-primary-50 border-4 border-dashed border-primary-300': isDragging }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="text-center">
        <svg class="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">画像をドロップするか、クリックして選択</h3>
        <p class="text-gray-500 mb-6">PNG, JPEG, GIF, WebP形式に対応（最大10MB）</p>
        <button class="btn btn-primary" @click="handleFileSelect">
          画像を選択
        </button>
      </div>
    </div>
  </div>
</template>
