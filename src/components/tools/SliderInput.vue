<script setup lang="ts">
interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
});

const emit = defineEmits<{
  'update:value': [value: number];
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:value', Number(target.value));
}
</script>

<template>
  <div class="flex items-center gap-3">
    <label class="text-sm font-medium text-gray-700 whitespace-nowrap">{{ label }}:</label>
    <input
      type="range"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      @input="handleInput"
      class="flex-1"
    />
    <span class="text-sm text-gray-600 font-mono w-12 text-right">{{ value }}</span>
  </div>
</template>

<style scoped>
input[type="range"] {
  @apply w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-primary-600 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-primary-600 rounded-full cursor-pointer border-0;
}
</style>
