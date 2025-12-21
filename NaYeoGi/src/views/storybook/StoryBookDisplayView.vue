<script setup>
import { ref, onMounted } from 'vue';
import { useStorybookStore } from '@/stores/storybook';

// 라우터에서 props로 전달된 storyId를 받습니다.
const props = defineProps({
  storyId: {
    type: String,
    required: true,
  },
});

const store = useStorybookStore();
const story = ref(null); // 최종 스토리 데이터를 담을 변수

onMounted(async () => {
  story.value = await store.fetchStory(props.storyId);
});
</script>

<template>
  <div class="container py-5" style="max-width: 900px;">
    <div v-if="store.isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">스토리를 불러오는 중...</p>
    </div>

    <article v-else-if="story">
      <!-- 헤더: 제목, 작성자, 날짜 -->
      <header class="text-center border-bottom pb-4 mb-5">
        <h1 class="display-5 fw-bold mb-3">{{ story.title }}</h1>
        <p class="text-muted fs-5">
          작성자: {{ story.author }} | 작성일: {{ story.createdAt }}
        </p>
      </header>

      <!-- 본문: v-html을 사용하여 HTML 렌더링 -->
      <div class="story-content fs-5" v-html="story.content"></div>

      <!-- 하단 버튼 -->
      <div class="text-center mt-5 pt-4 border-top">
        <button class="btn btn-primary btn-lg px-5" @click="$router.push('/main')">
          메인으로 돌아가기
        </button>
      </div>
    </article>

    <div v-else class="text-center py-5">
      <h2 class="text-muted">스토리를 찾을 수 없습니다.</h2>
    </div>
  </div>
</template>

<style>
/* story-content 내부의 스타일링 */
.story-content h1, .story-content h2, .story-content h3 {
  font-weight: bold;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.story-content p {
  line-height: 1.8;
  margin-bottom: 1.5rem;
}
.story-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
