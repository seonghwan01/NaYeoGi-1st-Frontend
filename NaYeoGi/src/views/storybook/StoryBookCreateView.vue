<template>
  <div class="container py-5" style="max-width: 900px;">
    <ContentCard>
      <!-- 로딩 오버레이 -->
      <div v-if="storybookStore.isLoading || planStore.isLoading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
        <h4 class="mt-4 fw-bold">
          {{ planStore.isLoading ? '계획을 불러오는 중...' : 'AI가 스토리를 만들고 있어요...' }}
        </h4>
        <p class="text-muted">잠시만 기다려주세요.</p>
      </div>

      <div class="text-center mb-5">
        <h1 class="fw-bold display-6 mb-2">✨ AI 여행 기록</h1>
        <p class="text-muted">카드 왼쪽 위의 손잡이를 잡고 자유롭게 순서를 바꿔보세요.</p>
      </div>

      <div class="card shadow-sm mb-5 border-0">
        <div class="card-body p-4 bg-white rounded">
          <div class="mb-4">
            <label class="form-label fw-bold text-dark">🏷️ 여행 제목</label>
            <input type="text" class="form-control form-control-lg bg-light border-0" v-model="storyTitle" placeholder="예: 3대가 함께한 우당탕탕 제주 여행">
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
               <label class="form-label fw-bold text-dark mb-0">👥 누구와 함께했나요?</label>
               <span class="small text-muted" v-if="whoWith.length > 0">{{ whoWith.map(id => getLabel(COMPANIONS, id)).join(', ') }}</span>
            </div>
            <div class="d-flex flex-wrap gap-2">
               <button v-for="c in COMPANIONS" :key="c.id" class="btn btn-sm rounded-pill px-3 py-2 transition-btn" :class="whoWith.includes(c.id) ? 'btn-dark' : 'btn-outline-secondary border-0 bg-light text-secondary'" @click="toggleSelection(whoWith, c.id)">{{ c.label }}</button>
            </div>
          </div>
          <div class="mb-2">
             <div class="d-flex justify-content-between align-items-center mb-2">
               <label class="form-label fw-bold text-dark mb-0">🎨 전체적인 글 분위기 <span class="text-primary small">(최대 3개)</span></label>
               <span class="small text-muted" v-if="selectedTones.length > 0">{{ selectedTones.map(id => getLabel(STORY_TONES, id)).join(', ') }}</span>
             </div>
             <div class="d-flex flex-wrap gap-2">
               <button v-for="t in displayedTones" :key="t.id" class="btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 transition-btn" :class="selectedTones.includes(t.id) ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0 bg-light text-secondary'" @click="toggleSelection(selectedTones, t.id, 3)"><span>{{ t.icon }}</span><span>{{ t.label }}</span></button>
               <button v-if="STORY_TONES.length > limitCount" class="btn btn-sm btn-link text-decoration-none text-muted fw-bold" @click="isExpanded = !isExpanded">{{ isExpanded ? '접기 ▲' : '+ 더보기' }}</button>
             </div>
          </div>
        </div>
      </div>

      <div v-if="planStore.isLoading && !storyDays.length" class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>

      <div v-else>
        <div v-for="(dayItem, dayIndex) in storyDays" :key="dayIndex" class="card mb-5 border-0 shadow-sm bg-light">

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
               <label class="form-label small text-muted fw-bold mb-2">⛅ Day {{ dayItem.dayNum }}의 날씨는 어땠나요?</label>
               <div class="d-flex flex-wrap gap-2">
                  <button v-for="w in WEATHER_TAGS" :key="w.id" class="btn btn-sm rounded-pill px-3 py-1 transition-btn" :class="dayItem.weather.includes(w.id) ? 'btn-warning text-dark border-warning' : 'btn-white border text-secondary'" @click="toggleSelection(dayItem.weather, w.id)">{{ w.icon }} {{ w.label }}</button>
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
                @update-images="(files) => section.images = files"
                @update-memo="(text) => section.memo = text"
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
                      <option v-for="(d, idx) in storyDays" :key="idx" :value="idx">Day {{ d.dayNum }}</option>
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

      <div class="fixed-bottom bg-white border-top py-3 shadow-lg" style="z-index: 900;">
        <div class="container" style="max-width: 900px;">
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-light border px-4" @click="saveTemp">임시 저장</button>
            <button class="btn btn-primary px-4 fw-bold shadow-sm" @click="generateStory">AI 스토리 생성</button>
          </div>
        </div>
      </div>
      <div style="height: 80px;"></div>
      <div v-if="modalImage" class="image-modal-overlay" @click="closeImageModal">
        <div class="image-modal-content"><img :src="modalImage" class="img-fluid rounded shadow"></div>
      </div>
    </ContentCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import StorySection from '@/components/storybook/StorySection.vue';
