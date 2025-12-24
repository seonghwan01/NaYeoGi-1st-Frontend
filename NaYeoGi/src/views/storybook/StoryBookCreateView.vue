<template>
  <div class="container py-5" style="max-width: 900px;">
    <ContentCard>
      <!-- 로딩 오버레이 (AI 생성 또는 최종 저장 시) -->
      <!-- Teleport를 사용하여 DOM 최상위로 이동시켜 CSS fixed가 뷰포트 기준으로 동작하게 함 -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="storybookStore.isLoading" class="loading-overlay">
              <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
              <h4 class="mt-4 fw-bold text-dark">{{ currentLoadingMessage }}</h4>
              <p class="text-muted mb-0">잠시만 기다려주세요.</p>
          </div>
        </transition>
      </Teleport>

      <div class="text-center mb-5">
        <h1 class="fw-bold display-6 mb-2">✨ AI 여행 기록</h1>
        <p class="text-muted">카드 왼쪽 위의 손잡이를 잡고 자유롭게 순서를 바꿔보세요.</p>
      </div>

      <!-- 데이터 로딩 중 화면 -->
      <div v-if="planStore.isLoading && !currentStory.storyDays.length" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
        <h4 class="mt-4 fw-bold">여행 계획을 불러오는 중...</h4>
      </div>

      <!-- 데이터 로드 완료 후 화면 -->
      <div v-if="!planStore.isLoading && currentStory.storyDays.length > 0">
        <div class="card shadow-sm mb-5 border-0">
          <div class="card-body p-4 bg-white rounded">
            <!-- (기존 UI 동일) -->
            <div class="mb-4">
              <label class="form-label fw-bold text-dark">🏷️ 여행 제목 <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-lg bg-light border-0" v-model="currentStory.storyTitle" placeholder="예: 3대가 함께한 우당탕탕 제주 여행">
            </div>
            <div class="mb-4">
              <label class="form-label fw-bold text-dark mb-2">🗓️ 여행 기간</label>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6">📅 {{ formattedDate }}</span>
                <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 rounded-pill fs-6">⏱️ {{ durationLabel }}</span>
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 rounded-pill fs-6">{{ seasonLabel }}</span>
              </div>
            </div>
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-bold text-dark mb-0">👥 누구와 함께했나요? <span class="text-danger">*</span> <span class="text-primary small">(최대 3개)</span></label>
                <span class="small text-muted" v-if="currentStory.companions.length > 0">{{ currentStory.companions.map(id => getLabel(COMPANIONS, id)).join(', ') }}</span>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button v-for="c in COMPANIONS" :key="c.id" class="btn btn-sm rounded-pill px-3 py-2 transition-btn" :class="currentStory.companions.includes(c.id) ? 'btn-dark' : 'btn-outline-secondary border-0 bg-light text-secondary'" @click="toggleSelection(currentStory.companions, c.id, 3)">{{ c.icon }} {{ c.label }}</button>
              </div>
            </div>
            <div class="mb-2">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-bold text-dark mb-0">🎨 전체적인 글 분위기 <span class="text-danger">*</span> <span class="text-primary small">(최대 3개)</span></label>
                <span class="small text-muted" v-if="currentStory.tones.length > 0">{{ currentStory.tones.map(id => getLabel(STORY_TONES, id)).join(', ') }}</span>
              </div>
              
              <div v-for="category in STORY_TONES_CATEGORIES" :key="category.label" class="mb-3">
                <h6 class="fw-bold small text-muted mb-2 ps-1">{{ category.label }}</h6>
                <div class="d-flex flex-wrap gap-2">
                  <button 
                    v-for="t in category.items" 
                    :key="t.id" 
                    class="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 transition-btn" 
                    :class="currentStory.tones.includes(t.id) ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0 bg-light text-secondary'" 
                    @click="toggleSelection(currentStory.tones, t.id, 3)"
                  >
                    <span>{{ t.icon }}</span><span>{{ t.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 일차별 기록 -->
        <div v-for="(dayItem, dayIndex) in currentStory.storyDays" :key="dayIndex" class="card mb-5 border-0 shadow-sm bg-light">
          <!-- (기존 UI 동일) -->
          <div
            class="card-header bg-white border-bottom-0 p-4 rounded-top"
            @dragover.prevent="onDragOver"
            @drop="onDrop(dayIndex)"
          >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="fw-bold mb-0 text-primary">
                <span class="badge bg-primary me-2">Day {{ dayItem.dayNum }}</span>
                <span class="text-dark fs-5 align-middle">{{ dayItem.date }} ({{ getDayOfWeek(dayItem.date) }})</span>
              </h4>
            </div>
            <div class="bg-light p-3 rounded border border-light-subtle">
               <label class="form-label small text-muted fw-bold mb-2">⛅ Day {{ dayItem.dayNum }}의 날씨는 어땠나요? <span class="text-warning-emphasis">(최대 3개)</span></label>
               <div v-for="cat in WEATHER_TAGS_CATEGORIES" :key="cat.label" class="mb-2">
                  <div class="d-flex flex-wrap gap-2">
                      <button v-for="w in cat.items" :key="w.id" class="btn btn-sm rounded-pill px-3 py-1 transition-btn" :class="dayItem.weather.includes(w.id) ? 'btn-warning text-dark border-warning' : 'btn-white border text-secondary'" @click="toggleSelection(dayItem.weather, w.id, 3)">{{ w.icon }} {{ w.label }}</button>
                  </div>
               </div>
            </div>
          </div>
          <div class="card-body p-3 min-h-100"
               @dragover.prevent="onDragOver"
               @drop="onDrop(dayIndex)"
          >
            <div v-if="dayItem.sections.length === 0" class="text-center py-5 text-muted border rounded border-dashed bg-white mb-3">
              <p class="mb-0">방문한 장소가 없습니다.<br>장소를 추가하거나 드래그해오세요.</p>
            </div>
            <div
              v-for="(section, secIndex) in dayItem.sections"
              :key="section.id"
              class="draggable-item position-relative mb-4 ms-2"
              :class="{ 'dragging': isDragging(dayIndex, secIndex) }"
              :draggable="isDragEnabled"
              @dragstart="onDragStart($event, dayIndex, secIndex)"
              @dragend="onDragEnd"
              @dragenter.prevent="onDragEnter(dayIndex, secIndex)"
              @dragover.prevent="onDragOver"
              @drop.stop="onDrop(dayIndex, secIndex)"
            >
              <div
                class="drag-handle-outer d-flex justify-content-center align-items-center shadow-sm"
                title="이동하려면 잡고 드래그하세요"
                @mousedown="onHandleMouseDown"
                @mouseup="onHandleMouseUp"
              >
                <i class="bi bi-grip-vertical text-secondary" style="font-size: 1.2rem;"></i>
              </div>
              <StorySection
                :index="secIndex"
                :sectionData="section"
                @remove-section="removeSection(dayIndex, secIndex)"
                @add-images="(files) => handleImageUpload(dayIndex, secIndex, files)"
                @remove-image="(imageIndex) => handleImageDelete(dayIndex, secIndex, imageIndex)"
                @update-content="(text) => section.content = text"
                @update-place-name="(text) => section.placeName = text"
                @toggle-tag="(tag) => toggleTag(section, tag)"
                @preview-image="openImageModal"
              >
                <template #day-control>
                  <div class="ms-3">
                    <select
                      class="form-select form-select-sm border-0 bg-light text-secondary fw-bold"
                      style="width: 80px; font-size: 0.75rem;"
                      :value="dayIndex"
                      @change="(e) => moveSectionToDay(dayIndex, secIndex, parseInt(e.target.value))"
                    >
                      <option v-for="(d, idx) in currentStory.storyDays" :key="idx" :value="idx">Day {{ d.dayNum }}</option>
                    </select>
                  </div>
                </template>
              </StorySection>
            </div>
            <button class="btn btn-white w-100 border-dashed text-primary py-3 mt-2 fw-bold" @click="addSectionToDay(dayIndex)">
              <i class="bi bi-plus-lg me-1"></i> Day {{ dayItem.dayNum }}에 장소 추가하기
            </button>
          </div>
        </div>
      </div>

      <!-- 데이터 로드 실패 또는 데이터가 없는 경우 -->
      <div v-if="!planStore.isLoading && currentStory.storyDays.length === 0" class="text-center py-5">
        <h5 class="text-muted">여행 기록을 불러오지 못했습니다.</h5>
        <p class="text-muted small">이전 페이지로 돌아가 다시 시도해주세요.</p>
      </div>

      <div style="height: 80px;"></div>
      <div v-if="modalImage" class="image-modal-overlay" @click="closeImageModal">
        <div class="image-modal-content"><img :src="modalImage" class="img-fluid rounded shadow"></div>
      </div>
    </ContentCard>

    <!-- 하단 고정 버튼 (Viewport 기준 고정) -->
    <div class="fixed-bottom d-flex justify-content-center pb-5" style="z-index: 1050; pointer-events: none;">
      <button 
        class="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg ai-generate-btn d-flex align-items-center gap-2"
        @click="generateStory"
        style="pointer-events: auto; border: none; font-weight: 600;"
      >
        <span>✨</span>
        <span>스토리 생성하기</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, toRef, watch } from 'vue';
import { storeToRefs } from 'pinia';
import StorySection from '@/components/storybook/StorySection.vue';
import ContentCard from '@/components/common/ContentCard.vue';
import { useStorybookStore } from '@/stores/storybook';
import { usePlanStore } from '@/stores/plan';
import { useDraggable } from '@/composables/useDraggable';
import {
  WEATHER_TAGS,
  WEATHER_TAGS_CATEGORIES,
  STORY_TONES,
  STORY_TONES_CATEGORIES,
  COMPANIONS,
} from '@/constants/storybook/storyConstants';

// --- Props, 스토어, 라우터 설정 ---
const props = defineProps({
  planId: {
    type: String,
    required: true,
  },
});

const storybookStore = useStorybookStore();
const planStore = usePlanStore();
const { currentStory } = storeToRefs(storybookStore);

// --- UI 전용 상태 변수 ---
const modalImage = ref(null);
const loadingMessages = [
  "여행의 추억을 정리하고 있어요...",
  "사진 속 숨겨진 이야기를 찾고 있어요...",
  "멋진 여행기가 곧 완성됩니다!"
];
const currentLoadingMessage = ref(loadingMessages[0]);
let loadingInterval = null;

// --- 로딩 메시지 순환 로직 ---
watch(() => storybookStore.isLoading, (newValue) => {
  if (newValue) {
    let index = 0;
    currentLoadingMessage.value = loadingMessages[0];
    loadingInterval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      currentLoadingMessage.value = loadingMessages[index];
    }, 3000);
  } else {
    if (loadingInterval) clearInterval(loadingInterval);
  }
});

