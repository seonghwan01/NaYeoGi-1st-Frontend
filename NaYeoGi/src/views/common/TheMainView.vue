<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ContentCard from '@/components/common/ContentCard.vue';
import HelpModal from '@/components/common/HelpModal.vue';

const router = useRouter();

// 캐러셀 이미지 URL 배열
const carouselImages = ref([
  "/public/img/story_image.png"
]);

const IMG_MAP = "/public/img/attraction.png";

const CATEGORY_ITEMS = [
  { key: 'attraction', label: '관광지', types: [12], accent: '#2563eb', desc: '랜드마크와 명소' },
  { key: 'food', label: '식당', types: [39], accent: '#16a34a', desc: '맛집과 로컬 음식' },
  { key: 'culture', label: '문화시설', types: [14], accent: '#7c3aed', desc: '전시·공연·문화체험' },
  { key: 'festival', label: '축제/공연/행사', types: [15, 25], accent: '#ea580c', desc: '축제·행사 한눈에' },
  { key: 'leisure', label: '레포츠', types: [28], accent: '#0ea5e9', desc: '액티비티와 레저' },
  { key: 'stay', label: '숙박', types: [32], accent: '#6366f1', desc: '편안한 숙소 찾기' },
  { key: 'shopping', label: '쇼핑', types: [38], accent: '#f59e0b', desc: '쇼핑 명소' },
];

// 페이지 이동 함수
const goStorybook = () => router.push('/my-plans'); // 추후 생성 필요
const goRecommend = () => router.push('/attraction/recommend'); // 추후 생성 필요
const goCategory = (item) => {
  router.push({
    name: 'attraction-list',
    query: { category: item.key, contentTypeId: item.types },
  });
};

// 도움말 모달 로직
const showHelpModal = ref(false);

onMounted(() => {
  const hasSeenHelp = localStorage.getItem('hasSeenHelp');
  if (!hasSeenHelp) {
    showHelpModal.value = true;
  }
});

const handleModalClose = () => {
  localStorage.setItem('hasSeenHelp', 'true');
  showHelpModal.value = false;
};
</script>

<template>
  <div class="container my-5">
    <ContentCard>
      <!-- 상단 2분할 카드 -->
      <div class="row g-4" style="height: 500px;">

        <!-- 1. AI 여행 기록 -->
        <div class="col-md-6">
          <div @click="goStorybook" class="card text-white h-100 overflow-hidden shadow-lg" role="button">
            <div id="imageCarousel" class="carousel slide carousel-fade h-100">
              <div class="carousel-inner h-100">
                <div
                  v-for="(image, index) in carouselImages"
                  :key="index"
                  :class="['carousel-item', 'h-100', { active: index === 0 }]"
                >
                  <img :src="image" class="d-block w-100 h-100" alt="Travel image" style="object-fit: cover;">
                </div>
              </div>
            </div>
            <div class="card-img-overlay d-flex flex-column justify-content-end bg-dark bg-opacity-50" style="z-index: 2;">
              <h2 class="card-title display-5 fw-bold">AI 여행 기록</h2>
              <p class="card-text fs-5">사진과 그때의 감정만 올리세요.<br>나머지는 AI 작가가 완성해드립니다.</p>
            </div>
          </div>
        </div>

        <!-- 2. AI 여행지 추천 -->
        <div class="col-md-6">
          <div @click="goRecommend" class="card text-white h-100 overflow-hidden shadow-lg">
            <img :src="IMG_MAP" class="card-img h-100" alt="Recommendation background" style="object-fit: cover;">
            <div class="card-img-overlay d-flex flex-column justify-content-end bg-dark bg-opacity-50">
              <h2 class="card-title display-5 fw-bold">AI 여행지 추천</h2>
              <p class="card-text fs-5">취향 분석을 통해<br>딱 맞는 여행 코스를 설계해드립니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 카테고리 -->
      <div class="mt-5">
        <h3 class="mb-4">카테고리별 여행지</h3>
        <div class="p-4 bg-light rounded-3 border">
          <div class="row g-3">
            <div v-for="item in CATEGORY_ITEMS" :key="item.key" class="col-6 col-md-3">
              <div class="card shadow-sm h-100 border-0" role="button" @click="goCategory(item)">
                <div class="card-body d-flex flex-column justify-content-between">
                  <div>
                    <span class="badge rounded-pill text-white" :style="{ backgroundColor: item.accent }">
                      {{ item.label }}
                    </span>
                    <h5 class="card-title mt-3 mb-0">{{ item.desc }}</h5>
                  </div>
                  <span class="text-primary fw-semibold mt-3">지도에서 보기 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentCard>

    <!-- 도움말 모달 컴포넌트 -->
    <HelpModal v-model="showHelpModal" @close="handleModalClose" />
  </div>
</template>

<style scoped>
/* Scoped styles for TheMainView.vue can be added here if needed */


</style>
