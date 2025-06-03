<script setup lang="ts">
import { ref, watch } from 'vue';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const props = defineProps<{
  modelValue?: File | null;
  label?: string;
  id?: string;
  accept?: string;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isDragOver = ref(false);
const internalFile = ref<File | null>(props.modelValue || null);

watch(() => props.modelValue, (newVal) => {
  internalFile.value = newVal ?? null;
});

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  internalFile.value = file;
  emit('update:modelValue', file);
  emit('change', event);
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
}

function handleDragLeave() {
  isDragOver.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  const file = event.dataTransfer?.files ? event.dataTransfer.files[0] : null;
  if (file) {
    internalFile.value = file;
    emit('update:modelValue', file);
    // Manually trigger change event for consistency with input type="file"
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const input = document.getElementById(props.id || 'file-upload-input') as HTMLInputElement;
    if (input) {
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

function triggerFileInput() {
  const input = document.getElementById(props.id || 'file-upload-input');
  input?.click();
}
</script>

<template>
  <div
    :class="cn(
      'flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200',
      isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="!disabled && triggerFileInput()"
  >
    <input
      :id="id || 'file-upload-input'"
      type="file"
      class="hidden"
      :accept="accept"
      :disabled="disabled"
      @change="handleFileChange"
    />
    <div class="flex flex-col items-center justify-center pt-5 pb-6">
      <svg
        class="w-10 h-10 mb-3 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a3 3 0 013 3v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"
        ></path>
      </svg>
      <p class="mb-2 text-sm text-gray-500">
        <span class="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p class="text-xs text-gray-500">
        {{ accept ? `(${accept.split(',').map(a => a.trim().toUpperCase()).join(', ')})` : 'Any file type' }}
      </p>
    </div>
  </div>
  <p v-if="internalFile" class="mt-2 text-sm text-gray-600">
    Selected file: <span class="font-medium text-blue-700">{{ internalFile.name }}</span>
  </p>
  <p v-else-if="label" class="mt-2 text-sm text-gray-600">
    {{ label }}
  </p>
</template>