// --- 드래그 앤 드롭 로직 ---
const storyDaysRef = toRef(currentStory.value, 'storyDays');
const {
  isDragEnabled,
  isDragging,
  onHandleMouseDown,
  onHandleMouseUp,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDrop,
  onDragEnd,
} = useDraggable(storyDaysRef);


// --- Computed 속성 ---
const formattedDate = computed(() => {
  if (!currentStory.value.startDate || !currentStory.value.endDate) return '';
  return `${currentStory.value.startDate.replaceAll('-', '.')} ~ ${currentStory.value.endDate.replaceAll('-', '.')}`;
});
const durationLabel = computed(() => {
  if (!currentStory.value.startDate || !currentStory.value.endDate) return '';
  const s = new Date(currentStory.value.startDate), e = new Date(currentStory.value.endDate);
  const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
  return `${diffDays}박 ${diffDays + 1}일`;
});
const seasonLabel = computed(() => storybookStore.calculateSeason(currentStory.value.startDate));

// --- 이미지 핸들러 ---
const handleImageUpload = (dayIndex, sectionIndex, files) => {
  storybookStore.uploadImagesToSection(dayIndex, sectionIndex, files);
};
const handleImageDelete = (dayIndex, sectionIndex, imageIndex) => {
  storybookStore.removeImageFromSection(dayIndex, sectionIndex, imageIndex);
};

