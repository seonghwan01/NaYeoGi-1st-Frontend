<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TheHeader from '@/views/common/TheHeader.vue'
import { useMemberStore } from './stores/members'

const route = useRoute()
const memberStore = useMemberStore()

// 앱이 시작될 때 (새로고침 시) 로그인 상태를 복원합니다.
onMounted(() => {
  memberStore.getUserInfo()
})

// 현재 경로가 랜딩 페이지인지 확인
const isLandingPage = computed(() => route.name === 'landing' || route.name === 'login')
const isWideLayout = computed(() =>
  ['attraction-select', 'attraction-plan'].includes(route.name)
)

// 배경 슬라이드 이미지 목록 (테마: 사계절 - 봄, 여름, 가을, 겨울)
const bgImages = ref([
  'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1920&q=80',
])
</script>

<template>
  <div class="position-relative">
    <!-- 전체 화면 배경 슬라이드 -->
    <div>
      <div
        id="landingCarousel"
        class="carousel slide carousel-fade position-fixed top-0 start-0 w-100 h-100"
        data-bs-ride="carousel"
        style="z-index: -2"
      >
        <div class="carousel-inner h-100">
          <div
            v-for="(image, index) in bgImages"
            :key="index"
            :class="['carousel-item', 'h-100', { active: index === 0 }]"
            :style="{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          ></div>
        </div>
      </div>
      <!-- 어두운 오버레이 -->
      <div
        class="position-fixed top-0 start-0 w-100 h-100"
        style="background-color: rgba(0, 0, 0, 0.5); z-index: -1"
      ></div>
    </div>

    <!-- 1. 헤더: 모든 페이지에 공통으로 떠있습니다. -->
    <TheHeader :is-landing="isLandingPage" />

    <!-- 2. 라우터 뷰: URL에 따라 TheLandingView.vue 또는 TheMainView.vue로 바뀝니다. -->
    <main :class="['container mt-5 pt-4', { 'container--wide': isWideLayout }]">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* 폰트 설정 (Pretendard 웹폰트) */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

body {
  font-family: 'Pretendard', sans-serif;
  margin: 0;
  padding: 0;
}

.container--wide {
  max-width: 100%;
  padding-left: 0;
  padding-right: 0;
}
</style>
