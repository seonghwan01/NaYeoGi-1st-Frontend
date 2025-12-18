<template>
  <div class="card mb-4 border-0 shadow-sm story-section">
    <div class="card-body p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center flex-grow-1 me-3">
          <span class="badge bg-primary rounded-pill me-3 px-3 py-2">{{ index + 1 }}</span>
          <input
            type="text"
            class="form-control form-control-lg fw-bold border-0 bg-transparent"
            :value="sectionData.placeName"
            @input="$emit('update-place-name', $event.target.value)"
            placeholder="장소 이름을 입력하세요"
          >
        <slot name="day-control"></slot>
        </div>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-3" @click="$emit('remove-section')">
          <i class="bi bi-trash"></i> 삭제
        </button>
      </div>

      <div class="mb-4">
        <label class="form-label text-muted small fw-bold mb-2">
          📸 여행 사진 (최대 {{ MAX_IMAGES }}장)
        </label>

        <div class="d-flex gap-3 overflow-auto pb-2 image-scroll-container">
          <div
            v-for="(img, idx) in previewImages"
            :key="idx"
            class="flex-shrink-0 position-relative image-card"
            @click="$emit('preview-image', img)"
          >
            <img :src="img" class="rounded shadow-sm w-100 h-100 object-fit-cover">

            <button
              class="delete-btn position-absolute top-0 end-0 m-2 d-flex justify-content-center align-items-center shadow-sm"
              @click.stop="removeImage(idx)"
            >
              <i class="bi bi-x-lg text-white" style="font-size: 0.8rem;"></i>
            </button>
          </div>

          <div
            v-if="previewImages.length < MAX_IMAGES"
            class="flex-shrink-0 image-card add-card rounded border border-2 border-dashed d-flex flex-column justify-content-center align-items-center text-muted cursor-pointer"
            @click="triggerFileInput"
          >
            <i class="bi bi-plus-lg display-6 mb-2"></i>
            <span class="small">사진 추가</span>
          </div>
        </div>

        <input
          type="file"
          ref="fileInput"
          class="d-none"
          multiple
          accept="image/*"
          @change="handleFileAdd"
        >
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <label class="form-label text-muted small fw-bold mb-0">
            😊 이 장소의 분위기 <span class="text-primary" style="font-size: 0.8em;">(최대 10개)</span>
          </label>

          <button
            v-if="allMoodTags.length > limitCount"
            class="btn btn-sm btn-link text-decoration-none text-muted p-0"
            style="font-size: 0.85rem;"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? '접기 ▲' : '+ 더보기' }}
          </button>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <button
            v-for="tag in displayedTags"
            :key="tag"
            class="btn btn-sm rounded-pill transition-btn"
            :class="sectionData.selectedTags.includes(tag) ? 'btn-primary text-white' : 'btn-outline-secondary border-0 bg-light text-dark'"
            @click="$emit('toggle-tag', tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
<div>
        <label class="form-label text-muted small fw-bold mb-2">📝 간단 메모</label>
        <textarea
          class="form-control bg-light border-0"
          rows="3"
          placeholder="이 장소에서의 추억을 간단히 남겨주세요."
          :value="sectionData.memo"
          @input="$emit('update-memo', $event.target.value)"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MOOD_TAGS } from '@/constants/storybook/storyConstants';
import { ref, computed } from 'vue';

const props = defineProps({
  sectionData: Object, // 부모로부터 받은 섹션 데이터
  index: Number
});
const emit = defineEmits(['remove-section', 'update-images', 'update-memo', 'toggle-tag', 'update-place-name', 'preview-image']);

const MAX_IMAGES = 5; // 최대 5장
const fileInput = ref(null);

const isExpanded = ref(false);
const limitCount = 10; // 처음에 10개만 보여줌
const allMoodTags = MOOD_TAGS; // import 해서 사용
const displayedTags = computed(() => {
  return isExpanded.value ? allMoodTags : allMoodTags.slice(0, limitCount);
});

/**
 * [기능] 이미지 미리보기 URL 생성
 * [설명] File 객체인 경우 URL.createObjectURL을 사용하고,
 * 백엔드 URL인 경우(문자열) 그대로 사용하도록 처리
 */
const previewImages = computed(() => {
  return (props.sectionData.images || []).map(file => {
      // 백엔드에서 받은 URL 문자열일 경우 그대로 반환
      if (typeof file === 'string') return file;
      return URL.createObjectURL(file);
  });
});
const triggerFileInput = () => fileInput.value.click();


/**
 * [기능] 파일 추가 핸들러
 * [TODO: Backend] 여기서 선택된 파일들을 바로 서버에 업로드할지(비동기),
 * 아니면 최종 저장 시 한번에 보낼지 결정 필요.
 * 보통은 여기서 `FormData`로 서버에 보내고 URL을 받아오는 방식이 권장됨.
 */
const handleFileAdd = (event) => {
  const newFiles = Array.from(event.target.files);
  const currentFiles = props.sectionData.images || [];

  if (currentFiles.length + newFiles.length > MAX_IMAGES) {
    alert(`사진은 장소당 최대 ${MAX_IMAGES}장까지만 선택할 수 있어요! 핵심 사진만 골라주세요. 😉`);
    event.target.value = '';
    return;
  }
// 현재는 File 객체 배열을 상위로 전달
  emit('update-images', [...currentFiles, ...newFiles]);
  event.target.value = '';
};

const removeImage = (idx) => {
  const currentFiles = [...props.sectionData.images];
  currentFiles.splice(idx, 1);
  emit('update-images', currentFiles);
};
</script>

<style scoped>
.image-scroll-container::-webkit-scrollbar { height: 6px; }
.image-scroll-container::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }

.image-card {
  width: 160px; /* 크기 약간 조절 */
  height: 120px;
  cursor: pointer;
  transition: transform 0.2s;
}
.image-card:hover { transform: scale(1.02); }

/* 삭제 버튼 스타일링 (명확하게) */
.delete-btn {
  width: 24px;
  height: 24px;
  background-color: #dc3545; /* Bootstrap Danger Red */
  border: 2px solid white;
  border-radius: 50%; /* 완전 동그라미 */
  transition: all 0.2s;
}
.delete-btn:hover {
  background-color: #bb2d3b;
  transform: scale(1.1);
}

.add-card { background-color: #f8f9fa; border-style: dashed !important; }
.add-card:hover { background-color: #e9ecef; border-color: #adb5bd !important; }
.object-fit-cover { object-fit: cover; }
.transition-btn { transition: all 0.2s ease; }
</style>
