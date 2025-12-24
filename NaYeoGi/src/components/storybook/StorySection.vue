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
            v-for="(image, idx) in sectionData.imageUrls"
            :key="image.id"
            class="flex-shrink-0 position-relative image-card"
            @click="!image.isUploading && $emit('preview-image', image.url)"
          >
            <img 
              :src="image.url" 
              class="rounded shadow-sm w-100 h-100 object-fit-cover"
              :class="{ 'deleting': image.isDeleting }"
            >

            <!-- 업로드 중 오버레이 -->
            <div v-if="image.isUploading" class="state-overlay uploading">
              <div class="spinner-border spinner-border-sm text-white" role="status"></div>
              <span class="ms-2 small">업로드 중</span>
            </div>

            <!-- 삭제 중 오버레이 -->
            <div v-if="image.isDeleting" class="state-overlay deleting">
              <span class="small">삭제 중...</span>
            </div>

            <!-- 삭제 버튼 -->
            <button
              v-if="!image.isUploading && !image.isDeleting"
              class="delete-btn position-absolute top-0 end-0 m-2 d-flex justify-content-center align-items-center shadow-sm"
              @click.stop="removeImage(idx)"
            >
              <i class="bi bi-x-lg text-white" style="font-size: 0.8rem;"></i>
            </button>
          </div>

          <!-- 사진 추가 버튼 -->
          <div
            v-if="!sectionData.imageUrls || sectionData.imageUrls.length < MAX_IMAGES"
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
        </div>

        <div v-for="category in MOOD_TAGS_CATEGORIES" :key="category.label" class="mb-3">
          <h6 class="fw-bold small text-muted mb-2 ps-1">{{ category.label }}</h6>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="tag in category.items"
              :key="tag.label"
              class="btn btn-sm rounded-pill transition-btn"
              :class="sectionData.selectedTags.includes(tag.label) ? 'btn-primary text-white' : 'btn-outline-secondary border-0 bg-light text-dark'"
              @click="$emit('toggle-tag', tag.label)"
            >
              {{ tag.icon }} {{ tag.label }}
            </button>
          </div>
        </div>
      </div>
<div>
        <label class="form-label text-muted small fw-bold mb-2">📝 메모</label>
        <textarea
          class="form-control bg-light border-0"
          rows="3"
          placeholder="이 장소에서의 추억을 남겨주세요.(자세히 작성할수록 원하는 글이 작성됩니다!)"
          :value="sectionData.content"
          @input="$emit('update-content', $event.target.value)"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MOOD_TAGS_CATEGORIES } from '@/constants/storybook/storyConstants';
import { ref } from 'vue';

const props = defineProps({
  sectionData: Object, // 부모로부터 받은 섹션 데이터
  index: Number
});
const emit = defineEmits([
  'remove-section', 
  'add-images', 
  'remove-image', 
  'update-content', 
  'toggle-tag', 
  'update-place-name', 
  'preview-image'
]);

const MAX_IMAGES = 5;
const fileInput = ref(null);

const triggerFileInput = () => fileInput.value.click();

const handleFileAdd = (event) => {
  const newFiles = Array.from(event.target.files);
  const currentFiles = props.sectionData.imageUrls || [];

  if (currentFiles.length + newFiles.length > MAX_IMAGES) {
    alert(`사진은 장소당 최대 ${MAX_IMAGES}장까지만 추가할 수 있습니다.`);
    event.target.value = '';
    return;
  }
  
  emit('add-images', newFiles);
  event.target.value = '';
};

const removeImage = (idx) => {
  emit('remove-image', idx);
};
</script>

<style scoped>
.image-scroll-container::-webkit-scrollbar { height: 6px; }
.image-scroll-container::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }

.image-card {
  width: 160px;
  height: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden; /* 오버레이를 카드 내부에 가두기 위함 */
}
.image-card:hover { transform: scale(1.02); }
.image-card img.deleting {
  filter: brightness(0.8);
}

.state-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: rgba(0,0,0,0.5);
  border-radius: var(--bs-border-radius);
}

/* 삭제 버튼 스타일링 */
.delete-btn {
  width: 24px;
  height: 24px;
  background-color: rgba(0,0,0,0.4);
  border: none;
  border-radius: 50%;
  transition: all 0.2s;
}
.delete-btn:hover {
  background-color: #dc3545;
  transform: scale(1.1);
}

.add-card { background-color: #f8f9fa; border-style: dashed !important; }
.add-card:hover { background-color: #e9ecef; border-color: #adb5bd !important; }
.object-fit-cover { object-fit: cover; }
.transition-btn { transition: all 0.2s ease; }
</style>