// --- 함수 ---
const getLabel = (l, id) => l.find(i => i.id === id)?.label || '';
const getDayOfWeek = (d) => ['일', '월', '화', '수', '목', '금', '토'][new Date(d).getDay()] + '요일';
const toggleSelection = (list, item, max = -1) => {
  const index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    if (max > 0 && list.length >= max) {
      return alert(`최대 ${max}개 선택 가능합니다.`);
    }
    list.push(item);
  }
};
const toggleTag = (s, t) => { if (s.selectedTags.includes(t)) s.selectedTags = s.selectedTags.filter(x => x !== t); else { if (s.selectedTags.length >= 10) return alert("최대 10개!"); s.selectedTags.push(t); } };
const moveSectionToDay = (fromDayIdx, fromSecIdx, toDayIdx) => {
  if (fromDayIdx === toDayIdx) return;
  const section = currentStory.value.storyDays[fromDayIdx].sections.splice(fromSecIdx, 1)[0];
  currentStory.value.storyDays[toDayIdx].sections.push(section);
};
const addSectionToDay = (dayIndex) => {
  currentStory.value.storyDays[dayIndex].sections.push({ id: Date.now(), placeName: '', imageUrls: [], selectedTags: [], content: '' });
};
const removeSection = (dayIndex, sectionIndex) => {
  if (confirm('이 장소를 삭제하시겠습니까?')) {
    currentStory.value.storyDays[dayIndex].sections.splice(sectionIndex, 1);
  }
};
const saveTemp = () => alert('임시 저장 기능은 구현 예정입니다.');
const generateStory = async () => {
  if (!currentStory.value.storyTitle) {
    return alert('여행 제목을 입력해주세요!');
  }
  if (!currentStory.value.companions || currentStory.value.companions.length === 0) {
    return alert('누구와 함께했는지 선택해주세요!');
  }
  if (!currentStory.value.tones || currentStory.value.tones.length === 0) {
    return alert('글의 분위기를 선택해주세요!');
  }
  await storybookStore.generateStoryDraft();
};
const closeImageModal = () => modalImage.value = null;
const openImageModal = (u) => modalImage.value = u;

