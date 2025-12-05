<script setup>
import { RouterView } from 'vue-router'
// 우리가 만든 공통 헤더 컴포넌트를 가져옵니다.
import TheHeader from '@/components/common/TheHeader.vue'
</script>

<template>
  <div>
    <!-- 1. 헤더: 모든 페이지에 공통으로 떠있습니다. -->
    <TheHeader />

    <!-- 2. 라우터 뷰: URL에 따라 TheLanding.vue 또는 TheMain.vue로 바뀝니다. -->
    <main class="container mt-5 pt-4">
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
</style>
