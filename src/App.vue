<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import Toolbar from './components/layout/Toolbar.vue';
import PropertyPanel from './components/layout/PropertyPanel.vue';
import CanvasEditor from './components/canvas/CanvasEditor.vue';
import { useStorage } from './composables/useStorage';
import { useTools } from './composables/useTools';
import { useHistory } from './composables/useHistory';

const { initStorage, restoreLatestSession } = useStorage();
const { activeTool } = useTools();
const { updateHistoryInfo } = useHistory();

const canvasEditorRef = ref<InstanceType<typeof CanvasEditor> | null>(null);

onMounted(async () => {
  await initStorage();
  updateHistoryInfo();

  // 前回のセッションを復元（将来の拡張）
  // const session = await restoreLatestSession();
  // if (session) {
  //   // セッションを復元
  // }
});

function handleExport() {
  canvasEditorRef.value?.handleExport();
}

function handleUndo() {
  canvasEditorRef.value?.handleUndo();
}

function handleRedo() {
  canvasEditorRef.value?.handleRedo();
}
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Header - Fixed -->
    <AppHeader @export="handleExport" @undo="handleUndo" @redo="handleRedo" />

    <!-- Main content - Fixed height, no overflow -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- Toolbar - Fixed, no scroll -->
      <Toolbar class="w-20 border-r border-gray-200 bg-white flex-shrink-0" />

      <!-- Canvas area - Scrollable -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CanvasEditor ref="canvasEditorRef" class="flex-1 overflow-auto" />

        <!-- Property panel - Fixed at bottom -->
        <PropertyPanel :canvasEditorRef="canvasEditorRef" class="border-t border-gray-200 bg-white flex-shrink-0" />
      </div>
    </div>
  </div>
</template>
