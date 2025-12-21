<script setup lang="ts">
import { computed } from 'vue';
import type { ToolType } from '@/types/tool';
import { useTools } from '@/composables/useTools';

const { activeTool, selectTool } = useTools();

interface Tool {
  id: ToolType;
  name: string;
  icon: string;
}

const tools: Tool[] = [
  { id: 'select', name: '選択', icon: 'cursor' },
  { id: 'pen', name: 'ペン', icon: 'pen' },
  { id: 'arrow', name: '矢印', icon: 'arrow' },
  { id: 'resize', name: 'リサイズ', icon: 'resize' },
];

function handleToolSelect(toolId: ToolType) {
  console.log('Tool selected:', toolId);
  selectTool(toolId);
  console.log('Active tool after selection:', activeTool.value);
}

// SVGアイコンのパス
const getIconPath = (icon: string) => {
  const icons: Record<string, string> = {
    cursor: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z',
    pen: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    arrow: 'M17 8l4 4m0 0l-4 4m4-4H3',
    blur: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    mosaic: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
    resize: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
  };
  return icons[icon] || icons.cursor;
};
</script>

<template>
  <div class="flex flex-col gap-2 p-2 overflow-y-auto">
    <div
      v-for="tool in tools"
      :key="tool.id"
      class="toolbar-item"
      :class="{ active: activeTool === tool.id }"
      @click="handleToolSelect(tool.id)"
      :title="tool.name"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(tool.icon)" />
      </svg>
      <span class="text-xs">{{ tool.name }}</span>
    </div>
  </div>
</template>
