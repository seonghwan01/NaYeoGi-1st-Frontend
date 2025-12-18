import { ref } from 'vue';

/**
 * 1차원 배열의 드래그 앤 드롭 정렬 기능을 제공하는 간단한 컴포저블
 * @param {Ref<Array>} itemsRef - 정렬할 아이템들이 담긴 1차원 배열 ref 객체
 */
export function useSimpleDraggable(itemsRef) {
  const dragSourceIndex = ref(null); // 드래그 시작 요소의 인덱스
  const dragTargetIndex = ref(null); // 드롭 대상 요소의 인덱스

  const onDragStart = (index) => {
    dragSourceIndex.value = index;
  };

  const onDragEnter = (index) => {
    if (index !== dragSourceIndex.value) {
      dragTargetIndex.value = index;
    }
  };

  const onDrop = (toIndex) => {
    if (dragSourceIndex.value === null) return;

    const fromIndex = dragSourceIndex.value;
    if (fromIndex === toIndex) {
      clearDragState();
      return;
    }

    // 배열 순서 변경
    const itemToMove = itemsRef.value.splice(fromIndex, 1)[0];
    itemsRef.value.splice(toIndex, 0, itemToMove);

    clearDragState();
  };

  const onDragEnd = () => {
    clearDragState();
  };

  const clearDragState = () => {
    dragSourceIndex.value = null;
    dragTargetIndex.value = null;
  };

  // 현재 드래그 중인 아이템인지 확인 (스타일링용)
  const isDragging = (index) => {
    return dragSourceIndex.value === index;
  };

  return {
    isDragging,
    onDragStart,
    onDragEnter,
    onDrop,
    onDragEnd,
  };
}
