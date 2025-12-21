<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTools } from '@/composables/useTools';
import ColorPicker from '../tools/ColorPicker.vue';
import SliderInput from '../tools/SliderInput.vue';

const {
  activeTool,
  toolState,
  updatePenSettings,
  updateArrowSettings,
  updateBlurSettings,
  updateMosaicSettings,
  updateResizeSettings,
} = useTools();

// CanvasEditorへの参照をpropsとして受け取る
interface Props {
  canvasEditorRef: any;
}

const props = defineProps<Props>();

// 選択状態を監視
const hasSelection = computed(() => {
  return props.canvasEditorRef?.selectedRegion?.value !== null;
});

// ペン設定
function handlePenColorChange(color: string) {
  updatePenSettings({ color });
}

function handlePenWidthChange(width: number) {
  updatePenSettings({ width });
}

// 矢印設定
function handleArrowColorChange(color: string) {
  updateArrowSettings({ color });
}

function handleArrowWidthChange(width: number) {
  updateArrowSettings({ width });
}

function handleArrowHeadSizeChange(headSize: number) {
  updateArrowSettings({ headSize });
}

// ブラー設定
function handleBlurStrengthChange(strength: number) {
  updateBlurSettings({ strength });
}

// モザイク設定
function handleMosaicBlockSizeChange(blockSize: number) {
  updateMosaicSettings({ blockSize });
}
</script>

<template>
  <div class="p-4">
    <div class="max-w-screen-2xl mx-auto w-full">
      <!-- 選択ツール - 選択後のエフェクトボタン -->
      <div v-if="activeTool === 'select'">
        <div v-if="hasSelection" class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-700">エフェクトを選択:</span>

          <!-- ブラー強度設定 -->
          <div class="flex items-center gap-2">
            <SliderInput
              label="ブラー強度"
              :value="toolState.blurSettings.strength"
              :min="1"
              :max="20"
              @update:value="handleBlurStrengthChange"
              class="w-48"
            />
          </div>

          <button class="btn btn-primary" @click="canvasEditorRef?.applyBlur()">
            ブラーを適用
          </button>

          <!-- モザイクブロックサイズ設定 -->
          <div class="flex items-center gap-2">
            <SliderInput
              label="ブロックサイズ"
              :value="toolState.mosaicSettings.blockSize"
              :min="4"
              :max="32"
              @update:value="handleMosaicBlockSizeChange"
              class="w-48"
            />
          </div>

          <button class="btn btn-primary" @click="canvasEditorRef?.applyMosaic()">
            モザイクを適用
          </button>

          <!-- 塗りつぶし色設定 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">塗りつぶし色:</label>
            <ColorPicker
              :color="canvasEditorRef?.fillColor?.value || '#000000'"
              @update:color="(color) => { if (canvasEditorRef?.fillColor) canvasEditorRef.fillColor.value = color }"
            />
          </div>

          <button class="btn btn-primary" @click="canvasEditorRef?.applyFill()">
            塗りつぶし
          </button>

          <button class="btn btn-secondary" @click="canvasEditorRef?.clearSelection()">
            選択解除
          </button>
        </div>
        <div v-else class="text-center text-gray-500 py-2">
          矩形範囲をドラッグして選択してください
        </div>
      </div>

      <!-- ペン設定 -->
      <div v-else-if="activeTool === 'pen'" class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">色:</label>
          <ColorPicker :color="toolState.penSettings.color" @update:color="handlePenColorChange" />
        </div>
        <div class="flex-1 max-w-xs">
          <SliderInput
            label="太さ"
            :value="toolState.penSettings.width"
            :min="1"
            :max="20"
            @update:value="handlePenWidthChange"
          />
        </div>
      </div>

      <!-- 矢印設定 -->
      <div v-else-if="activeTool === 'arrow'" class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">色:</label>
          <ColorPicker :color="toolState.arrowSettings.color" @update:color="handleArrowColorChange" />
        </div>
        <div class="flex-1 max-w-xs">
          <SliderInput
            label="太さ"
            :value="toolState.arrowSettings.width"
            :min="1"
            :max="10"
            @update:value="handleArrowWidthChange"
          />
        </div>
        <div class="flex-1 max-w-xs">
          <SliderInput
            label="矢印サイズ"
            :value="toolState.arrowSettings.headSize"
            :min="5"
            :max="30"
            @update:value="handleArrowHeadSizeChange"
          />
        </div>
      </div>

      <!-- リサイズ設定 -->
      <div v-else-if="activeTool === 'resize'" class="flex items-center gap-4">
        <div class="text-sm text-gray-600">
          リサイズ機能は今後実装予定です
        </div>
      </div>
    </div>
  </div>
</template>
