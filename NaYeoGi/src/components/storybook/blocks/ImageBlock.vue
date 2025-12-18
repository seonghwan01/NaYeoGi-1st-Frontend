<template>
  <figure class="block-image my-4">
    <img :src="block.url" :alt="block.caption" class="img-fluid rounded shadow-sm" />
    <figcaption
      ref="editableElement"
      class="text-center text-muted small mt-2"
      contenteditable="true"
      @blur="emitUpdate"
      placeholder="캡션을 입력하세요..."
    >
      {{ block.caption }}
    </figcaption>
  </figure>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:caption']);

const editableElement = ref(null);

// 사용자가 캡션 수정을 마치고 포커스를 잃었을 때 (blur)
const emitUpdate = () => {
  // 수정된 캡션 텍스트를 부모 컴포넌트로 전달
  emit('update:caption', editableElement.value.innerText);
};
</script>

<style scoped>
.block-image figcaption {
  outline: none;
  transition: background-color 0.2s;
  padding: 4px 8px;
}

.block-image figcaption:focus {
  background-color: #f8f9fa;
  box-shadow: 0 0 0 2px #e9ecef;
  border-radius: 4px;
}

/* 비어있을 때 placeholder 표시 */
.block-image figcaption:empty:before {
  content: attr(placeholder);
  color: #adb5bd;
  pointer-events: none;
}
</style>
