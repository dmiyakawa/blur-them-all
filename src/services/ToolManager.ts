import type { ToolType, ToolState, Point } from '@/types/tool';
import type { Path, Arrow } from '@/types/layer';
import { TOOL_CONFIG } from '@/constants';

export class ToolManager {
  private toolState: ToolState = {
    activeTool: 'select',
    penSettings: {
      color: TOOL_CONFIG.PEN.DEFAULT_COLOR,
      width: TOOL_CONFIG.PEN.DEFAULT_WIDTH,
    },
    arrowSettings: {
      color: TOOL_CONFIG.ARROW.DEFAULT_COLOR,
      width: TOOL_CONFIG.ARROW.DEFAULT_WIDTH,
      headSize: TOOL_CONFIG.ARROW.DEFAULT_HEAD_SIZE,
    },
    blurSettings: {
      strength: TOOL_CONFIG.BLUR.DEFAULT_STRENGTH,
    },
    mosaicSettings: {
      blockSize: TOOL_CONFIG.MOSAIC.DEFAULT_BLOCK_SIZE,
    },
    resizeSettings: {
      width: 0,
      height: 0,
      maintainAspectRatio: true,
    },
  };

  private currentPath: Path | null = null;
  private currentArrow: Arrow | null = null;

  /**
   * アクティブなツールを選択
   */
  selectTool(tool: ToolType): void {
    this.toolState.activeTool = tool;
  }

  /**
   * 現在のツールを取得
   */
  getActiveTool(): ToolType {
    return this.toolState.activeTool;
  }

  /**
   * ツール状態を取得
   */
  getToolState(): ToolState {
    return { ...this.toolState };
  }

  /**
   * ペン設定を更新
   */
  updatePenSettings(settings: Partial<typeof this.toolState.penSettings>): void {
    this.toolState.penSettings = { ...this.toolState.penSettings, ...settings };
  }

  /**
   * 矢印設定を更新
   */
  updateArrowSettings(settings: Partial<typeof this.toolState.arrowSettings>): void {
    this.toolState.arrowSettings = { ...this.toolState.arrowSettings, ...settings };
  }

  /**
   * ブラー設定を更新
   */
  updateBlurSettings(settings: Partial<typeof this.toolState.blurSettings>): void {
    this.toolState.blurSettings = { ...this.toolState.blurSettings, ...settings };
  }

  /**
   * モザイク設定を更新
   */
  updateMosaicSettings(settings: Partial<typeof this.toolState.mosaicSettings>): void {
    this.toolState.mosaicSettings = { ...this.toolState.mosaicSettings, ...settings };
  }

  /**
   * リサイズ設定を更新
   */
  updateResizeSettings(settings: Partial<typeof this.toolState.resizeSettings>): void {
    this.toolState.resizeSettings = { ...this.toolState.resizeSettings, ...settings };
  }

  // === ペン描画関連 ===

  /**
   * ペンストロークを開始
   */
  startPenStroke(point: Point): void {
    this.currentPath = {
      points: [point],
      color: this.toolState.penSettings.color,
      width: this.toolState.penSettings.width,
    };
  }

  /**
   * ペンストロークを継続
   */
  continuePenStroke(point: Point): void {
    if (this.currentPath) {
      this.currentPath.points.push(point);
    }
  }

  /**
   * ペンストロークを終了
   */
  endPenStroke(): Path | null {
    const path = this.currentPath;
    this.currentPath = null;
    return path;
  }

  /**
   * 現在のペンストロークを取得
   */
  getCurrentPath(): Path | null {
    return this.currentPath;
  }

  // === 矢印関連 ===

  /**
   * 矢印の配置を開始
   */
  startArrow(point: Point): void {
    this.currentArrow = {
      id: crypto.randomUUID(),
      start: point,
      end: point,
      color: this.toolState.arrowSettings.color,
      width: this.toolState.arrowSettings.width,
      headSize: this.toolState.arrowSettings.headSize,
    };
  }

  /**
   * 矢印の終点を更新
   */
  updateArrow(point: Point): void {
    if (this.currentArrow) {
      this.currentArrow.end = point;
    }
  }

  /**
   * 矢印の配置を確定
   */
  finalizeArrow(): Arrow | null {
    const arrow = this.currentArrow;
    this.currentArrow = null;
    return arrow;
  }

  /**
   * 現在の矢印を取得
   */
  getCurrentArrow(): Arrow | null {
    return this.currentArrow;
  }

  // === 選択領域関連 ===

  private selectionStart: Point | null = null;
  private selectionEnd: Point | null = null;

  /**
   * 選択を開始
   */
  startSelection(point: Point): void {
    this.selectionStart = point;
    this.selectionEnd = point;
  }

  /**
   * 選択を更新
   */
  updateSelection(point: Point): void {
    this.selectionEnd = point;
  }

  /**
   * 選択を終了して領域を取得
   */
  finalizeSelection(): { x: number; y: number; width: number; height: number } | null {
    if (!this.selectionStart || !this.selectionEnd) {
      return null;
    }

    const region = {
      x: Math.min(this.selectionStart.x, this.selectionEnd.x),
      y: Math.min(this.selectionStart.y, this.selectionEnd.y),
      width: Math.abs(this.selectionEnd.x - this.selectionStart.x),
      height: Math.abs(this.selectionEnd.y - this.selectionStart.y),
    };

    this.selectionStart = null;
    this.selectionEnd = null;

    return region;
  }

  /**
   * 現在の選択領域を取得
   */
  getCurrentSelection(): { x: number; y: number; width: number; height: number } | null {
    if (!this.selectionStart || !this.selectionEnd) {
      return null;
    }

    return {
      x: Math.min(this.selectionStart.x, this.selectionEnd.x),
      y: Math.min(this.selectionStart.y, this.selectionEnd.y),
      width: Math.abs(this.selectionEnd.x - this.selectionStart.x),
      height: Math.abs(this.selectionEnd.y - this.selectionStart.y),
    };
  }

  /**
   * 選択をキャンセル
   */
  cancelSelection(): void {
    this.selectionStart = null;
    this.selectionEnd = null;
  }
}

export const toolManager = new ToolManager();
