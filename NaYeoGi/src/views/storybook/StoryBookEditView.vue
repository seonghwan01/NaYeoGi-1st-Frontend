<script setup>
import { ref, onMounted } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { useRouter } from 'vue-router';
import { Editor } from '@toast-ui/vue-editor';

const props = defineProps({
  storyId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const store = useStorybookStore();
const editorRef = ref(null);

const originalStory = ref(null); // API로 불러온 원본 스토리 데이터
const draft = ref({ title: '', content: '' }); // 에디터와 바인딩된 수정용 데이터

onMounted(async () => {
  const storyData = await store.fetchStory(props.storyId);
  if (storyData) {
    originalStory.value = storyData;
    draft.value.title = storyData.title || '';
    draft.value.content = storyData.content || '';
  } else {
    alert('스토리 정보를 불러오는 데 실패했습니다.');
    router.push('/my-stories');
  }
});

const handleSave = () => {
  if (!originalStory.value) return;

  const htmlContent = editorRef.value?.invoke('getHTML');
  
  // 수정 API에 맞는 DTO 객체 생성
  const payload = {
    title: draft.value.title,
    content: htmlContent,
    thumbnailPath: originalStory.value.thumbnailPath,
    isPublic: originalStory.value.isPublic,
  };
  
  store.updateStory(props.storyId, payload);
};
</script>

<template>
  <div class="container py-5" style="max-width: 900px;">
    <!-- 로딩 오버레이 -->
    <div v-if="store.isLoading || !originalStory" class="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 fw-bold">스토리 정보를 불러오는 중...</p>
    </div>

    <div v-if="originalStory">
      <div class="text-center mb-5">
        <h1 class="fw-bold display-6 mb-2">✍️ 스토리 수정하기</h1>
        <p class="text-muted">툴바를 이용해 글을 꾸미거나, 텍스트를 자유롭게 수정하세요.</p>
      </div>

      <div class="bg-white p-4 rounded shadow-sm border">
        <!-- 제목 입력란 -->
        <input type="text" class="form-control form-control-lg border-0 fw-bold fs-1 mb-4 px-2" v-model="draft.title" placeholder="제목을 입력하세요">

        <!-- Toast UI 에디터 -->
        <div class="tui-editor-container">
          <Editor
            ref="editorRef"
            :initialValue="draft.content"
            initialEditType="wysiwyg"
            height="500px"
            previewStyle="vertical"
          />
        </div>
      </div>

      <!-- 하단 저장 버튼 -->
      <div class="fixed-bottom bg-white border-top py-3 shadow-lg">
        <div class="container" style="max-width: 900px;">
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary px-4" @click="router.back()">
              취소
            </button>
            <button class="btn btn-primary px-5 fw-bold shadow-sm" @click="handleSave">
              수정 완료
            </button>
          </div>
        </div>
      </div>
      <div style="height: 80px;"></div>
    </div>
  </div>
</template>

<style>
/* TUI 에디터 컨테이너 스타일 */
.tui-editor-container {
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}

.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  z-index: 9999;
}
</style>