import ContentCard from '@/components/common/ContentCard.vue';
import { useStorybookStore } from '@/stores/storybook';
import { usePlanStore } from '@/stores/plan'; // 1. Plan 스토어 임포트
import { useDraggable } from '@/composables/useDraggable';
import {
  WEATHER_TAGS,
  STORY_TONES,
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

// --- 컴포넌트 상태 변수 ---
const storyTitle = ref('');
const whoWith = ref(['friends']);
const selectedTones = ref(['calm']);
const modalImage = ref(null);
const isExpanded = ref(false);
const limitCount = 8;
const storyDays = ref([]);
const startDate = ref('');
const endDate = ref('');

// --- 드래그 앤 드롭 로직 ---
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
} = useDraggable(storyDays);

// --- Computed 속성 ---
const formattedDate = computed(() => {
  if (!startDate.value || !endDate.value) return '';
  return `${startDate.value.replaceAll('-', '.')} ~ ${endDate.value.replaceAll('-', '.')}`;
});
const durationLabel = computed(() => {
  if (!startDate.value || !endDate.value) return '';
  const s = new Date(startDate.value), e = new Date(endDate.value);
  const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
  return `${diffDays}박 ${diffDays + 1}일`;
});
const seasonLabel = computed(() => '가을'); // 간략화
const displayedTones = computed(() => isExpanded.value ? STORY_TONES : STORY_TONES.slice(0, limitCount));

// --- 함수 ---
const getLabel = (l, id) => l.find(i => i.id === id)?.label || '';
const getDayOfWeek = (d) => ['일', '월', '화', '수', '목', '금', '토'][new Date(d).getDay()] + '요일';
const toggleSelection = (l, i, m = -1) => { if (l.includes(i)) l.splice(l.indexOf(i), 1); else { if (m > 0 && l.length >= m) return alert(`최대 ${m}개!`); l.push(i); } };
const toggleTag = (s, t) => { if (s.selectedTags.includes(t)) s.selectedTags = s.selectedTags.filter(x => x !== t); else { if (s.selectedTags.length >= 10) return alert("최대 10개!"); s.selectedTags.push(t); } };
const moveSectionToDay = (f, s, t) => { if (f === t) return; const i = storyDays.value[f].sections[s]; storyDays.value[f].sections.splice(s, 1); storyDays.value[t].sections.push(i); };
const addSectionToDay = (i) => storyDays.value[i].sections.push({ id: Date.now(), placeName: '', images: [], selectedTags: [], memo: '' });
const removeSection = (d, s) => { if (confirm('삭제하시겠습니까?')) storyDays.value[d].sections.splice(s, 1); };
const saveTemp = () => alert('임시 저장 기능은 구현 예정입니다.');

const generateStory = async () => {
  if (!storyTitle.value) return alert('여행 제목을 입력해주세요!');
  const payload = {
    storyTitle: storyTitle.value,
    startDate: startDate.value,
    endDate: endDate.value,
    companions: whoWith.value,
    tones: selectedTones.value,
    storyDays: storyDays.value,
  };
  await storybookStore.generateStoryDraft(payload);
};

const closeImageModal = () => modalImage.value = null;
const openImageModal = (u) => modalImage.value = u;

// --- 데이터 로딩 및 매핑 ---
onMounted(() => {
  // 2. 컴포넌트가 마운트되면 planId로 데이터 요청
  planStore.fetchPlan(props.planId);
});

// 3. planStore의 currentPlan 상태가 변경되면(로딩 완료) 감지하여 실행
watch(() => planStore.currentPlan, (newPlan) => {
  if (newPlan) {
    // 4. 불러온 데이터를 컴포넌트의 상태에 맞게 매핑
    storyTitle.value = newPlan.title;
    startDate.value = newPlan.startDate;
    endDate.value = newPlan.endDate;

    // 날짜 차이 계산
    const s = new Date(newPlan.startDate);
    const e = new Date(newPlan.endDate);
    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;

    // Day 1, Day 2 ... 기본 구조 생성
    const days = [];
    for (let i = 0; i < diffDays; i++) {
      const dayDate = new Date(s);
      dayDate.setDate(s.getDate() + i);
      days.push({
        dayNum: i + 1,
        date: dayDate.toISOString().split('T')[0],
        weather: [],
        sections: [],
      });
    }

    // plan.details를 순회하며 각 Day에 맞는 section 추가
    newPlan.details.forEach(detail => {
      const dayIndex = detail.planDate - 1;
      if (days[dayIndex]) {
        days[dayIndex].sections.push({
          id: detail.attraction.id, // 고유 ID로 attraction id 사용
          placeName: detail.attraction.title,
          images: detail.attraction.firstImage1 ? [detail.attraction.firstImage1] : [],
          selectedTags: [],
          memo: '',
        });
      }
    });

    storyDays.value = days;
  }
}, { immediate: true }); // immediate: true로 초기 로딩 시에도 watch 실행
</script>

<style scoped>
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
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

/* 유틸 */
.min-h-100 { min-height: 100px; }
.btn-white { background-color: white; border: 1px solid #dee2e6; }
.transition-btn { transition: all 0.2s ease; }
.image-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; justify-content: center; align-items: center; }
.image-modal-content img { max-width: 90vw; max-height: 90vh; }
</style>
