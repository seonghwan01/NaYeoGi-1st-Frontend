<script setup>
import { ref, onMounted } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { useRouter } from 'vue-router';
import { QuillEditor } from '@vueup/vue-quill';

const router = useRouter();
const store = useStorybookStore();

// 로컬 상태: title과 content(HTML 문자열)를 가짐
const draft = ref({ title: '', content: '' });

// Quill 에디터 옵션
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  },
  placeholder: '여기에 스토리를 작성하세요...'
};

onMounted(() => {
  if (store.storyDraft) {
    draft.value.title = store.storyDraft.title || '';
    // Quill 에디터는 v-model:content를 통해 내용을 바인딩하므로,
    // 스토어의 content를 직접 ref에 할당합니다.
    draft.value.content = store.storyDraft.content || '';
  } else {
    alert('수정할 스토리 초안이 없습니다. 생성 페이지로 돌아갑니다.');
    router.push({ name: 'storybook-create' });
  }
});

const handleSave = () => {
  // 현재 draft 객체 전체를 저장 액션에 전달
  store.saveFinalStory(draft.value);
};
</script>

<template>
  <div class="container py-5" style="max-width: 900px;">
    <!-- 로딩 오버레이 -->
    <div v-if="store.isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 fw-bold">스토리를 저장하고 있어요...</p>
    </div>

    <div class="text-center mb-5">
      <h1 class="fw-bold display-6 mb-2">✍️ 스토리 초안 수정하기</h1>
      <p class="text-muted">툴바를 이용해 글을 꾸미거나, 텍스트를 자유롭게 수정하세요.</p>
    </div>

    <div class="bg-white p-4 rounded shadow-sm border">
      <!-- 제목 입력란 -->
      <input type="text" class="form-control form-control-lg border-0 fw-bold fs-1 mb-4 px-2" v-model="draft.title" placeholder="제목을 입력하세요">

      <!-- Quill 에디터 -->
      <div class="quill-editor-container">
        <QuillEditor
          v-model:content="draft.content"
          :options="editorOptions"
          contentType="html"
          style="min-height: 500px;"
        />
      </div>
    </div>

    <!-- 하단 저장 버튼 -->
    <div class="fixed-bottom bg-white border-top py-3 shadow-lg">
      <div class="container" style="max-width: 900px;">
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-light border px-4" @click="router.push({ name: 'storybook-create' })">
            <i class="bi bi-arrow-left"></i> 다시 생성하기
          </button>
          <button class="btn btn-primary px-5 fw-bold shadow-sm" @click="handleSave">
            <i class="bi bi-check-lg"></i> 최종 저장하기
          </button>
        </div>
      </div>
    </div>
    <div style="height: 80px;"></div>
  </div>
</template>

<style>
/* Quill 에디터의 툴바와 편집 영역이 카드 안에서 잘 보이도록 스타일 조정 */
.quill-editor-container .ql-toolbar.ql-snow {
  border-radius: 0.5rem 0.5rem 0 0;
  border: 1px solid #dee2e6;
  border-bottom: 0;
}
.quill-editor-container .ql-container.ql-snow {
  border-radius: 0 0 0.5rem 0.5rem;
  border: 1px solid #dee2e6;
  font-size: 16px; /* 편집기 내부 폰트 크기 조정 */
}
.quill-editor-container .ql-editor {
  min-height: 500px; /* 최소 높이 설정 */
}

.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  z-index: 9999;
}
</style>