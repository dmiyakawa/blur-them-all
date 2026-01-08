<script setup lang="ts">
import { ref } from 'vue';
import { useHistory } from '@/composables/useHistory';

const { canUndo, canRedo, undo, redo } = useHistory();

const emit = defineEmits<{
  export: [];
  undo: [];
  redo: [];
}>();

function handleUndo() {
  emit('undo');
}

function handleRedo() {
  emit('redo');
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-4 py-3">
    <div class="max-w-screen-2xl mx-auto flex items-center justify-between">
      <!-- Title -->
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-bold text-gray-900">Blur Them All</h1>
        <span class="text-sm text-gray-500">モザイク・ブラー画像編集ツール</span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <!-- Undo/Redo -->
        <div class="flex items-center gap-1 mr-4">
          <button
            class="btn-icon"
            :disabled="!canUndo"
            :class="{ 'opacity-50 cursor-not-allowed': !canUndo }"
            @click="handleUndo"
            title="元に戻す (Ctrl+Z)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            class="btn-icon"
            :disabled="!canRedo"
            :class="{ 'opacity-50 cursor-not-allowed': !canRedo }"
            @click="handleRedo"
            title="やり直す (Ctrl+Y)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        <!-- Export button -->
        <button class="btn btn-primary flex items-center gap-2" @click="$emit('export')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          画像を保存
        </button>
      </div>
    </div>
  </header>
</template>
