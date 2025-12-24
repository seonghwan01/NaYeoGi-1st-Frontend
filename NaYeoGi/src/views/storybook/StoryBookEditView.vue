<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { useRouter } from 'vue-router';
import '@toast-ui/editor/dist/toastui-editor.css';
import Editor from '@toast-ui/editor';

const props = defineProps({
  storyId: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const store = useStorybookStore();
const editorRef = ref(null);
let editorInstance = null;

const originalStory = ref(null);
const draft = ref({ title: '', content: '' });

onMounted(async () => {
  const storyData = await store.fetchStory(props.storyId);
  if (storyData) {
    originalStory.value = storyData;
    draft.value.title = storyData.title || '';
    draft.value.content = storyData.content || '';

    await nextTick();
    if (editorRef.value) {
      editorInstance = new Editor({
        el: editorRef.value,
        height: '700px', // 높이를 더 시원하게 확장
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        initialValue: draft.value.content,
        usageStatistics: false,
        hideModeSwitch: false, // 전환 토글 다시 표시
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'image', 'link'],
          ['code', 'codeblock']
        ]
      });
    }
  } else {
    alert('스토리 정보를 불러오는 데 실패했습니다.');
    router.push('/my-stories');
  }
});

const handleSave = async () => {
  if (!originalStory.value || !editorInstance) return;

  const markdownContent = editorInstance.getMarkdown();
  
  if (!draft.value.title.trim()) {
    alert('제목을 입력해주세요.');
    return;
  }

  const payload = {
    title: draft.value.title,
    content: markdownContent,
    thumbnailPath: originalStory.value.thumbnailPath,
    isPublic: originalStory.value.isPublic,
  };
  
  await store.updateStory(props.storyId, payload);
};
</script>

<template>
  <div class="page-wrapper bg-joyful-gradient min-vh-100 py-5">
    <!-- 로딩 오버레이 -->
    <div v-if="store.isLoading" class="loading-overlay">
      <div class="spinner-border text-white" style="width: 3rem; height: 3rem;" role="status"></div>
      <p class="mt-4 text-white fs-4 fw-light">여행의 추억을 다듬는 중...</p>
    </div>

    <div v-if="originalStory" class="container" style="max-width: 1000px;">
      
      <!-- 메인 글래스 패널 -->
      <div class="glass-panel p-5 fade-in-up">
        
        <!-- 상단 헤더 영역 -->
        <div class="mb-5">
          <p class="text-secondary small fw-bold letter-spacing-2 mb-2">EDIT STORY</p>
          <!-- 제목 입력: 거대한 헤드라인 스타일 -->
          <input 
            type="text" 
            class="title-input w-100" 
            v-model="draft.title" 
            placeholder="제목을 입력하세요..."
          >
        </div>

        <!-- 에디터 영역 -->
        <div class="editor-wrapper">
          <div ref="editorRef"></div>
        </div>
      </div>

      <!-- 하단 여백 -->
      <div style="height: 100px;"></div>

      <!-- 플로팅 액션 바 (Floating Action Bar) -->
      <div class="floating-action-bar shadow-lg">
        <button class="btn btn-action-secondary rounded-pill px-4 me-2" @click="router.back()" data-tooltip="작성 취소">
           <i class="bi bi-arrow-left me-1"></i> 취소
          </button>
        <div class="vr mx-2 bg-secondary opacity-25"></div>
         <button class="btn btn-icon rounded-circle me-1" @click="handleSave" data-tooltip="변경사항 저장">
           <i class="bi bi-pencil-fill text-primary"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* --- Design System & Custom Styles --- */

/* 1. Background Animation */
@keyframes gradient-move {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}


/* 2. Glassmorphism Panel */
.glass-panel {
  background: rgb(250, 250, 250);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  transition: transform 0.3s ease;
}

/* 3. Title Input - Clean & Bold */
.title-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  padding: 0.5rem 0;
  outline: none;
  transition: all 0.3s ease;
}
.title-input:focus {
  border-bottom-color: #23a6d5;
}
.title-input::placeholder {
  color: #bdc3c7;
  font-weight: 600;
}

/* 4. Editor Customization */
.editor-wrapper .toastui-editor-defaultUI {
  border: none !important;
  font-family: 'Pretendard', sans-serif;
}
.editor-wrapper .toastui-editor-toolbar {
  background-color: transparent !important;
  border-bottom: 1px solid rgba(0,0,0,0.05) !important;
}

/* 5. Floating Action Bar */
.floating-action-bar { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.527); backdrop-filter: blur(10px); padding: 0.75rem 1rem; border-radius: 50rem; border: 1px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; z-index: 1000; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; }

.floating-action-bar:hover {
  bottom: 2.2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
}

/* 6. Tooltips */
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(33, 37, 41, 0.95);
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1001;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
[data-tooltip]::before {
  content: '';
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  border-width: 6px 6px 0 6px;
  border-style: solid;
  border-color: rgba(33, 37, 41, 0.95) transparent transparent transparent;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1001;
}
[data-tooltip]:hover::after,
[data-tooltip]:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* 7. Buttons */
.btn-action-primary {
  background: linear-gradient(45deg, #23a6d5, #23d5ab);
  border: none;
  color: white;
  font-weight: 700;
  transition: filter 0.2s;
}
.btn-action-primary:hover {
  filter: brightness(1.1);
  color: white;
}
.btn-action-secondary {
  background: #f1f3f5;
  border: none;
  color: #495057;
  font-weight: 600;
  transition: background 0.2s;
}
.btn-action-secondary:hover {
  background: #e9ecef;
}

/* 8. Utilities */
.letter-spacing-2 { letter-spacing: 2px; }
.loading-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  z-index: 9999;
}
.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>