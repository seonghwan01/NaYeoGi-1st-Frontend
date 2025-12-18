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
  // 실제 앱에서는 여기에 storyId를 이용해 백엔드에서 데이터를 가져오는 API를 호출합니다.
  // const fetchedStory = await store.fetchStory(props.storyId);
  // story.value = fetchedStory;

  // --- 개발 초기: 더미 데이터로 UI 확인 ---
  store.isLoading = true;
  await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 흉내
  story.value = {
    title: '나의 특별했던 제주 여행기',
    // v-html 디렉티브를 사용하여 HTML 태그가 포함된 문자열을 렌더링합니다.
    content: `
      <p>2023년 가을, 우리는 아름다운 섬 제주로 떠났습니다. 이번 여행은 단순한 휴가를 넘어, 가족 모두에게 잊지 못할 추억을 선물했습니다.</p>
      <img src="https://images.unsplash.com/photo-1579169825453-8d4b46ab3c3c?auto=format&fit=crop&w=1200&q=80" alt="제주 바다" class="img-fluid rounded shadow-sm my-4">
      <h3 class="mt-5 mb-3 fw-bold">첫째 날: 바다와 함께한 여유</h3>
      <p>공항에 도착하자마자 우리를 반겨준 것은 상쾌한 바다 내음이었습니다. 짐을 풀고 곧장 협재 해수욕장으로 향했습니다. 에메랄드빛 바다와 하얀 백사장이 어우러진 풍경은 그야말로 그림 같았죠.</p>
      <p>아이들은 신나게 물놀이를 즐겼고, 저희 부부는 해변을 거닐며 오랜만에 여유로운 시간을 보냈습니다. 근처 카페에서 마신 제주 당근 주스의 맛은 아직도 잊을 수 없습니다.</p>
      <img src="https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80" alt="제주 카페" class="img-fluid rounded shadow-sm my-4">
      <h3 class="mt-5 mb-3 fw-bold">마무리하며</h3>
      <p>짧은 여행이었지만, 제주의 자연 속에서 우리는 완벽한 힐링을 경험했습니다. 다음에는 또 어떤 새로운 이야기로 이곳을 찾게 될까요? 벌써부터 다음 여행이 기다려집니다.</p>
    `,
    author: '김나여기',
    createdAt: new Date().toLocaleDateString(),
  };
  store.isLoading = false;
  // ------------------------------------
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