// --- 데이터 로딩 및 매핑 ---
onMounted(async () => {
  storybookStore.resetCurrentStory();

  if (props.planId) {
    try {
      // 1. PlanStore를 통해 계획의 상세 데이터를 가져온다.
      await planStore.fetchPlanDetails(props.planId);
      
      // 2. 가져온 데이터가 있으면, StorybookStore의 동기화 함수를 호출한다.
      if (planStore.selectedPlan) {
        storybookStore.syncWithPlanData(planStore.selectedPlan);
      }
    } catch (error) {
      console.error("여행 계획 정보를 가져오는 중 오류 발생:", error);
      alert("여행 계획 정보를 가져오지 못했습니다.");
    }
  }
});

onUnmounted(() => {
  if (loadingInterval) clearInterval(loadingInterval);
});
</script>

<style lang="css" scoped>
/* 드래그 핸들 (카드 외부 왼쪽 상단) */
.drag-handle-outer {
  position: absolute;
  top: -15px;      /* 카드 위로 살짝 뺌 */
  left: -15px;     /* 카드 왼쪽으로 살짝 뺌 */
  width: 40px;
  height: 40px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 50%; /* 동그라미 */
  cursor: grab;
  z-index: 10;      /* 카드보다 위에 */
  transition: all 0.2s;
}
.drag-handle-outer:hover {
  background-color: #f8f9fa;
  transform: scale(1.1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.drag-handle-outer:active {
  cursor: grabbing;
  background-color: #e9ecef;
}

.draggable-item {
  transition: transform 0.2s ease;
  border-radius: 0.5rem;
}
.draggable-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}
.draggable-item.dragging .drag-handle-outer {
  background-color: #e9ecef;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(252, 249, 249, 0.808); /* 더 부드러운 반투명 검정 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(1px); /* 블러 효과 강화 */
}

/* 로딩 컨텐츠 (작은 창) 스타일 */
.loading-content {
  background-color: white;
  min-width: 320px;
  max-width: 90%;
  border-radius: 1.5rem; /* 둥근 모서리 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* 띄워진 느낌의 그림자 */
  animation: floatUp 0.4s ease-out; /* 등장 애니메이션 */
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 유틸 */
.min-h-100 { min-height: 100px; }
.btn-white { background-color: white; border: 1px solid #dee2e6; }
.transition-btn { transition: all 0.2s ease; }
.image-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.image-modal-content img { max-width: 90vw; max-height: 90vh; }

.ai-generate-btn {
  background: linear-gradient(135deg, #f2f2f5 0%, #eee9f3 100%);
  color: rgb(117, 114, 114);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-generate-btn:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(219, 219, 240, 0.4) !important;
  color: white;
  background: linear-gradient(135deg, #eeedf5 0%, #efe8f5 100%);
}

.ai-generate-btn:active {
  transform: translateY(0) scale(0.98);
}
</style>