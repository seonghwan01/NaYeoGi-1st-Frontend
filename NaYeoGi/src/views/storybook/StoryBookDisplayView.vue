<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { useRouter } from 'vue-router';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';

// 라우터에서 props로 전달된 storyId를 받습니다.
const props = defineProps({
  storyId: {
    type: String,
    required: true,
  },
});

const store = useStorybookStore();
const router = useRouter();
const story = ref(null);
const viewerContainer = ref(null); // 뷰어가 렌더링될 DOM 요소

onMounted(async () => {
  story.value = await store.fetchStory(props.storyId);
  
  // 데이터 로드 후 DOM이 업데이트될 때까지 대기
  if (story.value && story.value.content) {
    await nextTick();
    if (viewerContainer.value) {
      // Vanilla JS Viewer 인스턴스 생성
      new Viewer({
        el: viewerContainer.value,
        initialValue: story.value.content
      });
    }
  }
});

const onEdit = () => {
  if (!story.value) return;
  router.push(`/storybook/edit/${story.value.storyId}`);
};
const onDelete = () => {
  if (window.confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
    store.deleteStory(props.storyId);
  }
};
const onTogglePublic = async () => {
  if (!story.value) return;
  const newStatus = !story.value.isPublic;
  const result = await store.updateStoryVisibility(props.storyId, newStatus);
  if (result && typeof result.isPublic === 'boolean') {
    story.value.isPublic = result.isPublic;
    alert(`스토리가 ${story.value.isPublic ? '공개' : '비공개'} 상태로 변경되었습니다.`);
  }
};
</script>

<template>
  <div class="bg-gradient rounded-4 min-vh-100 py-5">
    <div class="container" style="max-width: 900px;">
      <div v-if="store.isLoading" class="library-card p-4 p-md-5 rounded-4 shadow-sm text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-white">스토리를 불러오는 중...</p>
      </div>

      <article v-else-if="story" class="bg-white p-4 p-md-5 rounded-4 shadow-lg">
        <!-- 헤더: 제목, 작성자, 날짜, 버튼 -->
        <header class="border-bottom pb-4 mb-4">
          <h1 class="display-5 fw-bold mb-3 text-center">{{ story.title }}</h1>
          <div class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-2 mb-3">
            <p class="text-muted small mb-0">
              작성자: <span class="fw-bold">{{ story.writerName }}</span> | 작성일: {{ story.createdDate }}
            </p>
            <span v-if="story.isPublic" class="badge bg-success-subtle text-success ms-md-2">공개</span>
            <span v-else class="badge bg-danger-subtle text-danger ms-md-2">비공개</span>
            <span class="text-muted small ms-md-2">조회수: {{ story.hit }}</span>
          </div>

          <div class="d-flex justify-content-center gap-2 mt-3">
              <button class="btn btn-outline-secondary btn-sm" @click="onEdit">수정</button>
              <button
                class="btn btn-sm"
                :class="story.isPublic ? 'btn-outline-warning' : 'btn-outline-success'"
                @click="onTogglePublic"
              >
                {{ story.isPublic ? '비공개로 전환' : '공개하기' }}
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="onDelete">삭제</button>
          </div>
        </header>

        <!-- 썸네일 (옵션) 
        <div v-if="story.thumbnailPath" class="text-center my-4">
          <img :src="story.thumbnailPath" class="img-fluid rounded-3 shadow-sm" alt="Story Thumbnail" style="max-height: 400px; object-fit: cover;">
        </div> 
        -->
        

        <!-- 본문: Vanilla JS Viewer Target Div -->
        <div class="story-content fs-5 mt-5">
             <div ref="viewerContainer"></div>
        </div>

      </article>

      <div v-else class="library-card p-4 p-md-5 rounded-4 shadow-sm text-center py-5">
        <h2 class="text-white">스토리를 찾을 수 없습니다.</h2>
        <p class="text-white">요청하신 스토리가 존재하지 않거나, 불러오는 데 실패했습니다.</p>
        <button class="btn btn-primary mt-3" @click="$router.push('/my-stories')">
          내 스토리 목록으로
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* 유리창 효과 스타일 (library-card) */
.library-card {
  background-color: rgba(255, 255, 255, 0.15); /* 반투명 배경 */
  backdrop-filter: blur(10px); /* 배경 블러 효과 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 테두리 */
  color: white; /* 텍스트 색상 */
}
/* story-content 내부의 스타일링 */
.story-content h1, .story-content h2, .story-content h3, .story-content h4, .story-content h5, .story-content h6 {
  font-weight: bold;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #222;
  line-height: 1.4;
}
.story-content p {
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #444;
}
.story-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem; /* 더 둥근 모서리 */
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1); /* 이미지에 그림자 추가 */
}
.story-content blockquote {
  border-left: 0.25rem solid #ced4da;
  padding-left: 1rem;
  margin-left: 0;
  font-style: italic;
  color: #6c757d;
}
.story-content pre {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
}
</style>
