<template>
  <h3
    ref="editableElement"
    class="block-heading"
    contenteditable="true"
    @blur="emitUpdate"
    @keydown.enter.prevent="emitEnterKey"
  >
    {{ block.content }}
  </h3>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:content', 'add-new-block']);

const editableElement = ref(null);

// 사용자가 수정을 마치고 포커스를 잃었을 때 (blur)
const emitUpdate = () => {
  // 수정된 내부 텍스트를 부모 컴포넌트로 전달
  emit('update:content', editableElement.value.innerText);
};

// 사용자가 Enter 키를 눌렀을 때
const emitEnterKey = () => {
  // 새로운 문단 블록을 추가하라는 이벤트를 부모로 전달
  emit('add-new-block');
};
</script>

<style scoped>
.block-heading {
  font-weight: bold;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  outline: none; /* contenteditable의 기본 아웃라인 제거 */
  transition: background-color 0.2s;
}

/* 포커스되었을 때 약간의 배경색을 주어 편집 중임을 표시 */
.block-heading:focus {
  background-color: #f8f9fa;
  box-shadow: 0 0 0 2px #e9ecef;
  border-radius: 4px;
}
</style>
