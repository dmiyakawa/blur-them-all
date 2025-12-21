import { ref, computed } from 'vue';
import type { ToolType, ToolState } from '@/types/tool';
import { toolManager } from '@/services/ToolManager';

// モジュールレベルでstateを定義（すべてのコンポーネントで共有）
const activeTool = ref<ToolType>('select');
const toolState = ref<ToolState>(toolManager.getToolState());

export function useTools() {
  /**
   * ツールを選択
   */
  function selectTool(tool: ToolType): void {
    console.log('useTools.selectTool called:', tool);
    activeTool.value = tool;
    toolManager.selectTool(tool);
    console.log('activeTool.value updated to:', activeTool.value);
  }

  /**
   * ペン設定を更新
   */
  function updatePenSettings(settings: Partial<ToolState['penSettings']>): void {
    toolManager.updatePenSettings(settings);
    toolState.value = toolManager.getToolState();
  }

  /**
   * 矢印設定を更新
   */
  function updateArrowSettings(settings: Partial<ToolState['arrowSettings']>): void {
    toolManager.updateArrowSettings(settings);
    toolState.value = toolManager.getToolState();
  }

  /**
   * ブラー設定を更新
   */
  function updateBlurSettings(settings: Partial<ToolState['blurSettings']>): void {
    toolManager.updateBlurSettings(settings);
    toolState.value = toolManager.getToolState();
  }

  /**
   * モザイク設定を更新
   */
  function updateMosaicSettings(settings: Partial<ToolState['mosaicSettings']>): void {
    toolManager.updateMosaicSettings(settings);
    toolState.value = toolManager.getToolState();
  }

  /**
   * リサイズ設定を更新
   */
  function updateResizeSettings(settings: Partial<ToolState['resizeSettings']>): void {
    toolManager.updateResizeSettings(settings);
    toolState.value = toolManager.getToolState();
  }

  /**
   * 現在のツール設定を取得
   */
  const currentToolSettings = computed(() => {
    switch (activeTool.value) {
      case 'pen':
        return toolState.value.penSettings;
      case 'arrow':
        return toolState.value.arrowSettings;
      case 'blur':
        return toolState.value.blurSettings;
      case 'mosaic':
        return toolState.value.mosaicSettings;
      case 'resize':
        return toolState.value.resizeSettings;
      default:
        return null;
    }
  });

  return {
    activeTool,
    toolState,
    currentToolSettings,
    selectTool,
    updatePenSettings,
    updateArrowSettings,
    updateBlurSettings,
    updateMosaicSettings,
    updateResizeSettings,
  };
}
