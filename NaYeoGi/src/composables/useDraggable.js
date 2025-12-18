import { ref } from 'vue';

/**
 * Vue 컴포넌트에서 드래그 앤 드롭 정렬 기능을 제공하는 컴포저블 함수
 * @param {Ref<Array>} itemsRef - 정렬할 아이템들이 담긴 ref 객체 (예: storyDays)
 */
export function useDraggable(itemsRef) {
  // 드래그 활성화 여부 (핸들을 눌렀을 때만 true)
  const isDragEnabled = ref(false);
  // 드래그 시작 요소의 정보 { dayIdx, secIdx }
  const dragSource = ref(null);
  // 드롭 대상 요소의 정보 { dayIdx, secIdx }
  const dragTarget = ref(null);

  // --- 드래그 핸들 관련 함수 ---
  const onHandleMouseDown = () => {
    isDragEnabled.value = true;
  };
  const onHandleMouseUp = () => {
    isDragEnabled.value = false;
  };

  // --- 드래그 이벤트 핸들러 ---
  const onDragStart = (e, dayIdx, secIdx) => {
    if (!isDragEnabled.value) {
      e.preventDefault();
      return;
    }
    dragSource.value = { dayIdx, secIdx };
    e.dataTransfer.effectAllowed = 'move';
    // 드래그 시 반투명한 고스트 이미지가 보이도록 설정 (기본값)
  };

  const onDragOver = (e) => {
    // 드래그 중일 때만 오토 스크롤 실행
    if (!dragSource.value) return;

    const threshold = 100; // 화면 상하단 100px 영역을 감지
    const speed = 10;      // 스크롤 속도

    if (e.clientY < threshold) {
      window.scrollBy(0, -speed); // 위로 스크롤
    } else if (window.innerHeight - e.clientY < threshold) {
      window.scrollBy(0, speed); // 아래로 스크롤
    }
  };

  const onDragEnter = (dayIdx, secIdx) => {
    if (!dragSource.value) return;
    // 자기 자신 위로 들어온 경우는 무시
    if (dayIdx !== dragSource.value.dayIdx || secIdx !== dragSource.value.secIdx) {
      dragTarget.value = { dayIdx, secIdx };
    }
  };

  const onDrop = (toDayIdx, toSecIdx = null) => {
    if (!dragSource.value) return;

    const { dayIdx: fromDay, secIdx: fromSec } = dragSource.value;

    // 같은 위치에 드롭된 경우 무시
    if (fromDay === toDayIdx && fromSec === toSecIdx) {
      clearDragState();
      return;
    }

    // 1. 원본 배열에서 드래그한 아이템을 제거하고 변수에 저장
    const itemToMove = itemsRef.value[fromDay].sections.splice(fromSec, 1)[0];

    // 2. 드롭 위치에 아이템을 추가
    if (toSecIdx !== null) {
      // 다른 아이템 위에 드롭한 경우, 그 아이템 앞에 추가
      itemsRef.value[toDayIdx].sections.splice(toSecIdx, 0, itemToMove);
    } else {
      // 빈 Day 영역에 드롭한 경우, 그 Day의 마지막에 추가
      itemsRef.value[toDayIdx].sections.push(itemToMove);
    }

    clearDragState();
  };

  const onDragEnd = () => {
    clearDragState();
  };

  // --- 유틸리티 함수 ---
  const clearDragState = () => {
    dragSource.value = null;
    dragTarget.value = null;
    isDragEnabled.value = false;
  };

  // 현재 드래그 중인 아이템인지 확인 (스타일링용)
  const isDragging = (dayIdx, secIdx) => {
    if (!dragSource.value) return false;
    return dragSource.value.dayIdx === dayIdx && dragSource.value.secIdx === secIdx;
  };

  // 컴포넌트에서 사용할 수 있도록 상태와 함수들을 반환
  return {
    isDragEnabled,
    isDragging,
    onHandleMouseDown,
    onHandleMouseUp,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDrop,
    onDragEnd,
  };
}
