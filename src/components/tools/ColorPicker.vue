<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  color: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:color': [color: string];
}>();

function handleColorChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:color', target.value);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      type="color"
      :value="color"
      @input="handleColorChange"
      class="w-10 h-10 rounded border border-gray-300 cursor-pointer"
    />
    <span class="text-sm text-gray-600 font-mono">{{ color }}</span>
  </div>
</template>
